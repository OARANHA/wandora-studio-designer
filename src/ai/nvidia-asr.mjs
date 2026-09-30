import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';

function ensureConfigured(){
  if(!config.nvidia.apiKey) throw new HttpError(503,'NVIDIA API ainda não está configurada neste ambiente.','nvidia_not_configured');
}
function asrError(status,data){
  const message=typeof data?.detail==='string'
    ? data.detail
    : data?.error?.message || data?.message || `Falha no reconhecimento NVIDIA (${status}).`;
  return new HttpError(status===429?429:502,message,status===429?'nvidia_asr_rate_limited':'nvidia_asr_upstream');
}

export async function nvidiaTranscribeWav(buffer,{signal}={}){
  ensureConfigured();
  if(!Buffer.isBuffer(buffer)||buffer.length<44) throw new HttpError(400,'Áudio WAV inválido.','bad_audio');
  const controller=new AbortController();let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},config.nvidia.asrTimeoutMs);
  const abort=()=>controller.abort(signal?.reason);
  if(signal){
    if(signal.aborted)abort();
    else signal.addEventListener('abort',abort,{once:true});
  }
  try{
    const form=new FormData();
    form.append('language',config.nvidia.asrLanguage);
    form.append('response_format','json');
    form.append('file',new Blob([buffer],{type:'audio/wav'}),'speech.wav');
    const r=await fetch(config.nvidia.asrUrl,{
      method:'POST',
      headers:{authorization:`Bearer ${config.nvidia.apiKey}`},
      body:form,
      signal:controller.signal,
    });
    const raw=await r.text();let data=null;
    try{data=JSON.parse(raw);}catch{}
    if(!r.ok)throw asrError(r.status,data||{message:raw.slice(0,200)});
    const text=String(data?.text||'').replace(/\s+/g,' ').trim();
    return {text,provider:'nvidia',language:config.nvidia.asrLanguage};
  }catch(e){
    if(e instanceof HttpError)throw e;
    if(e?.name==='AbortError'){
      if(signal?.aborted&&!timedOut)throw new HttpError(499,'Transcrição cancelada.','request_cancelled');
      throw new HttpError(504,'A transcrição NVIDIA demorou além do limite.','nvidia_asr_timeout');
    }
    throw new HttpError(502,'Não foi possível falar com o reconhecimento de voz da NVIDIA.','nvidia_asr_network');
  }finally{
    clearTimeout(timer);
    signal?.removeEventListener?.('abort',abort);
  }
}
