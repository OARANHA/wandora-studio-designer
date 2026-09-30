import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';

export async function nvidiaChat({ messages, model, temperature = 0.7, top_p = 0.9, max_tokens = 900, stream = false, signal }) {
  if (!config.nvidia.apiKey) throw new HttpError(503, 'NVIDIA API ainda não está configurada neste ambiente.', 'nvidia_not_configured');
  if (!Array.isArray(messages) || !messages.length) throw new HttpError(400, 'messages é obrigatório.', 'bad_request');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.nvidia.timeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once:true });
  try {
    const r = await fetch(`${config.nvidia.baseUrl}/chat/completions`, {
      method:'POST', signal:controller.signal,
      headers:{ authorization:`Bearer ${config.nvidia.apiKey}`, 'content-type':'application/json' },
      body:JSON.stringify({ model:model || config.nvidia.model, messages, temperature, top_p, max_tokens, stream }),
    });
    if (!r.ok) {
      const t = await r.text(); let d; try { d=JSON.parse(t); } catch {}
      throw new HttpError(r.status===429?429:502, d?.error?.message || `Falha da NVIDIA (${r.status}).`, r.status===429?'nvidia_rate_limited':'nvidia_upstream');
    }
    if (stream) return r;
    return await r.json();
  } catch (e) {
    if (e instanceof HttpError) throw e;
    if (e?.name==='AbortError') throw new HttpError(504, 'A NVIDIA demorou além do limite.', 'nvidia_timeout');
    throw new HttpError(502, 'Não foi possível falar com a NVIDIA.', 'nvidia_network');
  } finally { if (!stream) clearTimeout(timer); else timer.unref?.(); }
}
