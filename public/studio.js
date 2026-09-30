const $ = (s) => document.querySelector(s);
const briefing=$('#briefing'), btn=$('#analisar'), status=$('#status'), providers=$('#providers');
let activeController=null;
const labels={seg:'Segmento',pers:'Personalidade',pub:'Público',obj:'Objetivo',canal:'Canal',preco:'Preço',mat:'Maturidade',dif:'Diferencial',oferta:'Oferta',emoji:'Emojis'};
const channel={entender:$('#ch-entender'),site:$('#ch-site'),marca:$('#ch-marca'),posts:$('#ch-posts'),email:$('#ch-email'),anuncios:$('#ch-anuncios')};
const signal={site:$('#signal-site'),marca:$('#brand-signal'),posts:$('#signal-posts'),email:$('#signal-email'),anuncios:$('#signal-anuncios')};

function answerText(a){
  if(!a)return '—';
  if(a.type==='choice')return a.choice ?? '—';
  if(a.type==='score')return Number(a.score).toFixed(1);
  if(a.type==='noul')return `${Math.round(Number(a.noul)*100)}%`;
  return '—';
}
function setChannel(group,state){
  const el=channel[group]; if(!el)return;
  el.classList.remove('working','done','error');
  if(state)el.classList.add(state);
}
function setSignal(group,text,on=false){
  const el=signal[group]; if(!el)return;
  el.textContent=text;
  el.classList.toggle('signal-on',on);
}
function renderUnderstanding(answers){
  const root=$('#understanding'); root.className='identity-result'; root.replaceChildren();
  for(const [id,a] of Object.entries(answers||{})){
    const row=document.createElement('div'), name=document.createElement('span'), value=document.createElement('b');
    name.textContent=labels[id]||id; value.textContent=answerText(a); row.append(name,value); root.append(row);
  }
}
function renderGroupSummary(group,answers,ms){
  const count=Object.keys(answers||{}).length;
  if(group==='entender'){ renderUnderstanding(answers); return; }
  setSignal(group,`${count} decisões · ${ms} ms`,true);
}
async function json(url,opts={}){
  const r=await fetch(url,{...opts,headers:{'content-type':'application/json',...(opts.headers||{})}});
  const d=await r.json(); if(!r.ok)throw Object.assign(new Error(d.error||'Erro'),{data:d}); return d;
}
async function loadConfig(){
  try{const c=await json('/api/config');providers.textContent=`JEV ${c.providers.jev.configured?'●':'○'} · NVIDIA ${c.providers.nvidia.configured?'●':'○'} · ${c.total} decisões`;providers.classList.toggle('ready',c.providers.jev.configured&&c.providers.nvidia.configured);}catch{providers.textContent='IA indisponível';}
}
async function readSse(response,onEvent){
  if(!response.ok){let d={};try{d=await response.json();}catch{}throw new Error(d.error||`HTTP ${response.status}`);}
  const reader=response.body.getReader(), decoder=new TextDecoder(); let buffer='';
  while(true){
    const {value,done}=await reader.read(); if(done)break; buffer+=decoder.decode(value,{stream:true});
    let cut; while((cut=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,cut);buffer=buffer.slice(cut+2);let event='message',data='';for(const line of block.split('\n')){if(line.startsWith('event:'))event=line.slice(6).trim();else if(line.startsWith('data:'))data+=line.slice(5).trim();}if(data)onEvent(event,JSON.parse(data));}
  }
}
async function analyze(){
  const texto=briefing.value.trim(); if(texto.split(/\s+/).length<2){status.textContent='Escreva pelo menos algumas palavras sobre o negócio.';return;}
  activeController?.abort(); activeController=new AbortController(); const controller=activeController;
  btn.disabled=true; status.textContent='Abrindo os 6 canais do Jev…'; $('#decisoes').textContent='0'; $('#latencia').textContent='—';
  Object.keys(channel).forEach(g=>setChannel(g,'working')); Object.keys(signal).forEach(g=>setSignal(g,'recebendo…',false));
  const started=performance.now(); let decisions=0, failures=0;
  try{
    const r=await fetch('/api/decidir',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({texto,seq:Date.now()}),signal:controller.signal});
    await readSse(r,(event,d)=>{
      if(controller!==activeController)return;
      if(event==='group'){
        const n=Object.keys(d.answers||{}).length; decisions+=n; $('#decisoes').textContent=String(decisions); setChannel(d.group,'done'); renderGroupSummary(d.group,d.answers,d.ms); status.textContent=`${d.group}: ${n} decisões recebidas.`;
      } else if(event==='group_error'){
        failures+=1; setChannel(d.group,'error'); setSignal(d.group,d.code||'erro',false); status.textContent=d.error;
      } else if(event==='done'){
        $('#latencia').textContent=`${Math.round(performance.now()-started)} ms`; status.textContent=d.ok?'89 decisões prontas. Próximo estágio: desenhar as cinco peças.':`Canais concluídos com ${failures} erro(s).`;
      }
    });
  }catch(e){if(e.name!=='AbortError')status.textContent=e.message;}
  finally{if(controller===activeController)btn.disabled=false;}
}
btn.addEventListener('click',analyze);
briefing.addEventListener('keydown',(e)=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')analyze();});
loadConfig();
