import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

export class HttpError extends Error {
  constructor(status, message, code = 'error') {
    super(message); this.status = status; this.code = code;
  }
}

export function sendJson(res, status, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  res.end(body);
}

export function redirect(res, location, status = 303) {
  res.writeHead(status, { location, 'cache-control': 'no-store' });
  res.end();
}

export async function readBody(req, max = 100_000) {
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) throw new HttpError(413, 'Conteúdo grande demais.', 'payload_too_large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function readJson(req, max = 100_000) {
  const raw = await readBody(req, max);
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch { throw new HttpError(400, 'JSON inválido.', 'bad_json'); }
}

export async function readForm(req, max = 20_000) {
  const raw = await readBody(req, max);
  return Object.fromEntries(new URLSearchParams(raw));
}

const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8' };
export async function serveStatic(res, root, pathname) {
  const rel = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
  const file = join(root, rel || 'index.html');
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': extname(file)==='.html' ? 'no-cache' : 'public, max-age=300', 'x-content-type-options':'nosniff' });
    res.end(body); return true;
  } catch { return false; }
}

export function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}
