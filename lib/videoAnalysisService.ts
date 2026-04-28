import { GoogleGenAI } from '@google/genai';
import type { UserProfile, Quest } from '@/types';
import { recordApiCall, resolveTokenCount } from '@/lib/engineUsageTracker';

export interface VideoAnalysisRequest {
  apiKey: string;
  videoBase64: string;
  mimeType: string;
  quest: Quest;
  userProfile: Pick<
    UserProfile,
    | 'debuffs'
    | 'bioData'
    | 'bio'
    | 'fitnessLevel'
    | 'objective'
    | 'height'
    | 'weight'
    | 'age'
    | 'skillConstraints'
    | 'rank'
  >;
}

export interface VideoAnalysisResult {
  analysis: string;
  error?: string;
}

export async function analyzeExerciseVideo(
  request: VideoAnalysisRequest
): Promise<VideoAnalysisResult> {
  const { apiKey, videoBase64, mimeType, quest, userProfile } = request;

  const ai = new GoogleGenAI({ apiKey });

  const debuffsText =
    userProfile.debuffs?.length > 0
      ? userProfile.debuffs
          .map((d) => `- ${d.name}: ${d.description} (afeta: ${d.affectedExercises.join(', ')})`)
          .join('\n')
      : 'Nenhum debuff/limitacao registrado.';

  const constraintsText =
    userProfile.skillConstraints && Object.keys(userProfile.skillConstraints).length > 0
      ? Object.values(userProfile.skillConstraints)
          .filter((c) => c.status === 'disabled')
          .map((c) => `- ${c.skillId}: ${c.reason} (${c.condition || 'sem detalhe'})`)
          .join('\n') || 'Nenhuma restricao ativa.'
      : 'Nenhuma restricao ativa.';

  const prompt = `
Voce e um analista de movimento e biomecânica do APEXSYS.
Analise o video do usuario executando o exercicio abaixo e forneça correções detalhadas.

EXERCICIO SENDO EXECUTADO:
- Nome: ${quest.name}
- Pilar: ${quest.pillar}
- Series x Reps: ${quest.sets}x${quest.reps}
- Dificuldade: ${quest.difficulty}
- Guia de Execução: ${quest.executionGuide || quest.description}

PERFIL DO USUARIO:
- Rank: ${userProfile.rank}
- Nivel: ${userProfile.fitnessLevel}
- Objetivo: ${userProfile.objective}
- Altura: ${userProfile.height}cm | Peso: ${userProfile.weight}kg | Idade: ${userProfile.age} anos
- Bio: ${userProfile.bioData || userProfile.bio || 'N/A'}

DEBUFFS/LESOES/LIMITACOES ATIVAS:
${debuffsText}

RESTRICOES DE SKILLS (condicoes clinicas):
${constraintsText}

INSTRUCOES DE ANALISE:
1. Avalie a FORMA e TECNICA do exercicio no video.
2. Identifique erros de postura, amplitude, ritmo, alinhamento.
3. CRUZAR com os debuffs e restricoes do usuario:
   - Se ele tem acromio tipo 2, verifique se a posicao do ombro esta segura.
   - Se tem dor no joelho, verifique o alinhamento e angulo.
   - Aplique isso para QUALQUER condicao registrada.
4. De dicas PRATICAS e ESPECIFICAS para correcao.
5. Alerte sobre riscos de lesao baseados no perfil.
6. Sugira variacoes mais seguras se necessario.

FORMATO DE RESPOSTA (use markdown):
## Analise de Forma - [Nome do Exercicio]

### Pontos Positivos
- ...

### Correcoes Necessarias
- ...

### Alertas de Seguranca (baseado no seu perfil)
- ...

### Dicas para Melhorar
- ...

### Variações Recomendadas (se aplicavel)
- ...

Seja direto, tecnico e objetivo. Use linguagem de coaching esportivo.
  `.trim();

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: videoBase64 } },
              { text: prompt },
            ],
          },
        ],
        config: {
          temperature: 0.4,
        },
      });

      const text = result.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .filter(Boolean)
        .join('');

      recordApiCall(resolveTokenCount((result as any)?.usageMetadata, text));

      if (text) {
        return { analysis: text };
      }
    } catch (e) {
      console.warn(`Video analysis: model ${model} failed`, e);
      lastError = e;
    }
  }

  return {
    analysis: '',
    error:
      lastError instanceof Error
        ? lastError.message
        : 'Nenhum modelo conseguiu analisar o video. Tente novamente.',
  };
}
