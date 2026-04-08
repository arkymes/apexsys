'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, X, Loader2, Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeExerciseVideo } from '@/lib/videoAnalysisService';
import { useAppStore } from '@/store/useAppStore';
import type { Quest } from '@/types';
import ReactMarkdown from 'react-markdown';

interface VideoFormAnalysisProps {
  quest: Quest;
  onClose: () => void;
}

const MAX_VIDEO_SIZE_MB = 20;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export function VideoFormAnalysis({ quest, onClose }: VideoFormAnalysisProps) {
  const user = useAppStore((s) => s.user);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Selecione um arquivo de vídeo válido.');
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setError(`Vídeo muito grande. Máximo: ${MAX_VIDEO_SIZE_MB}MB. Grave vídeos curtos (10-30s).`);
      return;
    }

    setError(null);
    setVideoFile(file);
    setAnalysis(null);

    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  }, []);

  const handleRemoveVideo = useCallback(() => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setAnalysis(null);
    setError(null);
  }, [videoPreviewUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile || !user) return;

    const apiKey = user.geminiApiKey || useAppStore.getState().geminiApiKey;
    if (!apiKey) {
      setError('Chave da API Gemini não configurada.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const buffer = await videoFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const videoBase64 = btoa(binary);

      const result = await analyzeExerciseVideo({
        apiKey,
        videoBase64,
        mimeType: videoFile.type,
        quest,
        userProfile: {
          debuffs: user.debuffs || [],
          bioData: user.bioData,
          bio: user.bio,
          fitnessLevel: user.fitnessLevel,
          objective: user.objective,
          height: user.height,
          weight: user.weight,
          age: user.age,
          skillConstraints: user.skillConstraints,
          rank: user.rank,
        },
      });

      if (result.error) {
        setError(result.error);
      } else {
        setAnalysis(result.analysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao analisar vídeo.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoFile, user, quest]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-shadow-800 border border-white/10 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
              <Video className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Análise de Forma</h3>
              <p className="text-white/40 text-xs">{quest.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Video Input Area */}
          {!videoFile && !analysis && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-neon-blue/40 transition-colors">
                <Video className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-1">
                  Grave ou envie um vídeo executando o exercício
                </p>
                <p className="text-white/30 text-xs mb-4">
                  Máx. {MAX_VIDEO_SIZE_MB}MB · 10-30 segundos ideal
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Gravar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Galeria
                  </Button>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </div>
          )}

          {/* Video Preview */}
          {videoFile && videoPreviewUrl && !analysis && (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full max-h-64 object-contain"
                  playsInline
                />
                {!isAnalyzing && (
                  <button
                    onClick={handleRemoveVideo}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-500/60 transition-colors text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-3 bg-neon-blue/5 border border-neon-blue/20 rounded-lg">
                <p className="text-neon-blue text-xs uppercase tracking-wider mb-1">Exercício</p>
                <p className="text-white/80 text-sm font-display">{quest.name}</p>
                <p className="text-white/50 text-xs mt-1">
                  {quest.sets}x{quest.reps} · {quest.difficulty}
                </p>
              </div>

              {/* User profile context indicator */}
              {user?.debuffs && user.debuffs.length > 0 && (
                <div className="p-3 bg-amber-500/5 border border-amber-400/20 rounded-lg">
                  <p className="text-amber-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Condições ativas consideradas
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {user.debuffs.map((d) => (
                      <span
                        key={d.id}
                        className="px-2 py-0.5 text-[10px] rounded border border-amber-400/30 bg-amber-400/10 text-amber-200"
                      >
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando movimento...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Enviar para Análise IA
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="py-6 text-center">
              <Loader2 className="w-8 h-8 text-neon-blue animate-spin mx-auto mb-3" />
              <p className="text-white/60 text-sm">SYSTEM CORE analisando biomecânica...</p>
              <p className="text-white/30 text-xs mt-1">
                Cruzando dados do seu perfil e condições
              </p>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-display text-sm uppercase">
                  Análise Completa
                </span>
              </div>

              <div className="prose prose-invert prose-sm max-w-none p-4 bg-shadow-700/50 rounded-lg border border-white/10 
                [&_h2]:text-neon-blue [&_h2]:font-display [&_h2]:text-base [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:first:mt-0
                [&_h3]:text-white/90 [&_h3]:font-display [&_h3]:text-sm [&_h3]:mb-1.5 [&_h3]:mt-3
                [&_p]:text-white/70 [&_p]:text-sm [&_p]:mb-2
                [&_li]:text-white/70 [&_li]:text-sm [&_li]:mb-1
                [&_ul]:mb-2 [&_ol]:mb-2
                [&_strong]:text-white/90
              ">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleRemoveVideo}
                  variant="secondary"
                  className="flex-1"
                >
                  Novo Vídeo
                </Button>
                <Button
                  onClick={onClose}
                  variant="primary"
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
