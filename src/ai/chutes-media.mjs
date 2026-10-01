import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';

const STYLE_MODELS=new Set(['flux','dreamshaper','ilustmix','juggernaut']);

function workerConfig(worker){
  switch(String(worker||'')){
    case 'image_fast':
      return {worker:'image_fast',url:config.chutes.imageFastUrl,model:config.chutes.imageFastModel};
    case 'image_style':
      return {worker:'image_style',url:config.chutes.imageStyleUrl,model:config.chutes.imageStyleModel};
    case 'image_edit':
      return {worker:'image_edit',url:config.chutes.imageEditUrl,model:config.chutes.imageEditModel};
    case 'image_segment':
      return {worker:'image_segment',url:config.chutes.imageSegmentUrl,model:config.chutes.imageSegmentModel};
    case 'image_quality':
    default:
      return {worker:'image_quality',url:config.chutes.imageQualityUrl||config.chutes.imageUrl,model:config.chutes.imageQualityModel||config.chutes.imageModel};
  }
}

function requireWorker(worker){
  if(!config.chutes.apiKey)throw new HttpError(503,'CHUTES_API_KEY ainda não está configurada.','chutes_not_configured');
  const meta=workerConfig(worker);
  if(!meta.url)throw new HttpError(503,`Worker Chutes ${meta.worker} ainda não está configurado.`,'chutes_media_worker_not_configured');
  return meta;
}

function requireVideo(){
  if(!config.chutes.apiKey)throw new HttpError(503,'CHUTES_API_KEY ainda não está configurada.','chutes_not_configured');
  if(!config.chutes.videoUrl)throw new HttpError(503,'Endpoint Chutes de vídeo ainda não está configurado.','chutes_video_not_configured');
  return {url:config.chutes.videoUrl,model:config.chutes.videoModel};
}

function controllerFor(signal,ms=180000){
  const controller=new AbortController();let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},ms);
  const onAbort=()=>controller.abort(signal?.reason);
  if(signal){if(signal.aborted)onAbort();else signal.addEventListener('abort',onAbort,{once:true});}
  return {controller,timer,onAbort,get timedOut(){return timedOut;}};
}
function cleanup(ctx,signal){clearTimeout(ctx.timer);signal?.removeEventListener?.('abort',ctx.onAbort);}

function decodeBase64(value){
  const raw=String(value||'').replace(/^data:[^;]+;base64,/,'').trim();
  if(!raw)return null;
  try{return Buffer.from(raw,'base64');}catch{return null;}
}
function asBase64(value){
  if(Buffer.isBuffer(value))return value.toString('base64');
  if(value instanceof Uint8Array)return Buffer.from(value).toString('base64');
  return String(value||'').replace(/^data:[^;]+;base64,/,'').trim();
}
function imageFromJson(data){
  const b64=data?.images?.[0]||data?.data?.[0]?.b64_json||data?.image||data?.b64_json;
  const body=decodeBase64(b64);
  if(!body?.length)return null;
  return {body,contentType:'image/png'};
}
function mediaError(status,data,kind){
  const message=data?.error?.message||data?.detail||data?.message||`Falha do Chutes ao processar ${kind} (${status}).`;
  return new HttpError(status===429?429:502,message,status===429?'chutes_media_rate_limited':'chutes_media_upstream');
}

async function invokeBinary(url,payload,{signal,kind='imagem',timeoutMs=240000}={}){
  const ctx=controllerFor(signal,timeoutMs);
  try{
    const r=await fetch(url,{
      method:'POST',
      headers:{'content-type':'application/json','x-api-key':config.chutes.apiKey,authorization:`Bearer ${config.chutes.apiKey}`},
      body:JSON.stringify(payload),
      signal:ctx.controller.signal,
    });
    const type=String(r.headers.get('content-type')||'').toLowerCase();
    if(!r.ok){
      const raw=await r.text();let data=null;try{data=JSON.parse(raw);}catch{data={message:raw.slice(0,500)};}
      throw mediaError(r.status,data,kind);
    }
    if(type.startsWith('image/'))return {body:Buffer.from(await r.arrayBuffer()),contentType:type.split(';')[0]};
    if(type.startsWith('video/'))return {body:Buffer.from(await r.arrayBuffer()),contentType:type.split(';')[0]};
    const raw=await r.text();let data=null;try{data=JSON.parse(raw);}catch{}
    const image=imageFromJson(data);if(image)return image;
    if(kind==='vídeo'){
      const b64=data?.video_b64||data?.data?.[0]?.b64_json||data?.video;
      const body=decodeBase64(b64);if(body?.length)return {body,contentType:'video/mp4'};
    }
    throw new HttpError(502,`O Chutes respondeu sem mídia ${kind} reconhecível.`,'chutes_media_bad_response');
  }catch(e){
    if(e instanceof HttpError)throw e;
    if(e?.name==='AbortError')throw new HttpError(504,ctx.timedOut?'A geração de mídia demorou além do limite.':'Geração cancelada.',ctx.timedOut?'chutes_media_timeout':'request_cancelled');
    throw new HttpError(502,'Não foi possível falar com o Chutes de mídia.','chutes_media_network');
  }finally{cleanup(ctx,signal);}
}

