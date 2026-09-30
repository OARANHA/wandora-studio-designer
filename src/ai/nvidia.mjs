import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';

function validate(messages){
  if (!config.nvidia.apiKey) throw new HttpError(503, 'NVIDIA API ainda não está configurada neste ambiente.', 'nvidia_not_configured');
  if (!Array.isArray(messages) || !messages.length) throw new HttpError(400, 'messages é obrigatório.', 'bad_request');
}
function upstreamError(status, data){
  return new HttpError(status===429?429:502, data?.error?.message || `Falha da NVIDIA (${status}).`, status===429?'nvidia_rate_limited':'nvidia_upstream');
}
function requestController(signal){
  const controller=new AbortController(); let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},config.nvidia.timeoutMs);
  const onAbort=()=>controller.abort(signal?.reason);
  if(signal){
    if(signal.aborted) onAbort();
    else signal.addEventListener('abort',onAbort,{once:true});
  }
  return {controller,timer,onAbort,get timedOut(){return timedOut;}};
}
function cleanup(ctx,signal){
  clearTimeout(ctx.timer);
  signal?.removeEventListener?.('abort',ctx.onAbort);
}
function bodyFor({messages,model,temperature,top_p,max_tokens,stream}){
  return {model:model||config.nvidia.model,messages,temperature,top_p,max_tokens,stream};
}

export async function nvidiaChat({ messages, model, temperature = 0.7, top_p = 0.9, max_tokens = 900, stream = false, signal }) {
  validate(messages);
  if(stream) throw new HttpError(500,'Use nvidiaStream para respostas em streaming.','nvidia_stream_contract');
  const ctx=requestController(signal);
  try {
    const r=await fetch(`${config.nvidia.baseUrl}/chat/completions`,{
      method:'POST',signal:ctx.controller.signal,
      headers:{authorization:`Bearer ${config.nvidia.apiKey}`,'content-type':'application/json'},
      body:JSON.stringify(bodyFor({messages,model,temperature,top_p,max_tokens,stream:false})),
    });
    const text=await r.text(); let data; try{data=JSON.parse(text);}catch{data=null;}
    if(!r.ok) throw upstreamError(r.status,data);
    if(!data) throw new HttpError(502,'A NVIDIA respondeu em formato inválido.','nvidia_bad_response');
    return data;
  } catch(e){
    if(e instanceof HttpError) throw e;
    if(e?.name==='AbortError'){
      if(signal?.aborted&&!ctx.timedOut) throw new HttpError(499,'Requisição cancelada.','request_cancelled');
      throw new HttpError(504,'A NVIDIA demorou além do limite.','nvidia_timeout');
    }
    throw new HttpError(502,'Não foi possível falar com a NVIDIA.','nvidia_network');
  } finally { cleanup(ctx,signal); }
}

export async function nvidiaStream({messages,model,temperature=0.7,top_p=0.9,max_tokens=900,onToken,signal}){
  validate(messages);
  const ctx=requestController(signal), started=Date.now(); let firstTokenAt=0, chunks=0, text='', responseModel=model||config.nvidia.model;
  try{
    const r=await fetch(`${config.nvidia.baseUrl}/chat/completions`,{
      method:'POST',signal:ctx.controller.signal,
      headers:{authorization:`Bearer ${config.nvidia.apiKey}`,'content-type':'application/json'},
      body:JSON.stringify(bodyFor({messages,model,temperature,top_p,max_tokens,stream:true})),
    });
    if(!r.ok){
      const raw=await r.text(); let data; try{data=JSON.parse(raw);}catch{data=null;}
      throw upstreamError(r.status,data);
    }
    if(!r.body) throw new HttpError(502,'A NVIDIA respondeu sem stream.','nvidia_bad_response');

    const reader=r.body.getReader(), decoder=new TextDecoder(); let buffer='', doneMarker=false;
    while(!doneMarker){
      const {value,done}=await reader.read();
      if(done) break;
      buffer+=decoder.decode(value,{stream:true});
      let nl;
      while((nl=buffer.indexOf('\n'))>=0){
        const line=buffer.slice(0,nl).trim(); buffer=buffer.slice(nl+1);
        if(!line.startsWith('data:')) continue;
        const raw=line.slice(5).trim();
        if(raw==='[DONE]'){doneMarker=true;break;}
        if(!raw) continue;
        let data; try{data=JSON.parse(raw);}catch{continue;}
        responseModel=data.model||responseModel;
        const delta=data.choices?.[0]?.delta?.content ?? data.choices?.[0]?.text ?? '';
        if(!delta) continue;
        if(!firstTokenAt) firstTokenAt=Date.now();
        chunks+=1; text+=delta; await onToken?.(delta,{chunks,text,model:responseModel});
      }
    }
    return {text,model:responseModel,chunks,ms:Date.now()-started,first_token_ms:firstTokenAt?firstTokenAt-started:null};
  } catch(e){
    if(e instanceof HttpError) throw e;
    if(e?.name==='AbortError'){
      if(signal?.aborted&&!ctx.timedOut) throw new HttpError(499,'Requisição cancelada.','request_cancelled');
      throw new HttpError(504,'A NVIDIA demorou além do limite.','nvidia_timeout');
    }
    throw new HttpError(502,'Não foi possível falar com a NVIDIA.','nvidia_network');
  } finally { cleanup(ctx,signal); }
}
