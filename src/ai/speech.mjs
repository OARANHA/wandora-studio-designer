import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';

function upstreamError(status,data){
  const message=typeof data?.detail==='string'
    ? data.detail
    : data?.error?.message || data?.message || `Falha no reconhecimento de voz (${status}).`;
  return new HttpError(status===429?429:502,message,status===429?'stt_rate_limited':'stt_upstream');
}

export async function transcribeWav(buffer,{signal}={}){
  if(!Buffer.isBuffer(buffer)||buffer.length<44) throw new HttpError(400,'Áudio WAV inválido.','bad_audio');
  const controller=new AbortController();let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},config.speech.timeoutMs);
  const onAbort=()=>controller.abort(signal?.reason);
  if(signal){
    if(signal.aborted)onAbort();
    else signal.addEventListener('abort',onAbort,{once:true});
  }
  try{
    const form=new FormData();
    form.append('file',new Blob([buffer],{type:'audio/wav'}),'speech.wav');
    form.append('model',config.speech.model);
    form.append('language',config.speech.language);
    form.append('response_format','json');
    const r=await fetch(`${config.speech.baseUrl}/v1/audio/transcriptions`,{
      method:'POST',body:form,signal:controller.signal,
    });
    const raw=await r.text();let data=null;
    try{data=JSON.parse(raw);}catch{}
    if(!r.ok)throw upstreamError(r.status,data||{message:raw.slice(0,220)});
    const text=String(data?.text||'').replace(/\s+/g,' ').trim();
    return {text,provider:'speaches',model:config.speech.model,language:config.speech.language};
  }catch(e){
    if(e instanceof HttpError)throw e;
    if(e?.name==='AbortError'){
      if(signal?.aborted&&!timedOut)throw new HttpError(499,'Transcrição cancelada.','request_cancelled');
      throw new HttpError(504,'O reconhecimento de voz demorou além do limite.','stt_timeout');
    }
    throw new HttpError(502,'O reconhecimento de voz local não respondeu.','stt_network');
  }finally{
    clearTimeout(timer);
    signal?.removeEventListener?.('abort',onAbort);
  }
}
