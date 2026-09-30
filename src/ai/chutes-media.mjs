import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';

function requireMedia(kind){
  if(!config.chutes.apiKey)throw new HttpError(503,'CHUTES_API_KEY ainda não está configurada.','chutes_not_configured');
  const url=kind==='image'?config.chutes.imageUrl:config.chutes.videoUrl;
  if(!url)throw new HttpError(503,`Endpoint Chutes de ${kind==='image'?'imagem':'vídeo'} ainda não está configurado.`,`chutes_${kind}_not_configured`);
  return url;
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
function imageFromJson(data){
  const b64=data?.images?.[0]||data?.data?.[0]?.b64_json||data?.image||data?.b64_json;
  const body=decodeBase64(b64);
  if(!body?.length)return null;
  return {body,contentType:'image/png'};
}
function mediaError(status,data,kind){
  const message=data?.error?.message||data?.detail||data?.message||`Falha do Chutes ao gerar ${kind} (${status}).`;
  return new HttpError(status===429?429:502,message,status===429?'chutes_media_rate_limited':'chutes_media_upstream');
}
async function invoke(url,payload,{signal,kind,timeoutMs}){
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
      const raw=await r.text();let data=null;try{data=JSON.parse(raw);}catch{data={message:raw.slice(0,300)};}
      throw mediaError(r.status,data,kind);
    }
    if(type.startsWith('image/'))return {body:Buffer.from(await r.arrayBuffer()),contentType:type.split(';')[0]};
    if(type.startsWith('video/'))return {body:Buffer.from(await r.arrayBuffer()),contentType:type.split(';')[0]};
    const raw=await r.text();let data=null;try{data=JSON.parse(raw);}catch{}
    if(kind==='image'){
      const image=imageFromJson(data);if(image)return image;
    }
    if(kind==='video'){
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
export async function generateChutesImage({prompt,negativePrompt='',width=1024,height=1024,signal}={}){
  const url=requireMedia('image'),text=String(prompt||'').trim();
  if(text.length<4)throw new HttpError(400,'Descreva a imagem que deseja gerar.','prompt_required');
  return invoke(url,{
    prompt:text.slice(0,4000),
    negative_prompt:String(negativePrompt||'').slice(0,1600),
    width:Math.min(1536,Math.max(256,Number(width)||1024)),
    height:Math.min(1536,Math.max(256,Number(height)||1024)),
    num_inference_steps:28,guidance_scale:6.5,
  },{signal,kind:'image',timeoutMs:180000});
}
export async function generateChutesVideo({prompt,resolution='1280*720',frames=81,fps=24,signal}={}){
  const url=requireMedia('video'),text=String(prompt||'').trim();
  if(text.length<4)throw new HttpError(400,'Descreva o vídeo que deseja gerar.','prompt_required');
  return invoke(url,{
    prompt:text.slice(0,4000),
    resolution:String(resolution||'1280*720').slice(0,30),
    steps:25,
    frames:Math.min(121,Math.max(17,Number(frames)||81)),
    fps:Math.min(30,Math.max(8,Number(fps)||24)),
    seed:Math.floor(Math.random()*2147483647),
  },{signal,kind:'video',timeoutMs:300000});
}
