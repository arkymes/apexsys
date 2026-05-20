export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';

export const GEMINI_FLASH_LATEST_MODEL = 'gemini-3.5-flash';

export const GEMINI_PRO_LATEST_MODEL = 'gemini-3.1-pro-preview';

export const GEMINI_MODEL_OPTIONS: Array<{ value: string; label: string }> = [
  {
    value: DEFAULT_GEMINI_MODEL,
    label: 'Gemini 3.1 Flash-Lite (padrao)',
  },
  {
    value: GEMINI_FLASH_LATEST_MODEL,
    label: 'Flash Latest (Gemini 3.5 Flash)',
  },
  {
    value: GEMINI_PRO_LATEST_MODEL,
    label: 'Pro Latest (Gemini 3.1 Pro Preview)',
  },
  {
    value: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
  },
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
  },
];

export const normalizeGeminiModel = (value: unknown): string => {
  if (typeof value !== 'string') return DEFAULT_GEMINI_MODEL;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_GEMINI_MODEL;
  return trimmed.startsWith('models/') ? trimmed.slice('models/'.length) : trimmed;
};
