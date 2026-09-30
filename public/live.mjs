export function createDecisionScheduler({
  getText,
  run,
  debounceMs=650,
  maxWaitMs=1300,
  minWords=2,
  afterBusyMs=20,
  setTimeoutFn=setTimeout,
  clearTimeoutFn=clearTimeout,
}){
  let debounceTimer=null, maxTimer=null, inFlight=false, pending=false, firstPendingAt=0, lastSent='', seq=0, disposed=false;

  const words=(text)=>String(text||'').trim().split(/\s+/).filter(Boolean).length;
  const clearTimers=()=>{
    if(debounceTimer){clearTimeoutFn(debounceTimer);debounceTimer=null;}
    if(maxTimer){clearTimeoutFn(maxTimer);maxTimer=null;}
  };
  async function flush(){
    if(disposed)return false;
    clearTimers();
    if(inFlight){pending=true;return false;}
    const text=String(getText?.()||'').replace(/\s+/g,' ').trim();
    if(words(text)<minWords || text===lastSent){pending=false;firstPendingAt=0;return false;}
    pending=false;firstPendingAt=0;inFlight=true;lastSent=text;const current=++seq;
    try{ await run(text,current); }
    finally{
      inFlight=false;
      if(pending&&!disposed)setTimeoutFn(()=>{void flush();},afterBusyMs);
    }
    return true;
  }
  function schedule({immediate=false}={}){
    if(disposed)return;
    const text=String(getText?.()||'').replace(/\s+/g,' ').trim();
    if(words(text)<minWords || text===lastSent)return;
    pending=true;
    if(inFlight)return;
    if(immediate){void flush();return;}
    if(!firstPendingAt){
      firstPendingAt=Date.now();
      maxTimer=setTimeoutFn(()=>{void flush();},maxWaitMs);
    }
    if(debounceTimer)clearTimeoutFn(debounceTimer);
    debounceTimer=setTimeoutFn(()=>{void flush();},debounceMs);
  }
  function reset(text=''){
    clearTimers();pending=false;firstPendingAt=0;lastSent=String(text||'').replace(/\s+/g,' ').trim();
  }
  function dispose(){disposed=true;clearTimers();pending=false;}
  return {schedule,flush,reset,dispose,get inFlight(){return inFlight;},get pending(){return pending;},get lastSent(){return lastSent;}};
}

export function createSignalCables({svg,source,targets}){
  const paths=Object.fromEntries([...svg.querySelectorAll('path[data-group]')].map(p=>[p.dataset.group,p]));
  let raf=0;
  function draw(){
    raf=0;
    const host=svg.getBoundingClientRect(), s=source.getBoundingClientRect();
    const x1=s.right-host.left-4, y1=s.top-host.top+s.height*.52;
    for(const [group,target] of Object.entries(targets)){
      const path=paths[group]; if(!path||!target)continue;
      const t=target.getBoundingClientRect();
      const x2=t.left-host.left+3, y2=t.top-host.top+t.height*.5;
      const bend=Math.max(55,Math.min(170,(x2-x1)*.42));
      path.setAttribute('d',`M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(x1+bend).toFixed(1)} ${y1.toFixed(1)}, ${(x2-bend).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`);
      path.setAttribute('marker-end','url(#arrow-site)');
    }
  }
  function requestDraw(){if(!raf)raf=requestAnimationFrame(draw);}
  function start(){
    requestDraw();
    for(const p of Object.values(paths)){p.classList.remove('arrived');p.classList.add('live');}
  }
  function arrive(group){
    const path=paths[group]; if(!path)return;
    path.classList.remove('live','arrived'); void path.getBoundingClientRect(); path.classList.add('arrived');
    const target=targets[group]; if(target){target.classList.remove('live-hit');void target.getBoundingClientRect();target.classList.add('live-hit');setTimeout(()=>target.classList.remove('live-hit'),1350);}
  }
  function stop(){for(const p of Object.values(paths))p.classList.remove('live','arrived');}
  window.addEventListener('resize',requestDraw,{passive:true});
  draw();
  return {draw:requestDraw,start,arrive,stop};
}