async function invokeJson(url,payload,{signal,kind='análise',timeoutMs=180000}={}){
  const ctx=controllerFor(signal,timeoutMs);
  try{
    const r=await fetch(url,{
      method:'POST',
      headers:{'content-type':'application/json','x-api-key':config.chutes.apiKey,authorization:`Bearer ${config.chutes.apiKey}`},
      body:JSON.stringify(payload),
      signal:ctx.controller.signal,
    });
    const raw=await r.text();let data=null;try{data=raw?JSON.parse(raw):{};}catch{data=null;}
    if(!r.ok)throw mediaError(r.status,data||{message:raw.slice(0,500)},kind);
    if(!data||typeof data!=='object')throw new HttpError(502,`O Chutes respondeu sem JSON válido para ${kind}.`,'chutes_media_bad_response');
    return data;
  }catch(e){
    if(e instanceof HttpError)throw e;
    if(e?.name==='AbortError')throw new HttpError(504,ctx.timedOut?'A análise demorou além do limite.':'Análise cancelada.',ctx.timedOut?'chutes_media_timeout':'request_cancelled');
    throw new HttpError(502,'Não foi possível falar com o Chutes de mídia.','chutes_media_network');
  }finally{cleanup(ctx,signal);}
}

export function chutesMediaCapabilities(){
  const api=Boolean(config.chutes.apiKey);
  const cap=(worker)=>{const m=workerConfig(worker);return {configured:api&&Boolean(m.url),model:m.model||null,urlConfigured:Boolean(m.url)};};
  return {
    fast:cap('image_fast'),
    quality:cap('image_quality'),
    style:{...cap('image_style'),defaultModel:config.chutes.imageStyleDefault||'flux'},
    edit:cap('image_edit'),
    segment:cap('image_segment'),
    video:{configured:api&&Boolean(config.chutes.videoUrl),model:config.chutes.videoModel||null,urlConfigured:Boolean(config.chutes.videoUrl)},
  };
}

export async function generateChutesImage({
  prompt,negativePrompt='',width=1024,height=1024,worker='image_quality',styleModel='',seed=null,signal,
}={}){
  const meta=requireWorker(worker),text=String(prompt||'').trim();
  if(text.length<4)throw new HttpError(400,'Descreva a imagem que deseja gerar.','prompt_required');
  const w=Math.min(1536,Math.max(256,Number(width)||1024));
  const h=Math.min(1536,Math.max(256,Number(height)||1024));
  const randomSeed=Number.isFinite(Number(seed))?Math.max(0,Math.trunc(Number(seed))):Math.floor(Math.random()*2147483647);
  let payload;

  if(meta.worker==='image_fast'){
    payload={
      seed:randomSeed,shift:3,width:w,height:h,prompt:text.slice(0,4000),
      guidance_scale:0,max_sequence_length:512,num_inference_steps:9,
    };
  }else if(meta.worker==='image_style'){
    const selected=STYLE_MODELS.has(String(styleModel||'').toLowerCase())
      ?String(styleModel).toLowerCase()
      :(STYLE_MODELS.has(config.chutes.imageStyleDefault)?config.chutes.imageStyleDefault:'flux');
    payload={
      seed:randomSeed,model:selected,width:w,height:h,prompt:text.slice(0,4000),
      negative_prompt:String(negativePrompt||'').slice(0,1600),
    };
    if(selected==='flux'){
      payload.guidance_scale=3.5;payload.num_inference_steps=4;
      delete payload.negative_prompt;
    }else{
      payload.guidance_scale=7.5;payload.num_inference_steps=25;
    }
  }else{
    payload={
      prompt:text.slice(0,4000),
      negative_prompt:String(negativePrompt||'').slice(0,1600),
      width:w,height:h,true_cfg_scale:4,num_inference_steps:30,seed:randomSeed,
    };
  }
  const media=await invokeBinary(meta.url,payload,{signal,kind:'imagem',timeoutMs:240000});
  return {...media,worker:meta.worker,model:meta.model,styleModel:meta.worker==='image_style'?payload.model:null};
}

