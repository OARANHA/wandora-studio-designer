import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config, assertProductionConfig } from './config.mjs';
import { HttpError, clientIp, readForm, readJson, redirect, sendJson, serveStatic } from './lib/http.mjs';
import { authenticate, clearCookieHeader, cookieHeader, logout, sessionFromRequest } from './auth/auth.mjs';
import { jevDecide } from './ai/jev.mjs';
import { nvidiaChat } from './ai/nvidia.mjs';
import { UNDERSTANDING } from './questions/understanding.mjs';

assertProductionConfig();
const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(here, '..', 'public');

function loginPage(error = '') {
  const msg = error === 'limite' ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' : error ? 'E-mail ou senha incorretos.' : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Entrar · Wandora Studio Designer</title><link rel="stylesheet" href="/studio.css"></head><body class="login-body"><main class="login-wrap"><section class="login-card"><img src="/assets/wandora-logo.png" alt="Wandora" class="login-logo"><div class="eyebrow">STUDIO DESIGNER VIGIA</div><h1>Entre no Studio</h1><p class="login-lead">Seu estúdio inteligente para transformar um briefing em marca, site e materiais de campanha.</p>${msg?`<div class="login-alert" role="alert">${msg}</div>`:''}<form method="post" action="/login"><label>E-mail<input type="email" name="email" autocomplete="username" required autofocus></label><label>Senha<input type="password" name="password" autocomplete="current-password" required></label><button class="key key-primary" type="submit">ENTRAR NO STUDIO</button></form><footer>Ambiente privado · sessão protegida · HTTPS</footer></section><div class="login-console" aria-hidden="true"><i></i><i></i><i></i><div class="vu"><span></span></div></div></main></body></html>`;
}

function requireAuth(req, res) {
  const s = sessionFromRequest(req);
  if (s) return s;
  const wantsHtml = String(req.headers.accept || '').includes('text/html');
  if (req.method === 'GET' && wantsHtml) redirect(res, '/login?next=' + encodeURIComponent(new URL(req.url, config.publicUrl).pathname), 302);
  else sendJson(res, 401, { ok:false, error:'Acesso restrito.', code:'unauthorized' });
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, config.publicUrl);
    const path = decodeURIComponent(url.pathname);
    res.setHeader('x-robots-tag','noindex, nofollow');
    res.setHeader('x-content-type-options','nosniff');
    res.setHeader('referrer-policy','strict-origin-when-cross-origin');

    if (path === '/healthz') return sendJson(res, 200, { ok:true, app:'wandora-studio-designer', version:'0.1.0' });
    if (path === '/studio.css' || path.startsWith('/assets/')) { const ok=await serveStatic(res, PUBLIC, path); if(ok)return; }
    if (path === '/login' && req.method === 'GET') {
      if (sessionFromRequest(req)) return redirect(res, '/');
      res.writeHead(200, {'content-type':'text/html; charset=utf-8','cache-control':'no-store'}); return res.end(loginPage(url.searchParams.get('erro') || ''));
    }
    if (path === '/login' && req.method === 'POST') {
      const form=await readForm(req); const ip=clientIp(req); const a=authenticate(form.email,form.password,ip);
      if (!a.ok) return redirect(res, `/login?erro=${a.code==='rate_limited'?'limite':'1'}`);
      res.setHeader('set-cookie', cookieHeader(a.token,a.exp)); return redirect(res, '/');
    }
    if (path === '/logout') { logout(req); res.setHeader('set-cookie', clearCookieHeader()); return redirect(res,'/login'); }

    const session = requireAuth(req,res); if(!session) return;
    if (path === '/api/auth/me') return sendJson(res,200,{ok:true,user:{email:session.email}});
    if (path === '/api/config') return sendJson(res,200,{ok:true,domain:config.publicUrl,providers:{jev:{configured:!!config.jev.apiKey,base_url:config.jev.baseUrl,model:config.jev.model||null},nvidia:{configured:!!config.nvidia.apiKey,base_url:config.nvidia.baseUrl,model:config.nvidia.model}},groups:{entender:10,site:28,marca:8,posts:22,email:14,anuncios:7},total:89});
    if (path === '/api/decide/understanding' && req.method === 'POST') {
      const body=await readJson(req,20_000); const text=String(body.texto||'').replace(/\s+/g,' ').trim();
      if (text.split(/\s+/).length < 2) throw new HttpError(400,'Descreva o negócio com pelo menos algumas palavras.','text_too_short');
      const state={fala_da_pessoa:texto.slice(-1500),contexto:'Briefing em português de uma pessoa descrevendo o próprio negócio para criação de site, identidade visual, carrosséis, e-mail e anúncios. Se houver correção ou mudança de ideia, vale o que foi dito por último.'};
      const started=Date.now(); const result=await jevDecide({state,questions:UNDERSTANDING});
      return sendJson(res,200,{ok:true,answers:result.answers,model:result.model,usage:result.usage,ms:Date.now()-started});
    }
   if (path === '/api/text/generate' && req.method === 'POST') {
      const body=await readJson(req,80_000);
      const messages=Array.isArray(body.messages)?body.messages:null;
      const upstream=await nvidiaChat({messages,model:body.model,temperature:body.temperature,top_p:body.top_p,max_tokens:body.max_tokens,stream:false});
      return sendJson(res,200,{ok:true,model:upstream.model,choices:upstream.choices,usage:upstream.usage});
    }
    if (path === '/' || path === '/index.html' || path === '/studio.js') { const target = path === '/' ? '/index.html' : path; if (await serveStatic(res,PUBLIC,target)) return; }
    sendJson(res,404,{ok:false,error:'Não encontrado.',code:'not_found'});
  } catch (e) {
    const status=e instanceof HttpError?e.status:500;
    if(status===500) console.error(e);
    sendJson(res,status,{ok:false,error:e?.message||'Erro interno.',code:e?.code||'internal_error'});
  }
});

server.listen(config.port,'0.0.0.0',()=>console.log(`[studio] http://0.0.0.0:${config.port} (${config.env})`));