export async function createVoiceMeter(vu){
  if(!navigator.mediaDevices?.getUserMedia)return null;
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx){stream.getTracks().forEach(t=>t.stop());return null;}
  const ctx=new AudioCtx(), analyser=ctx.createAnalyser(), source=ctx.createMediaStreamSource(stream);
  analyser.fftSize=256; analyser.smoothingTimeConstant=.72; source.connect(analyser);
  const data=new Uint8Array(analyser.fftSize);let raf=0,closed=false;
  const tick=()=>{
    if(closed)return;
    analyser.getByteTimeDomainData(data);
    let sum=0,peak=0;
    for(const v of data){const n=(v-128)/128;sum+=n*n;peak=Math.max(peak,Math.abs(n));}
    const rms=Math.sqrt(sum/data.length),level=Math.min(1,rms*5.5);
    const angle=-38+level*76;
    vu.style.setProperty('--vu-angle',`${angle.toFixed(1)}deg`);
    vu.classList.toggle('peak',peak>.55);
    raf=requestAnimationFrame(tick);
  };
  tick();
  return {stop(){closed=true;if(raf)cancelAnimationFrame(raf);vu.classList.remove('peak');vu.style.setProperty('--vu-angle','-20deg');stream.getTracks().forEach(t=>t.stop());ctx.close().catch(()=>{});}};
}


function concatFloat32(chunks){
  const total=chunks.reduce((n,a)=>n+a.length,0), out=new Float32Array(total);
  let offset=0;
  for(const a of chunks){out.set(a,offset);offset+=a.length;}
  return out;
}
export function downsampleMono(input,inputRate,outputRate=16000){
  if(outputRate>=inputRate)return input.slice();
  const ratio=inputRate/outputRate, length=Math.max(1,Math.round(input.length/ratio)), out=new Float32Array(length);
  let pos=0;
  for(let i=0;i<length;i++){
    const next=Math.min(input.length,Math.round((i+1)*ratio));
    let sum=0,count=0;
    for(let j=pos;j<next;j++){sum+=input[j];count++;}
    out[i]=count?sum/count:0;pos=next;
  }
  return out;
}
export function encodeWav16Mono(samples,sampleRate=16000){
  const buffer=new ArrayBuffer(44+samples.length*2), view=new DataView(buffer);
  const write=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};
  write(0,'RIFF');view.setUint32(4,36+samples.length*2,true);write(8,'WAVE');write(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  write(36,'data');view.setUint32(40,samples.length*2,true);
  let offset=44;
  for(let i=0;i<samples.length;i++,offset+=2){
    const s=Math.max(-1,Math.min(1,samples[i]));
    view.setInt16(offset,s<0?s*0x8000:s*0x7fff,true);
  }
  return new Blob([buffer],{type:'audio/wav'});
}
export function mergeTranscriptText(base,next,maxOverlap=10){
  base=String(base||'').replace(/\s+/g,' ').trim();
  next=String(next||'').replace(/\s+/g,' ').trim();
  if(!base)return next;if(!next)return base;
  const bw=base.split(' '), nw=next.split(' ');
  const norm=(s)=>s.toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]+/gu,'');
  let overlap=0;
  for(let n=Math.min(maxOverlap,bw.length,nw.length);n>=1;n--){
    let same=true;
    for(let i=0;i<n;i++)if(norm(bw[bw.length-n+i])!==norm(nw[i])){same=false;break;}
    if(same){overlap=n;break;}
  }
  return [base,nw.slice(overlap).join(' ')].filter(Boolean).join(' ').trim();
}