export async function editChutesImage({
  prompt,images=[],negativePrompt='',width=1024,height=1024,trueCfgScale=1,steps=4,seed=null,signal,
}={}){
  const meta=requireWorker('image_edit'),text=String(prompt||'').trim();
  if(text.length<4)throw new HttpError(400,'Descreva a edição que deseja fazer.','prompt_required');
  const image_b64s=(Array.isArray(images)?images:[]).map(asBase64).filter(Boolean).slice(0,3);
  if(!image_b64s.length)throw new HttpError(400,'Envie ao menos uma imagem de referência para editar.','image_reference_required');
  const payload={
    prompt:text.slice(0,4000),
    seed:Number.isFinite(Number(seed))?Math.max(0,Math.trunc(Number(seed))):Math.floor(Math.random()*2147483647),
    width:Math.min(1536,Math.max(256,Number(width)||1024)),
    height:Math.min(1536,Math.max(256,Number(height)||1024)),
    image_b64s,
    true_cfg_scale:Math.min(8,Math.max(0,Number(trueCfgScale)||1)),
    negative_prompt:String(negativePrompt||'').slice(0,1600),
    num_inference_steps:Math.min(50,Math.max(1,Number(steps)||4)),
  };
  const media=await invokeBinary(meta.url,payload,{signal,kind:'edição de imagem',timeoutMs:300000});
  return {...media,worker:meta.worker,model:meta.model};
}

export async function segmentChutesImage({image,prompt,signal}={}){
  const meta=requireWorker('image_segment'),text=String(prompt||'').trim();
  if(text.length<2)throw new HttpError(400,'Diga qual objeto deseja localizar.','segment_prompt_required');
  const raw=asBase64(image);
  if(!raw)throw new HttpError(400,'Envie uma imagem para segmentar.','image_reference_required');
  const payload={
    data:{
      image:{type:'base64',value:raw},
      prompts:[{text:text.slice(0,800),type:'text'}],
    },
  };
  const data=await invokeJson(meta.url,payload,{signal,kind:'segmentação',timeoutMs:180000});
  return {data,worker:meta.worker,model:meta.model};
}

export async function generateChutesVideo({prompt,resolution='1280*720',frames=81,fps=24,signal}={}){
  const meta=requireVideo(),text=String(prompt||'').trim();
  if(text.length<4)throw new HttpError(400,'Descreva o vídeo que deseja gerar.','prompt_required');
  const isLtx=/ltx/i.test(`${meta.model} ${meta.url}`);
  if(isLtx){
    const raw=String(resolution||'1280*720').match(/(\d+)\D+(\d+)/);
    const width=Math.min(1920,Math.max(256,Number(raw?.[1])||768));
    const height=Math.min(1088,Math.max(256,Number(raw?.[2])||512));
    const media=await invokeBinary(meta.url,{
      prompt:text.slice(0,4000),width,height,duration:Math.max(3,Math.min(8,(Number(frames)||81)/(Number(fps)||24))),
      fps:Math.min(30,Math.max(8,Number(fps)||24)),generate_audio:false,guidance_scale:3.1,
    },{signal,kind:'vídeo',timeoutMs:600000});
    return {...media,worker:'video',model:meta.model};
  }
  const media=await invokeBinary(meta.url,{
    prompt:text.slice(0,4000),
    resolution:String(resolution||'1280*720').slice(0,30),
    steps:25,
    frames:Math.min(121,Math.max(17,Number(frames)||81)),
    fps:Math.min(30,Math.max(8,Number(fps)||24)),
    seed:Math.floor(Math.random()*2147483647),
  },{signal,kind:'vídeo',timeoutMs:600000});
  return {...media,worker:'video',model:meta.model};
}
