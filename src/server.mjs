import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config, assertProductionConfig } from './config.mjs';
import { HttpError, clientIp, readBuffer, readForm, readJson, redirect, sendJson, serveStatic } from './lib/http.mjs';
import { authenticate, clearCookieHeader, cookieHeader, logout, sessionFromRequest } from './auth/auth.mjs';
import { jevDecide } from './ai/jev.mjs';
import { nvidiaChat, nvidiaStream } from './ai/nvidia.mjs';
import { transcribeWav } from './ai/speech.mjs';
import { listModels, modelTasks, routeModel } from './ai/model-registry.mjs';
import { chutesChat, chutesStream } from './ai/chutes.mjs';
import { chutesMediaCapabilities, editChutesImage, generateChutesImage, generateChutesVideo, segmentChutesImage } from './ai/chutes-media.mjs';
import { routeMediaWorker } from './ai/media-router.mjs';
import { buildWriterMessages, parseWriterFields, writerComplete, WRITER_MAX_TOKENS } from './ai/writer.mjs';
import { QUESTION_GROUPS, GROUP_META, QUESTION_META, QUESTION_TOTAL } from './questions/catalog.mjs';
import { createProject, createVersion, getProject, getVersion, listProjects, listVersions, projectLimits, updateProject } from './store/projects.mjs';
import { assetLimits, deleteAsset, listAssets, putAsset, readAsset } from './store/assets.mjs';
import { ROUTE_QUESTIONS, TARGETS, commandQuestions, commandState, routeResult, routeState } from './commands/router.mjs';
import { routeSiteStructure } from './v2/site-structure.mjs';
import { planCreativeProject } from './creative/creative-plan.mjs';
import { buildStudioContext } from './creative/studio-context.mjs';

assertProductionConfig();
const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(here, '..', 'public');


