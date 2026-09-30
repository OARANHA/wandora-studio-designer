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
