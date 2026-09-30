import { resetPieces, renderAll, renderBrand, renderSite, renderPosts, renderEmail, renderAds } from './render.mjs';
import { sampleGoodVariants, restoreJevChoices } from './variation.mjs';
const $ = (s) => document.querySelector(s);
const briefing=$('#briefing'), btn=$('#analisar'), status=$('#status'), providers=$('#providers');
const projectSelect=$('#project-select'), projectName=$('#project-name'), clientName=$('#client-name');
const createProjectBtn=$('#create-project'), saveVersionBtn=$('#save-version'), openVersionsBtn=$('#open-versions'), generateCopyBtn=$('#generate-copy');
const anotherVersionBtn=$('#another-version'), xrayBtn=$('#xray'), backJevBtn=$('#back-jev');
const versionsDialog=$('#versions-dialog'), versionsList=$('#versions-list'), xrayDialog=$('#xray-dialog'), xrayList=$('#xray-list'), xraySummary=$('#xray-summary');
let activeController=null, copyController=null, activeProject=null, latestDecisions={}, latestCopy={}, latestComplete=false, nvidiaReady=false, copyGenerating=false, latestVariation=[], questionInfo=null;
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
  el.classList.remove('working','done','error'); if(state)el.classList.add(state);
}
function setSignal(group,text,on=false){
  const el=signal[group]; if(!el)return;
  el.textContent=text; el.classList.toggle('signal-on',on);
}
function renderUnderstanding(answers){
  const root=$('#understanding-summary'); root.hidden=false; root.className='understanding-summary'; root.replaceChildren();
  for(const [id,a] of Object.entries(answers||{})){
    const row=document.createElement('div'), name=document.createElement('span'), value=document.createElement('b');
    name.textContent=labels[id]||id; value.textContent=answerText(a); row.append(name,value); root.append(row);
  }
}
function renderGroupSummary(group,answers,ms=0){
  const count=Object.keys(answers||{}).length;
  if(group==='entender'){ renderUnderstanding(answers); return; }
  setSignal(group,ms?`${count} decisões · ${ms} ms`:`${count} decisões`,true);
  const draw={site:renderSite,marca:renderBrand,posts:renderPosts,email:renderEmail,anuncios:renderAds}[group];
  draw?.(latestDecisions,latestCopy);
}
function resetSignals(){
  latestDecisions={}; latestCopy={}; latestComplete=false; latestVariation=[];
  saveVersionBtn.disabled=true;
  resetPieces();
  const summary=$('#understanding-summary'); summary.hidden=true; summary.replaceChildren();
  Object.keys(channel).forEach(g=>setChannel(g,''));
  Object.keys(signal).forEach(g=>setSignal(g,'sem sinal',false));
  $('#decisoes').textContent='0'; $('#latencia').textContent='—';
}
function refreshProjectButtons(){
  openVersionsBtn.disabled=!activeProject;
  saveVersionBtn.disabled=!activeProject || !latestComplete;
  generateCopyBtn.disabled=!latestComplete || !nvidiaReady || copyGenerating;
  anotherVersionBtn.disabled=!latestComplete;
  xrayBtn.disabled=!latestComplete;
  backJevBtn.hidden=!latestVariation.length;
}
async function json(url,opts={}){
  const r=await fetch(url,{...opts,headers:{'content-type':'application/json',...(opts.headers||{})}});
  const d=await r.json(); if(!r.ok)throw Object.assign(new Error(d.error||'Erro'),{data:d,status:r.status}); return d;
}
async function loadConfig(){
  try{
    const c=await json('/api/config');
    nvidiaReady=!!c.providers.nvidia.configured;
    providers.textContent=`JEV ${c.providers.jev.configured?'●':'○'} · NVIDIA ${nvidiaReady?'●':'○'} · ${c.total} decisões`;
    providers.classList.toggle('ready',c.providers.jev.configured&&nvidiaReady);
    generateCopyBtn.title=nvidiaReady?`NVIDIA · ${c.providers.nvidia.model}`:'Configure NVIDIA_API_KEY no servidor';
    refreshProjectButtons();
  }catch{providers.textContent='IA indisponível';nvidiaReady=false;refreshProjectButtons();}
}
async function loadProjects(selectId=null){
  const d=await json('/api/projects');
  const previous=selectId || activeProject?.id || projectSelect.value;
  projectSelect.replaceChildren(new Option('Novo projeto…',''));
  for(const p of d.projects) projectSelect.add(new Option(`${p.name}${p.versionCount?` · v${p.versionCount}`:''}`,p.id));
  if(previous && d.projects.some(p=>p.id===previous)){ projectSelect.value=previous; activeProject=d.projects.find(p=>p.id===previous); }
  else if(!previous){ activeProject=null; projectSelect.value=''; }
  refreshProjectButtons();
}
async function createProject(){
  const name=projectName.value.trim(); if(name.length<2){status.textContent='Dê um nome ao projeto primeiro.';projectName.focus();return;}
  createProjectBtn.disabled=true;
  try{
    const d=await json('/api/projects',{method:'POST',body:JSON.stringify({name,clientName:clientName.value,briefing:briefing.value})});
    activeProject=d.project; projectName.value=''; clientName.value=''; await loadProjects(d.project.id);
    status.textContent=`Projeto “${d.project.name}” criado.`;
  }catch(e){status.textContent=e.message;}finally{createProjectBtn.disabled=false;}
}
async function selectProject(){
  const id=projectSelect.value;
  if(!id){activeProject=null;refreshProjectButtons();status.textContent='Novo projeto: dê um nome e crie quando quiser salvar versões.';return;}
  try{
    const d=await json(`/api/projects/${id}`); activeProject=d.project; briefing.value=d.project.briefing||''; resetSignals(); refreshProjectButtons();
    status.textContent=`Projeto “${d.project.name}” carregado · ${d.project.versionCount||0} versão(ões).`;
  }catch(e){status.textContent=e.message;}
}
async function saveVersion(){
  if(!activeProject || !latestComplete)return;
  saveVersionBtn.disabled=true; status.textContent='Salvando versão…';
  try{
    await json(`/api/projects/${activeProject.id}`,{method:'PATCH',body:JSON.stringify({briefing:briefing.value})});
    const d=await json(`/api/projects/${activeProject.id}/versions`,{method:'POST',body:JSON.stringify({briefing:briefing.value,decisions:latestDecisions,copy:latestCopy,reason:'manual',metadata:{decisionCount:Object.values(latestDecisions).reduce((n,g)=>n+Object.keys(g||{}).length,0),variationChanges:latestVariation}})});
    activeProject={...activeProject,versionCount:d.version.number,briefing:briefing.value}; await loadProjects(activeProject.id);
    status.textContent=`Versão ${d.version.number} salva.`;
  }catch(e){status.textContent=e.message;}finally{refreshProjectButtons();}
}
function versionButton(v){
  const row=document.createElement('button'); row.type='button'; row.className='version-row';
  const left=document.createElement('span'), right=document.createElement('small');
  left.textContent=`Versão ${v.number}`; right.textContent=new Date(v.createdAt).toLocaleString('pt-BR'); row.append(left,right);
  row.addEventListener('click',()=>restoreVersion(v.id)); return row;
}
async function openVersions(){
  if(!activeProject)return;
  try{
    const d=await json(`/api/projects/${activeProject.id}/versions`); versionsList.replaceChildren();
    if(!d.versions.length){const p=document.createElement('p');p.textContent='Nenhuma versão salva ainda.';versionsList.append(p);}
    else d.versions.forEach(v=>versionsList.append(versionButton(v)));
    versionsDialog.showModal();
  }catch(e){status.textContent=e.message;}
}
async function restoreVersion(id){
  if(!activeProject)return;
  try{
    const d=await json(`/api/projects/${activeProject.id}/versions/${id}`), v=d.version;
    briefing.value=v.briefing||''; latestDecisions=v.decisions||{}; latestCopy=v.copy||{}; latestVariation=Array.isArray(v.metadata?.variationChanges)?v.metadata.variationChanges:[];
    let total=0; for(const [group,answers] of Object.entries(latestDecisions)){total+=Object.keys(answers||{}).length;setChannel(group,'done');renderGroupSummary(group,answers);}
    latestComplete=total===89; $('#decisoes').textContent=String(total); $('#latencia').textContent='salva'; refreshProjectButtons(); versionsDialog.close();
    status.textContent=`Versão ${v.number} restaurada${latestComplete?' com 89 decisões':''}.`;
  }catch(e){status.textContent=e.message;}
}
async function loadQuestionInfo(){
  if(questionInfo)return questionInfo;
  questionInfo=await json('/api/questions');
  return questionInfo;
}
function prettyId(v){return String(v||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());}
function optionLabel(meta,id){
  const raw=meta?.options && !Array.isArray(meta.options) ? meta.options[id] : null;
  if(typeof raw!=='string')return prettyId(id);
  const short=raw.split(/\s+[—-]\s+|:\s+/)[0].trim();
  return (short||prettyId(id)).slice(0,82);
}
function pct(v){const n=Number(v);return Number.isFinite(n)?`${Math.round(n*100)}%`:'—';}
async function anotherVersion(){
  if(!latestComplete)return;
  const result=sampleGoodVariants(latestDecisions);
  if(!result.changes.length){status.textContent='O Jev não deixou alternativas boas o bastante para sortear.';return;}
  latestDecisions=result.decisions; latestVariation=result.changes;
  renderAll(latestDecisions,latestCopy); refreshProjectButtons();
  const byGroup=Object.groupBy?Object.groupBy(result.changes,c=>c.group):result.changes.reduce((m,c)=>((m[c.group]??=[]).push(c),m),{});
  for(const [group,items] of Object.entries(byGroup)) if(group!=='entender')setSignal(group,`🎲 ${items.length} sorteada(s)`,true);
  let info=null; try{info=await loadQuestionInfo();}catch{}
  const top=result.changes.slice(0,3).map(c=>{
    const meta=info?.questions?.[c.group]?.[c.id];
    return `${meta?.label||prettyId(c.id)}: “${optionLabel(meta,c.to)}” (${c.rank}ª opção do Jev, ${pct(c.prob)})`;
  });
  status.textContent=`🎲 ${result.changes.length} decisões sorteadas entre as boas — ${top.join(' · ')}`;
}
function backToJev(){
  if(!latestVariation.length)return;
  const r=restoreJevChoices(latestDecisions);
  latestDecisions=r.decisions; latestVariation=[]; renderAll(latestDecisions,latestCopy);
  for(const [group,answers] of Object.entries(latestDecisions)) if(group!=='entender')renderGroupSummary(group,answers);
  refreshProjectButtons(); status.textContent=`Versão do Jev restaurada · ${r.count} escolha(s) voltaram ao 1º lugar.`;
}
function xrayRow(group,id,answer,meta,varied){
  const row=document.createElement('div'); row.className='rx-l'; if(varied)row.classList.add('dado');
  const head=document.createElement('div'); head.className='rx-head';
  const title=document.createElement('b'); title.textContent=`${varied?'🎲 ':''}${meta?.label||prettyId(id)}`;
  const type=document.createElement('small'); type.textContent=answer?.type||meta?.type||'';
  head.append(title,type); row.append(head);
  if(answer?.type==='choice'){
    const probs=Object.entries(answer.probabilities||{}).map(([k,p])=>[k,Number(p)||0]).sort((a,b)=>b[1]-a[1]);
    const current=answer.choice, currentP=Number(answer.probabilities?.[current])||0;
    const main=document.createElement('div'); main.className='rx-main'; main.textContent=`${optionLabel(meta,current)} · ${pct(currentP)}`;
    const bar=document.createElement('i'); bar.className='rx-bar'; bar.style.setProperty('--p',`${Math.max(1,currentP*100)}%`);
    const top=probs[0], second=probs[1];
    const sub=document.createElement('div'); sub.className='rx-sub';
    if(varied&&top) sub.textContent=`Jev: ${optionLabel(meta,top[0])} · ${pct(top[1])}${second?` · 2º: ${optionLabel(meta,second[0])} · ${pct(second[1])}`:''}`;
    else if(second) sub.textContent=`2º: ${optionLabel(meta,second[0])} · ${pct(second[1])}`;
    row.append(main,bar,sub);
  }else if(answer?.type==='score'){
    const main=document.createElement('div'); main.className='rx-main'; main.textContent=`score ${Number(answer.score).toFixed(2)} · confiança ${pct(answer.confidence)}`;
    const probs=Object.entries(answer.probabilities||{}).sort((a,b)=>Number(b[1])-Number(a[1]));
    if(probs[0]){const sub=document.createElement('div');sub.className='rx-sub';sub.textContent=`nível mais provável: ${probs[0][0]} · ${pct(probs[0][1])}`;row.append(main,sub);}else row.append(main);
  }else{
    const p=Number(answer?.noul)||0; const main=document.createElement('div');main.className='rx-main';main.textContent=`Sim · ${pct(p)}`;row.append(main);
    if(p>=.35&&p<=.65){const sub=document.createElement('div');sub.className='rx-sub rx-doubt';sub.textContent='perto de 50%: o Jev está em dúvida';row.append(sub);}
  }
  return row;
}
async function openXray(){
  if(!latestComplete)return;
  try{
    const info=await loadQuestionInfo(), varied=new Map(latestVariation.map(x=>[x.id,x]));
    xrayList.replaceChildren(); xraySummary.textContent=`89 decisões · ${latestVariation.length} sorteada(s) · probabilidades do Jev preservadas`;
    for(const [group,gmeta] of Object.entries(info.groups)){
      const section=document.createElement('section');section.className='rx-group';
      const h=document.createElement('h3');h.textContent=`${gmeta.icon||''} ${gmeta.label} · ${gmeta.count}`;section.append(h);
      for(const [id,answer] of Object.entries(latestDecisions[group]||{})) section.append(xrayRow(group,id,answer,info.questions?.[group]?.[id],varied.get(id)));
      xrayList.append(section);
    }
    xrayDialog.showModal();
  }catch(e){status.textContent=e.message;}
}