function loginPage(error = '') {
  const msg = error === 'limite' ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' : error ? 'E-mail ou senha incorretos.' : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#090a09"><title>Entrar · Wandora Studio Designer</title><link rel="stylesheet" href="/studio.css?v=20261001-approvedhero1"></head>
  <body class="login-body">
    <main class="login-shell">
      <section class="login-hero login-hero-approved" aria-hidden="true">
        <img class="login-hero-image" src="/assets/wandora-login-hero.png?v=20261001-approved1" alt="">
      </section>
      <section class="login-panel">
        <div class="login-lang">◎&nbsp; Português (BR) &nbsp;⌄</div>
        <div class="login-window-dots" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="login-brand-plate"><img src="/brand/logo.webp" alt="Wandora"></div>
        <div class="login-product">STUDIO DESIGNER</div>
        <div class="login-accent"></div>
        <h1>Entrar no<br><strong>Studio Designer</strong></h1>
        <p class="login-lead">Crie materiais de marketing incríveis com o poder da IA e da sua voz.</p>
        ${msg?`<div class="login-alert" role="alert">${msg}</div>`:''}
        <form method="post" action="/login">
          <label>E-mail<input type="email" name="email" autocomplete="username" placeholder="seu@e-mail.com" required autofocus></label>
          <label>Senha<input type="password" name="password" autocomplete="current-password" placeholder="Sua senha" required></label>
          <button class="login-submit" type="submit"><span>Entrar no Studio Designer</span><b aria-hidden="true">→</b></button>
        </form>
        <footer>🔒 Acesso restrito à equipe Wandora</footer>
      </section>
    </main>
  </body></html>`;
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
    res.setHeader('permissions-policy','microphone=(self), on-device-speech-recognition=(self)');
    res.setHeader('content-security-policy', "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");

    if (path === '/healthz') return sendJson(res, 200, { ok:true, app:'wandora-studio-designer', version:'0.1.0' });
    if (path === '/brand/login.webp' || path === '/brand/logo.webp') {
      const name=path.endsWith('login.webp')?'login.webp':'logo.webp';
      try{
        const body=await readFile(join(config.dataDir,'branding',name));
        res.writeHead(200,{'content-type':'image/webp','content-length':body.length,'cache-control':'public, max-age=86400, immutable','x-content-type-options':'nosniff'});
        return res.end(body);
      }catch{
        return sendJson(res,404,{ok:false,error:'Brand asset ausente.',code:'brand_asset_missing'});
      }
    }
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
    if (path === '/api/questions') {
      const questions=Object.fromEntries(Object.entries(QUESTION_GROUPS).map(([group,items])=>[group,Object.fromEntries(Object.entries(items).map(([id,q])=>[id,{label:QUESTION_META[id]?.label||id,type:q.type,instructions:q.instructions||'',options:q.type==='choice'?q.criteria:q.type==='score'?q.criteria:null}]))]));
      return sendJson(res,200,{ok:true,groups:GROUP_META,questions,targets:TARGETS,total:QUESTION_TOTAL});
    }
    if (path === '/api/config') return sendJson(res,200,{ok:true,domain:config.publicUrl,providers:{jev:{configured:!!config.jev.apiKey,base_url:config.jev.baseUrl,model:config.jev.model||null},nvidia:{configured:!!config.nvidia.apiKey,base_url:config.nvidia.baseUrl,model:config.nvidia.model},chutes:{configured:!!config.chutes.apiKey,base_url:config.chutes.baseUrl,image:!!(config.chutes.imageFastUrl||config.chutes.imageQualityUrl||config.chutes.imageStyleUrl),video:!!config.chutes.videoUrl,media:chutesMediaCapabilities()},speech:{configured:true,base_url:config.speech.baseUrl,model:config.speech.model,language:config.speech.language}},groups:Object.fromEntries(Object.entries(GROUP_META).map(([id,g])=>[id,g.count])),total:QUESTION_TOTAL,v2:true});
    if (path === '/api/models' && req.method === 'GET') {
      const refresh=url.searchParams.get('refresh')==='1';
      const models=await listModels({refresh});
      return sendJson(res,200,{ok:true,tasks:modelTasks(),models});
    }
    if (path === '/api/models/route' && req.method === 'POST') {
      const body=await readJson(req,30_000);
      const routed=await routeModel({
        task:String(body.task||'copy'),
        mode:String(body.mode||'auto'),
        preferredKey:String(body.preferredKey||''),
        context:String(body.context||'').slice(0,1200),
      });
      return sendJson(res,200,{ok:true,...routed});
    }
    if (path === '/api/projects' && req.method === 'GET') return sendJson(res,200,{ok:true,projects:await listProjects(session.email),limits:projectLimits});
    if (path === '/api/projects' && req.method === 'POST') {
      const body=await readJson(req,30_000);
      const project=await createProject({owner:session.email,name:body.name,clientName:body.clientName,briefing:body.briefing});
      return sendJson(res,201,{ok:true,project});
    }
    const projectMatch=path.match(/^\/api\/projects\/([0-9a-f-]{36})$/i);
    if (projectMatch && req.method === 'GET') return sendJson(res,200,{ok:true,project:await getProject(session.email,projectMatch[1])});
    if (projectMatch && (req.method === 'PATCH' || req.method === 'POST')) {
      const body=await readJson(req,30_000); const project=await updateProject(session.email,projectMatch[1],body);
      return sendJson(res,200,{ok:true,project});
    }
    const assetsMatch=path.match(/^\/api\/projects\/([0-9a-f-]{36})\/assets$/i);
    if (assetsMatch && req.method === 'GET') {
      return sendJson(res,200,{ok:true,assets:await listAssets(session.email,assetsMatch[1]),limits:assetLimits});
    }
    if (assetsMatch && req.method === 'POST') {
      const contentType=String(req.headers['content-type']||'').split(';')[0].trim().toLowerCase();
      const role=String(req.headers['x-asset-role']||'reference').trim();
      let name='arquivo';
      try{name=decodeURIComponent(String(req.headers['x-file-name']||'arquivo'));}catch{}
      const body=await readBuffer(req,assetLimits.bytes+1);
      const asset=await putAsset({owner:session.email,projectId:assetsMatch[1],role,originalName:name,contentType,buffer:body});
      return sendJson(res,201,{ok:true,asset});
    }
    const assetItemMatch=path.match(/^\/api\/projects\/([0-9a-f-]{36})\/assets\/([0-9a-f-]{36})$/i);
    if (assetItemMatch && req.method === 'DELETE') {
      await deleteAsset(session.email,assetItemMatch[1],assetItemMatch[2]);
      return sendJson(res,200,{ok:true});
    }
    const assetContentMatch=path.match(/^\/api\/projects\/([0-9a-f-]{36})\/assets\/([0-9a-f-]{36})\/content$/i);
    if (assetContentMatch && req.method === 'GET') {
      const {asset,body}=await readAsset(session.email,assetContentMatch[1],assetContentMatch[2]);
      res.writeHead(200,{'content-type':asset.contentType,'content-length':body.length,'cache-control':'private, max-age=300','x-content-type-options':'nosniff'});
      return res.end(body);
    }
    const versionsMatch=path.match(/^\/api\/projects\/([0-9a-f-]{36})\/versions$/i);
    if (versionsMatch && req.method === 'GET') return sendJson(res,200,{ok:true,versions:await listVersions(session.email,versionsMatch[1])});
    if (versionsMatch && req.method === 'POST') {
      const body=await readJson(req,700_000); const version=await createVersion(session.email,versionsMatch[1],body);
      return sendJson(res,201,{ok:true,version});
    }
    const versionMatch=path.match(/^\/api\/projects\/([0-9a-f-]{36})\/versions\/([0-9a-f-]{36})$/i);
    if (versionMatch && req.method === 'GET') return sendJson(res,200,{ok:true,version:await getVersion(session.email,versionMatch[1],versionMatch[2])});
    if (path === '/api/rota' && req.method === 'POST') {
      const body=await readJson(req,20_000);
      const ultima=String(body.ultima||body.comando||'').replace(/\s+/g,' ').trim().slice(0,400);
      if(ultima.split(/\s+/).filter(Boolean).length<2) throw new HttpError(400,'Frase curta demais.','route_too_short');
      const started=Date.now();
      const result=await jevDecide({state:routeState(ultima),questions:ROUTE_QUESTIONS});
      const route=routeResult(result.answers);
      return sendJson(res,200,{ok:true,ultima,...route,latency_ms:Date.now()-started,model:result.model||null,usage:result.usage||null,_jev:result.answers});
    }
    if (path === '/api/comando' && req.method === 'POST') {
      const body=await readJson(req,120_000);
      const comando=String(body.comando||'').replace(/\s+/g,' ').trim().slice(0,400);
      if(comando.split(/\s+/).filter(Boolean).length<2) throw new HttpError(400,'Diga ou digite o que quer mudar (ex.: “muda o logo pra ficar tipo selo”).','command_too_short');
      const descricao=String(body.descricao||'').replace(/\s+/g,' ').trim().slice(0,1500);
      const started=Date.now(), trace=[];
      let tipo=String(body.tipo||''), alvo=String(body.alvo||''), p_tipo=Number(body.p_tipo)||0, p_alvo=Number(body.p_alvo)||0;
      const validType=['descrever_negocio','comando_de_edicao','desfazer','fixar','outra'].includes(tipo);
      const validTarget=[...Object.keys(TARGETS),'tudo','nenhum'].includes(alvo);
      if(!validType||!validTarget){
        const routed=await jevDecide({state:routeState(comando),questions:ROUTE_QUESTIONS});
        const rr=routeResult(routed.answers); tipo=rr.tipo;alvo=rr.alvo;p_tipo=rr.p_tipo;p_alvo=rr.p_alvo;
        trace.push({kind:'rota',model:routed.model||null,usage:routed.usage||null,answers:routed.answers});
      }
      if(tipo!=='comando_de_edicao'){
        return sendJson(res,200,{ok:true,tipo,alvo,p_tipo,p_alvo,answers:null,modo:'nenhum',ajustes:[],answers_ajuste:null,latency_ms:Date.now()-started,_jev:trace});
      }
      if(!TARGETS[alvo]){
        return sendJson(res,200,{ok:true,tipo,alvo,p_tipo,p_alvo,answers:null,modo:alvo==='tudo'?'biblioteca':'nenhum',ajustes:[],answers_ajuste:null,latency_ms:Date.now()-started,_jev:trace});
      }
      const atuaisRaw=body.atuais&&typeof body.atuais==='object'&&!Array.isArray(body.atuais)?body.atuais:{};
      const atuais=Object.fromEntries(TARGETS[alvo].map(id=>[id,String(atuaisRaw[id]??'?').slice(0,80)]));
      const questions=commandQuestions(alvo,atuais);
      const decided=await jevDecide({state:commandState(descricao,comando,atuais),questions});
      trace.push({kind:'decisao',model:decided.model||null,usage:decided.usage||null,answers:decided.answers});
      return sendJson(res,200,{ok:true,tipo,alvo,p_tipo,p_alvo,answers:decided.answers,modo:'biblioteca',ajustes:[],answers_ajuste:null,latency_ms:Date.now()-started,_jev:trace});
    }

    if (path === '/api/v2/site-command' && req.method === 'POST') {
      const body=await readJson(req,40_000);
      const command=String(body.command||body.comando||'').replace(/\s+/g,' ').trim().slice(0,500);
      if(command.split(/\s+/).filter(Boolean).length<2) throw new HttpError(400,'Comando estrutural curto demais.','structure_command_too_short');
      const result=await routeSiteStructure({command,briefing:String(body.briefing||'').slice(0,2000),current:body.current&&typeof body.current==='object'?body.current:{}});
      return sendJson(res,200,{ok:true,...result});
    }
    if (path === '/api/decide/understanding' && req.method === 'POST') {
      const body=await readJson(req,20_000); const text=String(body.texto||'').replace(/\s+/g,' ').trim();
      if (text.split(/\s+/).length < 2) throw new HttpError(400,'Descreva o negócio com pelo menos algumas palavras.','text_too_short');
      const state={fala_da_pessoa:text.slice(-1500),contexto:'Briefing em português de uma pessoa descrevendo o próprio negócio para criação de site, identidade visual, carrosséis, e-mail e anúncios. Se houver correção ou mudança de ideia, vale o que foi dito por último.'};
      const started=Date.now(); const result=await jevDecide({state,questions:QUESTION_GROUPS.entender});
      return sendJson(res,200,{ok:true,answers:result.answers,model:result.model,usage:result.usage,ms:Date.now()-started});
    }
    if (path === '/api/decidir' && req.method === 'POST') {
      const body=await readJson(req,30_000); const text=String(body.texto||'').replace(/\s+/g,' ').trim();
      if (text.split(/\s+/).length < 2) throw new HttpError(400,'Descreva o negócio com pelo menos algumas palavras.','text_too_short');
      const seq=Number.isFinite(Number(body.seq))?Number(body.seq):0;
      const state={fala_da_pessoa:text.slice(-1500),contexto:'Transcrição de voz ao vivo (pode estar incompleta e sem pontuação) de uma pessoa descrevendo o próprio negócio. Com base nela vamos criar site, identidade visual, carrosséis de Instagram, e-mail marketing (template e assinatura) e anúncios de display. Se a pessoa mudar de ideia ou corrigir algo no meio da fala, vale o que ela disse por último.'};
      const controller=new AbortController();
      res.on('close',()=>controller.abort());
      res.writeHead(200,{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-store, no-transform','connection':'keep-alive','x-accel-buffering':'no'});
      const event=(name,data)=>{ if(!res.destroyed) res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`); };
      event('start',{seq,total:QUESTION_TOTAL,groups:Object.keys(QUESTION_GROUPS)});
      const started=Date.now();
      const jobs=Object.entries(QUESTION_GROUPS).map(async([group,questions])=>{
        const t=Date.now();
        try {
          const result=await jevDecide({state,questions,signal:controller.signal});
          event('group',{seq,group,answers:result.answers,model:result.model||null,usage:result.usage||null,ms:Date.now()-t});
          return {group,ok:true};
        } catch(e) {
          if(e?.code!=='request_cancelled') event('group_error',{seq,group,error:e?.message||'Falha no Jev.',code:e?.code||'jev_error',ms:Date.now()-t});
          return {group,ok:false,code:e?.code||'jev_error'};
        }
      });
      const settled=await Promise.all(jobs);
      if(!controller.signal.aborted){ event('done',{seq,ok:settled.every(x=>x.ok),groups:settled,ms:Date.now()-started}); res.end(); }
      return;
    }
    if (path === '/api/v2/context' && req.method === 'POST') {
      const body=await readJson(req,180_000);
      const briefingText=String(body.briefing||'').trim().slice(0,5000);
      const decisions=body.decisions&&typeof body.decisions==='object'&&!Array.isArray(body.decisions)?body.decisions:{};
      const context=buildStudioContext({
        decisions,
        briefing:briefingText,
        brandName:String(body.brandName||'').trim().slice(0,120),
      });
      return sendJson(res,200,{ok:true,context});
    }
    if (path === '/api/v2/creative-plan' && req.method === 'POST') {
      const body=await readJson(req,160_000);
      const projectId=String(body.projectId||'');
      const project=await getProject(session.email,projectId);
      const briefingText=String(body.briefing||project.briefing||'').trim().slice(0,5000);
      if(briefingText.split(/\s+/).filter(Boolean).length<2) throw new HttpError(400,'Descreva o negócio antes de criar o plano criativo.','creative_plan_briefing_required');
      const materials=Array.isArray(body.materials)?body.materials:(project.v2?.materials||[]);
      const plan=await planCreativeProject({
        projectId,briefing:briefingText,materials,useJev:body.useJev!==false,
        decisions:body.decisions&&typeof body.decisions==='object'?body.decisions:{},
        brandName:project.clientName||'',
        studioContext:body.studioContext&&typeof body.studioContext==='object'?body.studioContext:null,
      });
      const previousAssets=Array.isArray(project.v2?.creativePlan?.assets)?project.v2.creativePlan.assets:[];
      if(Array.isArray(plan.assets)&&previousAssets.length){
        for(const item of plan.assets){
          const old=previousAssets.find(a=>a?.slot===item?.slot&&a?.assetId);
          if(!old)continue;
          Object.assign(item,{
            assetId:old.assetId,
            contentUrl:old.contentUrl||item.contentUrl||null,
            status:old.status==='failed'?'attached':(old.status||'attached'),
            mediaWorker:old.mediaWorker||item.mediaWorker||null,
            mediaModel:old.mediaModel||item.mediaModel||null,
            styleModel:old.styleModel||item.styleModel||null,
            routeReason:old.routeReason||item.routeReason||null,
            revisionCount:Number(old.revisionCount)||0,
          });
        }
        plan.progress={
          total:plan.assets.length,
          ready:plan.assets.filter(a=>a?.assetId).length,
          failed:plan.assets.filter(a=>a?.status==='failed').length,
        };
      }
      const heroMap={
        'hero-split-image':'split',
        'hero-full-background':'full_background',
        'hero-editorial':'editorial',
        'hero-illustration':'illustration',
        'hero-product':'product',
        'hero-video':'video',
      };
      const currentV2=project.v2&&typeof project.v2==='object'?project.v2:{};
      const nextV2={
        ...currentV2,
        kitStatus:'planning',
        materials:plan.deliverables,
        siteStructure:{
          hero:{enabled:plan.deliverables.includes('site'),variant:heroMap[plan.site?.hero?.composition]||'split'},
          sections:Array.isArray(plan.site?.sections)?plan.site.sections:[],
        },
        creativePlan:plan,
        studioContext:plan.studioContext||currentV2.studioContext||null,
        briefingFacts:plan.briefingFacts||currentV2.briefingFacts||{colors:[],palette:[],explicitColors:false},
      };
      const saved=await updateProject(session.email,projectId,{briefing:briefingText,v2:nextV2});
      return sendJson(res,200,{ok:true,plan:saved.v2?.creativePlan||plan,v2:saved.v2});
    }
    if (path === '/api/v2/media/revise-slot' && req.method === 'POST') {
      const body=await readJson(req,80_000);
      const projectId=String(body.projectId||'');
      const slot=String(body.slot||'').trim().slice(0,100);
      const instruction=String(body.instruction||'').replace(/\s+/g,' ').trim().slice(0,900);
      if(!slot||instruction.split(/\s+/).filter(Boolean).length<2) throw new HttpError(400,'Informe o slot e a mudança visual.','media_revision_required');
      const project=await getProject(session.email,projectId);
      const plan=project.v2?.creativePlan&&typeof project.v2.creativePlan==='object'?structuredClone(project.v2.creativePlan):null;
      if(!plan||!Array.isArray(plan.assets)) throw new HttpError(409,'Este projeto ainda não possui plano criativo.','creative_plan_missing');
      const item=plan.assets.find(a=>a?.slot===slot);
      if(!item) throw new HttpError(404,'Slot visual não encontrado no plano criativo.','creative_slot_missing');

      const routed=await routeModel({
        task:'creative_plan',
        mode:String(project.modelRouting?.mode||'auto'),
        preferredKey:String(project.modelRouting?.selections?.creative_plan||''),
        context:`${item.prompt||''}\nREVISÃO: ${instruction}`.slice(0,1800),
      });
      const director=routed.selected;
      const messages=[
        {role:'system',content:'You are a senior art director and image prompt editor. Rewrite the existing commercial image prompt in English, applying the requested revision while preserving brand style, composition purpose, aspect-ratio intent and negative-space needs. Do not add typography, logos or watermarks. Return only the final image-generation prompt, no markdown.'},
        {role:'user',content:`EXISTING PROMPT:\n${String(item.prompt||'').slice(0,3200)}\n\nREQUESTED REVISION:\n${instruction}`},
      ];
      const promptResult=director.provider==='chutes'
        ? await chutesChat({messages,model:director.id,temperature:0.35,top_p:0.9,max_tokens:420,stream:false})
        : await nvidiaChat({messages,model:director.id,temperature:0.35,top_p:0.9,max_tokens:420,stream:false});
      const revised=String(promptResult?.choices?.[0]?.message?.content||promptResult?.choices?.[0]?.text||'').replace(/^\s*[`"']+|[`"']+\s*$/g,'').trim();
      if(revised.length<20) throw new HttpError(502,'O diretor de arte não devolveu um prompt utilizável.','creative_prompt_empty');

      const controller=new AbortController(); res.on('close',()=>controller.abort());
      const capabilities=chutesMediaCapabilities();
      const regenerate=/\b(refaz(?:er)?\s+do\s+zero|nova\s+imagem|outra\s+imagem|gera(?:r)?\s+outra|substitu(?:i|ir)\s+completamente)\b/i.test(instruction);
      let media,mediaRoute;
      if(item.assetId&&capabilities.edit?.configured&&!regenerate){
        const source=await readAsset(session.email,projectId,item.assetId);
        media=await editChutesImage({
          prompt:revised,images:[source.body],negativePrompt:item.negativePrompt,
          width:item.width,height:item.height,signal:controller.signal,
        });
        mediaRoute={worker:'image_edit',styleModel:null,reason:'existing_asset_edit',source:'automatic'};
      }else{
        mediaRoute=await routeMediaWorker({
          operation:'generate',prompt:revised,slot,role:item.role,mediaMode:item.mediaMode,
          archetype:plan.brand?.archetype,purpose:item.purpose,workerHint:item.workerHint,
          styleModel:item.styleModel,hasReference:false,
        },{useJev:true});
        media=await generateChutesImage({
          prompt:revised,negativePrompt:item.negativePrompt,width:item.width,height:item.height,
          worker:mediaRoute.worker,styleModel:mediaRoute.styleModel,signal:controller.signal,
        });
      }

      const safeSlot=slot.replace(/[^a-z0-9_.-]+/gi,'-').replaceAll('.','-').slice(0,80);
      const ext=media.contentType==='image/png'?'png':'jpg';
      const asset=await putAsset({
        owner:session.email,projectId,role:item.role||'generated-image',
        originalName:`${safeSlot}-v${Date.now()}.${ext}`,contentType:media.contentType,buffer:media.body,
      });
      item.previousAssetId=item.assetId||null;
      item.assetId=asset.id;
      item.contentUrl=`/api/projects/${projectId}/assets/${asset.id}/content`;
      item.prompt=revised.slice(0,2200);
      item.status='attached';
      item.error=null;
      item.mediaWorker=media.worker||mediaRoute.worker;
      item.mediaModel=media.model||null;
      item.styleModel=media.styleModel||mediaRoute.styleModel||item.styleModel||null;
      item.routeReason=mediaRoute.reason||null;
      item.revisionCount=Math.min(999,(Number(item.revisionCount)||0)+1);
      item.lastInstruction=instruction;
      plan.status=plan.assets.some(a=>a.required!==false&&!a.assetId)?'partial':'ready';
      plan.progress={
        total:plan.assets.length,
        ready:plan.assets.filter(a=>a.assetId).length,
        failed:plan.assets.filter(a=>a.status==='failed').length,
      };
      const nextV2={...(project.v2||{}),creativePlan:plan,kitStatus:plan.status==='ready'?'ready':'generating'};
      const saved=await updateProject(session.email,projectId,{v2:nextV2});
      return sendJson(res,201,{ok:true,slot,asset,plan:saved.v2?.creativePlan||plan,route:{
        provider:'chutes',worker:item.mediaWorker,model:item.mediaModel,styleModel:item.styleModel,
        reason:item.routeReason,directorModel:director.id,directorProvider:director.provider,
      }});
    }
    if (path === '/api/v2/media/image' && req.method === 'POST') {
      const body=await readJson(req,80_000);
      const projectId=String(body.projectId||'');
      const project=await getProject(session.email,projectId);
      const mediaRoute=await routeMediaWorker({
        operation:'generate',prompt:body.prompt,slot:body.slot,role:body.role,mediaMode:body.mediaMode,
        archetype:body.archetype||project.v2?.creativePlan?.brand?.archetype,purpose:body.purpose,
        requestedWorker:body.worker,workerHint:body.workerHint,styleModel:body.styleModel,quality:body.quality,
        hasReference:false,
      },{useJev:body.useJev!==false});
      const controller=new AbortController(); res.on('close',()=>controller.abort());
      const media=await generateChutesImage({
        prompt:body.prompt,negativePrompt:body.negativePrompt,width:body.width,height:body.height,
        worker:mediaRoute.worker,styleModel:mediaRoute.styleModel,signal:controller.signal,
      });
      const ext=media.contentType==='image/png'?'png':'jpg';
      const asset=await putAsset({
        owner:session.email,projectId,role:String(body.role||'generated-image').slice(0,50),
        originalName:`imagem-ia-${Date.now()}.${ext}`,contentType:media.contentType,buffer:media.body,
      });
      return sendJson(res,201,{ok:true,asset,provider:'chutes',route:{
        worker:media.worker||mediaRoute.worker,model:media.model||null,styleModel:media.styleModel||mediaRoute.styleModel||null,
        reason:mediaRoute.reason,source:mediaRoute.source,jevModel:mediaRoute.model||null,
      }});
    }
    if (path === '/api/v2/media/edit' && req.method === 'POST') {
      const body=await readJson(req,80_000);
      const projectId=String(body.projectId||'');
      await getProject(session.email,projectId);
      const ids=[body.assetId,...(Array.isArray(body.referenceAssetIds)?body.referenceAssetIds:[])].map(v=>String(v||'')).filter(Boolean);
      const unique=[...new Set(ids)].slice(0,3);
      if(!unique.length) throw new HttpError(400,'Informe a imagem que deseja editar.','image_reference_required');
      const refs=[];
      for(const id of unique) refs.push((await readAsset(session.email,projectId,id)).body);
      const controller=new AbortController(); res.on('close',()=>controller.abort());
      const media=await editChutesImage({
        prompt:body.prompt,images:refs,negativePrompt:body.negativePrompt,width:body.width,height:body.height,
        trueCfgScale:body.trueCfgScale,steps:body.steps,signal:controller.signal,
      });
      const ext=media.contentType==='image/png'?'png':'jpg';
      const asset=await putAsset({
        owner:session.email,projectId,role:'generated-image-edit',
        originalName:`imagem-editada-${Date.now()}.${ext}`,contentType:media.contentType,buffer:media.body,
      });
      return sendJson(res,201,{ok:true,asset,provider:'chutes',route:{worker:media.worker,model:media.model,reason:'explicit_image_edit'}});
    }
    if (path === '/api/v2/media/segment' && req.method === 'POST') {
      const body=await readJson(req,40_000);
      const projectId=String(body.projectId||'');
      await getProject(session.email,projectId);
      const source=await readAsset(session.email,projectId,String(body.assetId||''));
      const controller=new AbortController(); res.on('close',()=>controller.abort());
      const result=await segmentChutesImage({image:source.body,prompt:body.prompt,signal:controller.signal});
      return sendJson(res,200,{ok:true,provider:'chutes',route:{worker:result.worker,model:result.model,reason:'explicit_object_segmentation'},result:result.data});
    }
    if (path === '/api/v2/media/video' && req.method === 'POST') {
      const body=await readJson(req,50_000);
      const projectId=String(body.projectId||'');
      await getProject(session.email,projectId);
      const controller=new AbortController(); res.on('close',()=>controller.abort());
      const media=await generateChutesVideo({prompt:body.prompt,resolution:body.resolution,frames:body.frames,fps:body.fps,signal:controller.signal});
      const asset=await putAsset({owner:session.email,projectId,role:'generated-video',originalName:`video-ia-${Date.now()}.mp4`,contentType:media.contentType,buffer:media.body});
      return sendJson(res,201,{ok:true,asset,provider:'chutes',route:{worker:media.worker,model:media.model,reason:'video_generation'}});
    }
    if (path === '/api/transcribe' && req.method === 'POST') {
      const type=String(req.headers['content-type']||'').split(';')[0].trim().toLowerCase();
      if(type!=='audio/wav' && type!=='audio/x-wav') throw new HttpError(415,'Envie áudio WAV.','unsupported_audio');
      const audio=await readBuffer(req,1_500_000);
      const controller=new AbortController();
      res.on('close',()=>controller.abort());
      const started=Date.now();
      const result=await transcribeWav(audio,{signal:controller.signal});
      return sendJson(res,200,{ok:true,text:result.text,provider:result.provider,language:result.language,ms:Date.now()-started});
    }
    if (path === '/api/escrever' && req.method === 'POST') {
      const body=await readJson(req,500_000);
      const text=String(body.texto||'').replace(/\s+/g,' ').trim();
      if(text.split(/\s+/).length<2) throw new HttpError(400,'Descreva o negócio com pelo menos algumas palavras.','text_too_short');
      if(!body.decisoes || typeof body.decisoes!=='object') throw new HttpError(400,'decisoes é obrigatório.','decisions_required');

      const controller=new AbortController();
      res.on('close',()=>controller.abort());
      res.writeHead(200,{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-store, no-transform','connection':'keep-alive','x-accel-buffering':'no'});
      const event=(name,data)=>{ if(!res.destroyed) res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`); };
      const modelRoute=await routeModel({
        task:'copy',
        mode:String(body.modelMode||'auto'),
        preferredKey:String(body.modelKey||''),
        context:text,
      });
      const worker=modelRoute.selected;
      event('inicio',{provider:worker.provider,model:worker.id,campos:11,route:{mode:modelRoute.mode,reason:modelRoute.reason}});
      event('fila',{provider:worker.provider,waiting:0});
      let fields={};
      try{
        const messages=buildWriterMessages({texto:text,decisoes:body.decisoes});
        const streamArgs={
          messages,
          model:worker.id,
          max_tokens:WRITER_MAX_TOKENS,
          temperature:0.7,
          top_p:0.9,
          signal:controller.signal,
          onToken:async(delta,meta)=>{
            fields=parseWriterFields(meta.text);
            event('tok',{delta,fields,chars:meta.text.length,chunks:meta.chunks});
          },
        };
        const result=worker.provider==='chutes'
          ? await chutesStream(streamArgs)
          : await nvidiaStream(streamArgs);
        fields=parseWriterFields(result.text);
        event('fim',{ok:true,fields,complete:writerComplete(fields),provider:worker.provider,model:result.model,route:{mode:modelRoute.mode,reason:modelRoute.reason},ms:result.ms,first_token_ms:result.first_token_ms,chunks:result.chunks});
      }catch(e){
        if(!controller.signal.aborted) event('erro',{ok:false,error:e?.message||'Falha ao escrever.',code:e?.code||'writer_error'});
      }finally{
        if(!res.destroyed) res.end();
      }
      return;
    }
    if (path === '/api/text/generate' && req.method === 'POST') {
      const body=await readJson(req,80_000);
      const messages=Array.isArray(body.messages)?body.messages:null;
      const routed=await routeModel({
        task:String(body.task||'copy'),
        mode:String(body.modelMode||'auto'),
        preferredKey:String(body.modelKey||''),
        context:JSON.stringify(messages||[]).slice(0,1200),
      });
      const worker=routed.selected;
      const args={messages,model:worker.id,temperature:body.temperature,top_p:body.top_p,max_tokens:body.max_tokens,stream:false};
      const upstream=worker.provider==='chutes'?await chutesChat(args):await nvidiaChat(args);
      return sendJson(res,200,{ok:true,provider:worker.provider,model:upstream.model||worker.id,route:{mode:routed.mode,reason:routed.reason},choices:upstream.choices,usage:upstream.usage});
    }
    if (path === '/' || path === '/index.html' || path === '/studio.js' || path === '/render.mjs' || path === '/variation.mjs' || path === '/export.mjs' || path === '/live.mjs') { const target = path === '/' ? '/index.html' : path; if (await serveStatic(res,PUBLIC,target)) return; }
    sendJson(res,404,{ok:false,error:'Não encontrado.',code:'not_found'});
  } catch (e) {
    const status=e instanceof HttpError?e.status:500;
    if(status===500) console.error(e);
    sendJson(res,status,{ok:false,error:e?.message||'Erro interno.',code:e?.code||'internal_error'});
  }
});

server.listen(config.port,'0.0.0.0',()=>console.log(`[studio] http://0.0.0.0:${config.port} (${config.env})`));
