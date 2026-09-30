import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';

export async function jevDecide({ state, questions, model, signal }) {
  if (!config.jev.apiKey) throw new HttpError(503, 'Jev ainda não está configurado neste ambiente.', 'jev_not_configured');
  if (!state || !questions || typeof questions !== 'object' || Array.isArray(questions)) throw new HttpError(400, 'state e questions são obrigatórios.', 'bad_request');
  const ids = Object.keys(questions);
  if (!ids.length || ids.length > 160) throw new HttpError(400, 'questions precisa ter entre 1 e 160 perguntas.', 'bad_request');

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, config.jev.timeoutMs);
  const onExternalAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) onExternalAbort();
    else signal.addEventListener('abort', onExternalAbort, { once:true });
  }

  try {
    const body = { state, questions, ...(model || config.jev.model ? { model: model || config.jev.model } : {}) };
    const r = await fetch(`${config.jev.baseUrl}/v1/systemone`, {
      method:'POST', signal:controller.signal,
      headers:{ authorization:`Bearer ${config.jev.apiKey}`, 'content-type':'application/json' },
      body:JSON.stringify(body),
    });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = null; }
    if (!r.ok) throw new HttpError(r.status === 429 ? 429 : 502, data?.detail || data?.error?.message || `Falha do Jev (${r.status}).`, r.status===429?'jev_rate_limited':'jev_upstream');
    if (!data?.answers) throw new HttpError(502, 'O Jev respondeu sem answers.', 'jev_bad_response');
    return data;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    if (e?.name === 'AbortError') {
      if (signal?.aborted && !timedOut) throw new HttpError(499, 'Requisição cancelada.', 'request_cancelled');
      throw new HttpError(504, 'O Jev demorou além do limite.', 'jev_timeout');
    }
    throw new HttpError(502, 'Não foi possível falar com o Jev.', 'jev_network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onExternalAbort);
  }
}