export async function createBackendVoiceCapture(vu,{
  onAudio,
  onSpeech,
  onSegment,
  onError,
  silenceMs=460,
  maxSegmentMs=1800,
  minSegmentMs=320,
  outputRate=16000,
}={}){
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('media_devices_unavailable');
  const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx){stream.getTracks().forEach(t=>t.stop());throw new Error('audio_context_unavailable');}
  const ctx=new AudioCtx();
  if(ctx.state==='suspended')await ctx.resume().catch(()=>{});
  const source=ctx.createMediaStreamSource(stream), analyser=ctx.createAnalyser();
  analyser.fftSize=512;analyser.smoothingTimeConstant=.7;source.connect(analyser);
  const processor=ctx.createScriptProcessor(2048,1,1), mute=ctx.createGain();mute.gain.value=0;
  source.connect(processor);processor.connect(mute);mute.connect(ctx.destination);

  const meterData=new Uint8Array(analyser.fftSize);
  let raf=0,closed=false,speaking=false,noiseFloor=.004,above=0,silentSamples=0,totalSamples=0;
  let chunks=[],pre=[],queue=Promise.resolve(),audioAnnounced=false;
  const maxPreSamples=Math.max(1,Math.round(ctx.sampleRate*.18));
  const silenceSamplesMax=Math.round(ctx.sampleRate*silenceMs/1000);
  const maxSegmentSamples=Math.round(ctx.sampleRate*maxSegmentMs/1000);
  const minSegmentSamples=Math.round(ctx.sampleRate*minSegmentMs/1000);

  const meter=()=>{
    if(closed)return;
    analyser.getByteTimeDomainData(meterData);
    let sum=0,peak=0;
    for(const v of meterData){const n=(v-128)/128;sum+=n*n;peak=Math.max(peak,Math.abs(n));}
    const rms=Math.sqrt(sum/meterData.length),level=Math.min(1,rms*5.2);
    vu.style.setProperty('--vu-angle',`${(-38+level*76).toFixed(1)}deg`);
    vu.classList.toggle('peak',peak>.55);
    if(!audioAnnounced&&rms>.005){audioAnnounced=true;onAudio?.({rms,peak});}
    raf=requestAnimationFrame(meter);
  };

  const emit=(forced=false)=>{
    if(!chunks.length)return;
    const raw=concatFloat32(chunks), durationMs=raw.length/ctx.sampleRate*1000;
    const keep=forced?raw.slice(Math.max(0,raw.length-Math.round(ctx.sampleRate*.16))):null;
    chunks=keep?.length?[keep]:[];totalSamples=keep?.length||0;silentSamples=0;
    if(!forced)speaking=false;
    if(raw.length<minSegmentSamples)return;
    const pcm=downsampleMono(raw,ctx.sampleRate,outputRate), wav=encodeWav16Mono(pcm,outputRate);
    queue=queue.then(()=>onSegment?.(wav,{durationMs,forced})).catch(e=>onError?.(e));
  };

  processor.onaudioprocess=(event)=>{
    if(closed)return;
    const input=event.inputBuffer.getChannelData(0), frame=new Float32Array(input);
    let sum=0,peak=0;
    for(const v of frame){sum+=v*v;peak=Math.max(peak,Math.abs(v));}
    const rms=Math.sqrt(sum/frame.length);
    if(!speaking){
      if(rms<.02)noiseFloor=noiseFloor*.96+rms*.04;
      const threshold=Math.max(.011,noiseFloor*2.8);
      if(rms>threshold&&peak>.025)above++;else above=Math.max(0,above-1);
      pre.push(frame);
      let preSamples=pre.reduce((n,a)=>n+a.length,0);
      while(pre.length>1&&preSamples>maxPreSamples){preSamples-=pre[0].length;pre.shift();}
      if(above>=2){
        speaking=true;onSpeech?.({rms,peak});
        chunks=pre.splice(0);totalSamples=chunks.reduce((n,a)=>n+a.length,0);silentSamples=0;above=0;
      }
      return;
    }
    chunks.push(frame);totalSamples+=frame.length;
    const threshold=Math.max(.009,noiseFloor*2.1);
    if(rms<threshold)silentSamples+=frame.length;else silentSamples=0;
    if(silentSamples>=silenceSamplesMax)emit(false);
    else if(totalSamples>=maxSegmentSamples)emit(true);
  };

  meter();
  return {
    async stop({flush=true}={}){
      if(closed)return;
      closed=true;
      if(flush&&speaking)emit(false);
      processor.onaudioprocess=null;
      try{source.disconnect();processor.disconnect();mute.disconnect();analyser.disconnect();}catch{}
      if(raf)cancelAnimationFrame(raf);
      vu.classList.remove('peak');vu.style.setProperty('--vu-angle','-20deg');
      stream.getTracks().forEach(t=>t.stop());
      await queue.catch(()=>{});
      await ctx.close().catch(()=>{});
    },
  };
}
