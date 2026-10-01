const int = (name, fallback, min = 1, max = Number.MAX_SAFE_INTEGER) => {
  const n = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
};

export const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: int('PORT', 3210, 1, 65535),
  publicUrl: process.env.PUBLIC_URL || 'http://127.0.0.1:3210',
  dataDir: process.env.DATA_DIR || (process.env.NODE_ENV === 'production' ? '/app/data' : './data-runtime'),
  sessionDays: int('SESSION_DAYS', 30, 1, 365),
  sessionSecret: process.env.SESSION_SECRET || '',
  adminEmail: (process.env.STUDIO_ADMIN_EMAIL || 'admin@wandora.local').trim().toLowerCase(),
  adminPasswordHash: process.env.STUDIO_ADMIN_PASSWORD_HASH || '',
  devPassword: process.env.STUDIO_DEV_PASSWORD || 'wandora-dev-only',
  jev: {
    baseUrl: (process.env.JEV_BASE_URL || 'https://api.typesafe.ai').replace(/\/$/, ''),
    [REDACTED] || '',
    model: process.env.JEV_MODEL || 'jev-latest',
    timeoutMs: int('JEV_TIMEOUT_MS', 20_000, 1_000, 60_000),
  },
  nvidia: {
    baseUrl: (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, ''),
    [REDACTED] || '',
    model: process.env.NVIDIA_MODEL || 'openai/gpt-oss-20b',
    timeoutMs: int('NVIDIA_TIMEOUT_MS', 120_000, 5_000, 180_000),
  },
  chutes: {
    baseUrl: (process.env.CHUTES_BASE_URL || 'https://llm.chutes.ai/v1').replace(/\/$/, ''),
    [REDACTED] || '',
    timeoutMs: int('CHUTES_TIMEOUT_MS', 60_000, 5_000, 180_000),
    imageUrl: (process.env.CHUTES_IMAGE_URL || 'https://vonkaiser-qwen-image-2512.chutes.ai/generate').trim(),
    imageModel: (process.env.CHUTES_IMAGE_MODEL || 'Qwen/Qwen-Image-2512').trim(),
    videoUrl: (process.env.CHUTES_VIDEO_URL || 'https://vonkaiser-ltx-23-video.chutes.ai/generate').trim(),
    videoModel: (process.env.CHUTES_VIDEO_MODEL || 'LTX-2.3-Video').trim(),
  },
  speech: {
    baseUrl: (process.env.STT_BASE_URL || 'http://studio-asr:8000').replace(/\/$/, ''),
    model: process.env.STT_MODEL || 'Systran/faster-whisper-base',
    language: process.env.STT_LANGUAGE || 'pt',
    timeoutMs: int('STT_TIMEOUT_MS', 180_000, 5_000, 300_000),
  },
});

export function assertProductionConfig() {
  if (config.env !== 'production') return;
  const missing = [];
  if (!config.adminPasswordHash) missing.push('STUDIO_ADMIN_PASSWORD_HASH');
  if (config.sessionSecret.length < 32) missing.push('SESSION_SECRET (>=32 chars)');
  if (missing.length) throw new Error(`Configuração de produção ausente: ${missing.join(', ')}`);
}