function copyShape(fields={}){
  const first=(v)=>String(v||'').split(/\n|[.!?](?:\s|$)/)[0].trim().slice(0,86);
  return {
    brand:{slogan:fields.slogan||''},
    site:{headline:fields.titulo||'',subheadline:fields.subtitulo||''},
    posts:{
      presentation:{title:first(fields.legenda1),caption:fields.legenda1||''},
      sales:{title:first(fields.legenda2),caption:fields.legenda2||''},
      relationship:{title:first(fields.legenda3),caption:fields.legenda3||''},
    },
    email:{subject:fields.assunto||'',preheader:fields.preheader||'',preview:fields.email||fields.preheader||''},
    ads:{headline:fields.anuncio||''},
    about:fields.sobre||'',
  };
}
async function generateCopy(){
  if(!latestComplete){status.textContent='Conclua as 89 decisões antes de escrever os textos.';return;}
  if(!nvidiaReady){status.textContent='Configure NVIDIA_API_KEY no servidor para escrever os textos.';return;}
  copyController?.abort(); copyController=new AbortController(); const controller=copyController;
  copyGenerating=true; refreshProjectButtons(); generateCopyBtn.textContent='NVIDIA ESCREVENDO…'; status.textContent='NVIDIA preparando 11 textos…';
  try{
    const r=await fetch('/api/escrever',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({texto:briefing.value,decisoes:latestDecisions}),signal:controller.signal});
    await readSse(r,(event,d)=>{
      if(controller!==copyController)return;
      if(event==='inicio') status.textContent=`NVIDIA · ${d.model} · iniciando…`;
      if(event==='tok' && d.fields){
        latestCopy=copyShape(d.fields);
        renderAll(latestDecisions,latestCopy);
        const n=Object.values(d.fields).filter(Boolean).length;
        status.textContent=`NVIDIA escrevendo… ${n}/11 campos`;
      }
      if(event==='fim'){
        latestCopy=copyShape(d.fields||{});
        renderAll(latestDecisions,latestCopy);
        status.textContent=d.complete?`11 textos prontos · primeira palavra em ${d.first_token_ms??'—'} ms · total ${d.ms} ms`:`NVIDIA terminou com ${Object.values(d.fields||{}).filter(Boolean).length}/11 campos.`;
      }
      if(event==='erro') throw Object.assign(new Error(d.error||'Falha da NVIDIA.'),{code:d.code});
    });
  }catch(e){
    if(e.name!=='AbortError') status.textContent=e.message;
  }finally{
    if(controller===copyController){copyGenerating=false;generateCopyBtn.textContent='TEXTOS NVIDIA';refreshProjectButtons();}
  }
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
  copyController?.abort(); copyGenerating=false;
  const texto=briefing.value.trim(); if(texto.split(/\s+/).length<2){status.textContent='Escreva pelo menos algumas palavras sobre o negócio.';return;}
  activeController?.abort(); activeController=new AbortController(); const controller=activeController;
  latestDecisions={}; latestCopy={}; latestComplete=false; latestVariation=[]; refreshProjectButtons();
  btn.disabled=true; status.textContent='Abrindo os 6 canais do Jev…'; $('#decisoes').textContent='0'; $('#latencia').textContent='—';
  Object.keys(channel).forEach(g=>setChannel(g,'working')); Object.keys(signal).forEach(g=>setSignal(g,'recebendo…',false));
  const started=performance.now(); let decisions=0, failures=0;
  try{
    const r=await fetch('/api/decidir',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({texto,seq:Date.now()}),signal:controller.signal});
    await readSse(r,(event,d)=>{
      if(controller!==activeController)return;
      if(event==='group'){
        latestDecisions[d.group]=d.answers||{}; const n=Object.keys(d.answers||{}).length; decisions+=n; $('#decisoes').textContent=String(decisions); setChannel(d.group,'done'); renderGroupSummary(d.group,d.answers,d.ms); status.textContent=`${d.group}: ${n} decisões recebidas.`;
      } else if(event==='group_error'){
        failures+=1; setChannel(d.group,'error'); setSignal(d.group,d.code||'erro',false); status.textContent=d.error;
      } else if(event==='done'){
        $('#latencia').textContent=`${Math.round(performance.now()-started)} ms`; latestComplete=d.ok && decisions===89; refreshProjectButtons();
        status.textContent=latestComplete?'89 decisões prontas. Você já pode salvar esta versão.':`Canais concluídos com ${failures} erro(s).`;
      }
    });
  }catch(e){if(e.name!=='AbortError')status.textContent=e.message;}
  finally{if(controller===activeController)btn.disabled=false;}
}

btn.addEventListener('click',analyze);
briefing.addEventListener('keydown',(e)=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')analyze();});
createProjectBtn.addEventListener('click',createProject);
projectSelect.addEventListener('change',selectProject);
saveVersionBtn.addEventListener('click',saveVersion);
openVersionsBtn.addEventListener('click',openVersions);
generateCopyBtn.addEventListener('click',generateCopy);
anotherVersionBtn.addEventListener('click',anotherVersion);
xrayBtn.addEventListener('click',openXray);
backJevBtn.addEventListener('click',backToJev);
await Promise.all([loadConfig(),loadProjects()]);
