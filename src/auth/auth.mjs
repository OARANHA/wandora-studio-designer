import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { config } from '../config.mjs';

const COOKIE = 'wsd_s';
const sessions = new Map();
const failures = new Map();

function b64url(v) { return Buffer.from(v).toString('base64url'); }
function sign(payload) { return createHmac('sha256', config.sessionSecret || 'dev-secret-only').update(payload).digest('base64url'); }
function tokenFor(sid) { const p = b64url(JSON.stringify({ sid })); return `${p}.${sign(p)}`; }
function parseCookies(req) { return Object.fromEntries(String(req.headers.cookie || '').split(';').map(x=>x.trim()).filter(Boolean).map(v=>{const i=v.indexOf('='); return i<0?[v,'']:[v.slice(0,i),v.slice(i+1)];})); }

function verifyPassword(password) {
  if (!config.adminPasswordHash) return config.env !== 'production' && password === config.devPassword;
  const [alg, saltHex, hashHex] = config.adminPasswordHash.split(':');
  if (alg !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function loginAllowed(ip) {
  const now = Date.now(); const windowMs = 10 * 60_000;
  const arr = (failures.get(ip) || []).filter(t => now - t < windowMs);
  failures.set(ip, arr); return arr.length < 8;
}
export function recordFailure(ip) { const arr = failures.get(ip) || []; arr.push(Date.now()); failures.set(ip, arr); }
export function clearFailures(ip) { failures.delete(ip); }

export function authenticate(email, password, ip) {
  if (!loginAllowed(ip)) return { ok:false, code:'rate_limited' };
  const ok = String(email || '').trim().toLowerCase() === config.adminEmail && verifyPassword(String(password || ''));
  if (!ok) { recordFailure(ip); return { ok:false, code:'invalid' }; }
  clearFailures(ip);
  const sid = randomBytes(24).toString('base64url');
  const exp = Date.now() + config.sessionDays * 86400_000;
  sessions.set(sid, { email: config.adminEmail, exp });
  return { ok:true, sid, token: tokenFor(sid), exp };
}

export function sessionFromRequest(req) {
  const token = parseCookies(req)[COOKIE]; if (!token) return null;
  const [payload, sig] = token.split('.'); if (!payload || !sig) return null;
  const expected = sign(payload);
  const a=Buffer.from(sig), b=Buffer.from(expected); if (a.length !== b.length || !timingSafeEqual(a,b)) return null;
  let sid; try { sid = JSON.parse(Buffer.from(payload,'base64url').toString('utf8')).sid; } catch { return null; }
  const s = sessions.get(sid); if (!s || s.exp <= Date.now()) { sessions.delete(sid); return null; }
  return { ...s, sid };
}

function secureCookieFlag() { return config.env === 'production' || String(config.publicUrl).startsWith('https://') ? '; Secure' : ''; }
export function cookieHeader(token, exp) {
  const maxAge = Math.max(0, Math.floor((exp - Date.now()) / 1000));
  return `${COOKIE}=${token}; HttpOnly${secureCookieFlag()}; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
export function clearCookieHeader() { return `${COOKIE}=; HttpOnly${secureCookieFlag()}; SameSite=Lax; Path=/; Max-Age=0`; }
export function logout(req) { const s = sessionFromRequest(req); if (s) sessions.delete(s.sid); }

setInterval(() => { const now=Date.now(); for (const [sid,s] of sessions) if (s.exp<=now) sessions.delete(sid); }, 3600_000).unref();
