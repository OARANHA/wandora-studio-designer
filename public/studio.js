import { resetPieces, renderAll, renderBrand, renderSite, renderPosts, renderEmail, renderAds } from './render.mjs';
import { sampleGoodVariants, restoreJevChoices } from './variation.mjs';
import { buildSiteHtml, buildEmailHtml, buildSignatureHtml, buildAdsHtml, buildProjectJson, downloadText, slugify } from './export.mjs';
import { createDecisionScheduler, createSignalCables, createVoiceMeter } from './live.mjs';
const $ = (s) => document.querySelector(s);
const briefing=$('#briefing'), btn=$('#analisar'), status=$('#status'), providers=$('#providers');
const projectSelect=$('#project-select'), projectName=$('#project-name'), clientName=$('#client-name');
const createProjectBtn=$('#create-project'), saveVersionBtn=$('#save-version'), openVersionsBtn=$('#open-versions'), generateCopyBtn=$('#generate-copy');
const anotherVersionBtn=$('#another-version'), xrayBtn=$('#xray'), backJevBtn=$('#back-jev'), micBtn=$('#mic'), exportBtn=$('#export');
const commandInput=$('#command'), applyCommandBtn=$('#apply-command'), lockStrip=$('#lock-strip');
const versionsDialog=$('#versions-dialog'), versionsList=$('#versions-list'), xrayDialog=$('#xray-dialog'), xrayList=$('#xray-list'), xraySummary=$('#xray-summary');
const exportDialog=$('#export-dialog'), exportSiteBtn=$('#export-site'), exportEmailBtn=$('#export-email'), exportSignatureBtn=$('#export-signature'), copySignatureBtn=$('#copy-signature'), exportAdsBtn=$('#export-ads'), exportJsonBtn=$('#export-json');
let activeController=null, copyController=null, activeProject=null, latestDecisions={}, latestCopy={}, latestComplete=false, nvidiaReady=false, copyGenerating=false, latestVariation=[], questionInfo=null, commandBusy=false, lockedChoices={}, lockedTargets={}, commandHistory=[];
const liveTranscript=$('#live-transcript'), transcriptFinal=$('#transcript-final'), transcriptInterim=$('#transcript-interim'), briefingLabel=briefing.closest('.screen-label'), vuEl=$('.mic-row .vu');
const voiceDiag=$('#voice-diag'), voiceStages=Object.fromEntries([...voiceDiag.querySelectorAll('[data-stage]')].map(el=>[el.dataset.stage,el]));
let recognition=null, micListening=false, micWanted=false, micBaseText='', micFinalText='', micInterimText='', voiceMeter=null, liveUpdateCount=0;
const labels={seg:'Segmento',pers:'Personalidade',pub:'Público',obj:'Objetivo',canal:'Canal',preco:'Preço',mat:'Maturidade',dif:'Diferencial',oferta:'Oferta',emoji:'Emojis'};
const channel={entender:$('#ch-entender'),site:$('#ch-site'),marca:$('#ch-marca'),posts:$('#ch-posts'),email:$('#ch-email'),anuncios:$('#ch-anuncios')};
const signal={site:$('#signal-site'),marca:$('#brand-signal'),posts:$('#signal-posts'),email:$('#signal-email'),anuncios:$('#signal-anuncios')};
const cableTargets={site:$('.monitor.site'),posts:$('.monitor.posts'),marca:$('.monitor.brand-monitor'),email:$('.monitor.email'),anuncios:$('.monitor.ads')};
const cables=createSignalCables({svg:$('#signal-cables'),source:briefingLabel,targets:cableTargets});
const decisionScheduler=createDecisionScheduler({getText:()=>briefing.value,run:(text,seq)=>runDecisionUpdate(text,seq,{live:micWanted||micListening})});

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
  lockedChoices={}; lockedTargets={}; commandHistory=[]; renderLocks();
  saveVersionBtn.disabled=true;
  resetPieces();
  const summary=$('#understanding-summary'); summary.hidden=true; summary.replaceChildren();
  Object.keys(channel).forEach(g=>setChannel(g,''));
  Object.keys(signal).forEach(g=>setSignal(g,'sem sinal',false));
  $('#decisoes').textContent='0'; $('#latencia').textContent='—';
  cables.stop(); decisionScheduler.reset(briefing.value);
}
function refreshProjectButtons(){
  openVersionsBtn.disabled=!activeProject;
  saveVersionBtn.disabled=!activeProject || !latestComplete;
  generateCopyBtn.disabled=!latestComplete || !nvidiaReady || copyGenerating;
  anotherVersionBtn.disabled=!latestComplete;
  xrayBtn.disabled=!latestComplete;
  applyCommandBtn.disabled=!latestComplete || commandBusy;
  backJevBtn.hidden=!latestVariation.length;
  exportBtn.disabled=!latestComplete;
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
    const d=await json(`/api/projects/${activeProject.id}/versions`,{method:'POST',body:JSON.stringify({briefing:briefing.value,decisions:latestDecisions,copy:latestCopy,reason:'manual',metadata:{decisionCount:Object.values(latestDecisions).reduce((n,g)=>n+Object.keys(g||{}).length,0),variationChanges:latestVariation,lockedChoices,lockedTargets}})});
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
    briefing.value=v.briefing||''; latestDecisions=v.decisions||{}; latestCopy=v.copy||{}; latestVariation=Array.isArray(v.metadata?.variationChanges)?v.metadata.variationChanges:[]; lockedChoices=v.metadata?.lockedChoices&&typeof v.metadata.lockedChoices==='object'?v.metadata.lockedChoices:{}; lockedTargets=v.metadata?.lockedTargets&&typeof v.metadata.lockedTargets==='object'?v.metadata.lockedTargets:{}; renderLocks();
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

function snapshotStudio(reason='manual',target=null){
  commandHistory.push({
    reason,target,
    decisions:structuredClone(latestDecisions),
    copy:structuredClone(latestCopy),
    lockedChoices:structuredClone(lockedChoices),
    lockedTargets:structuredClone(lockedTargets),
    variation:structuredClone(latestVariation),
  });
  if(commandHistory.length>40)commandHistory.shift();
}
function applyLocksToGroup(group,answers){
  const out=structuredClone(answers||{});
  for(const [id,value] of Object.entries(lockedChoices)){
    if(out[id]?.type==='choice')out[id].choice=value;
  }
  return out;
}
function renderLocks(){
  lockStrip.replaceChildren();
  const entries=Object.entries(lockedTargets);
  lockStrip.hidden=!entries.length;
  for(const [target,data] of entries){
    const b=document.createElement('button');b.type='button';b.className='lock-tape';
    b.textContent=`🔒 ${target} ×`;b.title=data?.reason||'Peça travada';
    b.addEventListener('click',async()=>{
      const info=await loadQuestionInfo();for(const id of info.targets?.[target]||[])delete lockedChoices[id];
      delete lockedTargets[target];renderLocks();status.textContent=`${prettyId(target)} destravado.`;
    });
    lockStrip.append(b);
  }
}
async function lockTarget(target,reason='seu comando'){
  const info=await loadQuestionInfo(), ids=info.targets?.[target]||[];
  for(const id of ids){
    for(const answers of Object.values(latestDecisions)){
      const a=answers?.[id];if(a?.type==='choice'&&a.choice)lockedChoices[id]=a.choice;
    }
  }
  if(ids.length)lockedTargets[target]={reason,t:Date.now()};
  renderLocks();
}
function targetChanged(a,b,ids=[]){
  for(const id of ids){
    let av,bv;
    for(const g of Object.values(a||{}))if(g?.[id])av=g[id].choice;
    for(const g of Object.values(b||{}))if(g?.[id])bv=g[id].choice;
    if(av!==bv)return true;
  }
  return false;
}
async function undoTarget(target){
  const info=await loadQuestionInfo(), ids=info.targets?.[target]||[];
  if(!ids.length){status.textContent='Não encontrei uma peça específica para desfazer.';return false;}
  for(let i=commandHistory.length-1;i>=0;i--){
    const snap=commandHistory[i];
    if(!targetChanged(latestDecisions,snap.decisions,ids)&&JSON.stringify(lockedTargets[target]||null)===JSON.stringify(snap.lockedTargets?.[target]||null))continue;
    for(const id of ids){
      for(const [group,answers] of Object.entries(latestDecisions)){
        if(answers?.[id]&&snap.decisions?.[group]?.[id])latestDecisions[group][id]=structuredClone(snap.decisions[group][id]);
      }
      if(id in (snap.lockedChoices||{}))lockedChoices[id]=snap.lockedChoices[id];else delete lockedChoices[id];
    }
    if(snap.lockedTargets?.[target])lockedTargets[target]=structuredClone(snap.lockedTargets[target]);else delete lockedTargets[target];
    latestVariation=[];renderAll(latestDecisions,latestCopy);renderLocks();refreshProjectButtons();
    status.textContent=`${prettyId(target)} voltou para a versão anterior.`;return true;
  }
  status.textContent=`Não encontrei uma versão anterior diferente de ${prettyId(target)}.`;return false;
}
async function currentChoiceLabels(){
  const info=await loadQuestionInfo(), out={};
  for(const [group,answers] of Object.entries(latestDecisions)){
    for(const [id,a] of Object.entries(answers||{})){
      if(a?.type==='choice')out[id]=optionLabel(info.questions?.[group]?.[id],a.choice);
    }
  }
  return out;
}
function applyLibraryAnswers(target,answers){
  let changed=0;
  for(const [id,a] of Object.entries(answers||{})){
    if(a?.type!=='choice'||!a.choice||a.choice==='manter')continue;
    for(const groupAnswers of Object.values(latestDecisions)){
      if(groupAnswers?.[id]?.type==='choice'){
        groupAnswers[id]={...groupAnswers[id],choice:a.choice};
        changed+=1;break;
      }
    }
  }
  return changed;
}
async function applyCommand(){
  const comando=commandInput.value.trim();
  if(!latestComplete||comando.split(/\s+/).length<2){status.textContent='Digite o que quer mudar em algumas palavras.';return;}
  commandBusy=true;refreshProjectButtons();status.textContent=`Entendendo “${comando}”…`;
  try{
    const atuais=await currentChoiceLabels();
    const resp=await json('/api/comando',{method:'POST',body:JSON.stringify({comando,descricao:briefing.value,atuais})});
    const confident=['comando_de_edicao','desfazer','fixar'].includes(resp.tipo)&&Number(resp.p_tipo)>=.55;
    if(resp.tipo==='descrever_negocio'||(!confident&&resp.tipo!=='outra')){
      commandInput.value=''; briefing.value=`${briefing.value.trim()} ${comando}`.trim();
      status.textContent='Entendi como descrição do negócio. Refazendo as decisões…';
      await analyze();return;
    }
    if(resp.tipo==='outra'){status.textContent='Não parece um pedido de mudança.';return;}
    const target=resp.alvo;
    if(resp.tipo==='fixar'){
      if(!questionInfo?.targets?.[target])await loadQuestionInfo();
      if(!questionInfo?.targets?.[target]){status.textContent='Entendi que quer fixar, mas não qual peça.';return;}
      snapshotStudio('fixar',target);await lockTarget(target,`fixado: ${comando}`);commandInput.value='';
      status.textContent=`🔒 ${prettyId(target)} fixado: novas descrições não mudam essa peça.`;return;
    }
    if(resp.tipo==='desfazer'){snapshotStudio('antes_desfazer',target);await undoTarget(target);commandInput.value='';return;}
    if(resp.tipo==='comando_de_edicao'&&target==='tudo'){
      commandInput.value=''; briefing.value=`${briefing.value.trim()} ${comando}`.trim();
      status.textContent='Estilo geral: refazendo tudo com o seu pedido…';await analyze();return;
    }
    if(resp.tipo==='comando_de_edicao'&&resp.answers){
      snapshotStudio('comando',target);
      const changed=applyLibraryAnswers(target,resp.answers);
      await lockTarget(target,`seu comando: ${comando}`);
      latestVariation=[];renderAll(latestDecisions,latestCopy);renderLocks();commandInput.value='';refreshProjectButtons();
      status.textContent=changed?`🎯 ${prettyId(target)} alterado e travado · ${changed} decisão(ões).`:`${prettyId(target)} → o Jev achou que já estava assim; peça travada.`;
      return;
    }
    status.textContent='Entendi um pedido, mas não qual peça mudar.';
  }catch(e){status.textContent=`Não consegui aplicar: ${e.message}`;}
  finally{commandBusy=false;refreshProjectButtons();}
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

function exportContext(){
  return {project:activeProject,decisions:latestDecisions,copy:latestCopy,locks:{choices:lockedChoices,targets:lockedTargets},history:commandHistory};
}
function exportBase(){
  return slugify(activeProject?.name || activeProject?.clientName || latestCopy?.brand?.name || 'wandora-studio');
}
function ensureExportable(){
  if(!latestComplete){ status.textContent='Conclua as 89 decisões antes de exportar.'; return false; }
  return true;
}
function openExport(){
  if(!ensureExportable()) return;
  exportDialog.showModal();
}
function exportSite(){
  const ctx=exportContext(); downloadText(`site-${exportBase()}.html`,buildSiteHtml(ctx),'text/html;charset=utf-8');
  status.textContent='Site HTML exportado.';
}
function exportEmail(){
  const ctx=exportContext(); downloadText(`email-${exportBase()}.html`,buildEmailHtml(ctx),'text/html;charset=utf-8');
  status.textContent='E-mail HTML exportado.';
}
function exportSignature(){
  const ctx=exportContext(); downloadText(`assinatura-${exportBase()}.html`,buildSignatureHtml(ctx),'text/html;charset=utf-8');
  status.textContent='Assinatura HTML exportada.';
}
async function copySignature(){
  const html=buildSignatureHtml(exportContext());
  try{
    if(navigator.clipboard?.write && window.ClipboardItem){
      const item=new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([html],{type:'text/plain'})});
      await navigator.clipboard.write([item]);
    }else{
      await navigator.clipboard.writeText(html);
    }
    status.textContent='Assinatura copiada para a área de transferência.';
  }catch{
    status.textContent='Não foi possível copiar automaticamente. Use “ASSINATURA · HTML”.';
  }
}
function exportAds(){
  const ctx=exportContext(); downloadText(`banners-${exportBase()}.html`,buildAdsHtml(ctx),'text/html;charset=utf-8');
  status.textContent='Kit com 6 formatos de banners exportado.';
}
function exportJson(){
  const ctx=exportContext(); downloadText(`projeto-${exportBase()}.json`,buildProjectJson(ctx),'application/json;charset=utf-8');
  status.textContent='Estado do projeto exportado em JSON.';
}

function voiceStage(name,state='active',title=''){
  const el=voiceStages[name]; if(!el)return;
  el.classList.remove('active','ok','error');
  if(state)el.classList.add(state);
  if(title)el.title=title;
}
function resetVoiceStages(){
  for(const el of Object.values(voiceStages)){el.classList.remove('active','ok','error');el.title='';}
}
function setMicState(listening,message=''){
  micListening=!!listening;
  micBtn.classList.toggle('is-listening',micListening);
  micBtn.setAttribute('aria-pressed',String(micListening));
  micBtn.textContent=micListening?'REC':'MIC';
  if(message)status.textContent=message;
}
function paintTranscript(){
  const fixed=[micBaseText,micFinalText].filter(Boolean).join(micBaseText&&micFinalText?'\n':'');
  transcriptFinal.textContent=fixed;
  transcriptInterim.textContent=micInterimText?(fixed?' ':'')+micInterimText:'';
  liveTranscript.hidden=false;
  briefingLabel.classList.add('is-listening');
  liveTranscript.scrollTop=liveTranscript.scrollHeight;
}
function closeTranscript(){
  briefingLabel.classList.remove('is-listening');
  liveTranscript.hidden=true;
}
async function startVoiceMeter(){
  voiceMeter?.stop?.(); voiceMeter=null;
  try{
    const meter=await createVoiceMeter(vuEl);
    if(!micWanted)meter?.stop?.(); else voiceMeter=meter;
  }catch{}
}
function stopMic(message='Microfone fechado. Atualização final enviada.'){
  micWanted=false;
  try{recognition?.stop();}catch{}
  voiceMeter?.stop?.(); voiceMeter=null;
  setMicState(false,message); closeTranscript();
  decisionScheduler.schedule({immediate:true});
}
function setupMic(){
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    micBtn.disabled=true; micBtn.title='Reconhecimento de voz não disponível neste navegador.';
    voiceStage('audio','error','Web Speech API indisponível');
    status.textContent='Este navegador não tem reconhecimento de voz. Use Chrome, Edge ou Safari.';
    return;
  }

  recognition=new SpeechRecognition();
  recognition.lang='pt-BR';
  recognition.continuous=true;
  recognition.interimResults=true;
  recognition.maxAlternatives=1;

  let resultSeen=false, speechSeen=false, speechTimer=null, localMode=false;
  const clearSpeechTimer=()=>{if(speechTimer){clearTimeout(speechTimer);speechTimer=null;}};

  async function startRecognitionPreferred(){
    resetVoiceStages();
    voiceStage('audio','active','Preparando reconhecimento');
    if(!micWanted)return;
    try{
      const canLocal=typeof SpeechRecognition.available==='function'
        && typeof SpeechRecognition.install==='function'
        && 'processLocally' in recognition;
      if(canLocal){
        let availability='unavailable';
        try{
          availability=await SpeechRecognition.available({langs:['pt-BR'],processLocally:true,quality:'dictation'});
        }catch{
          try{availability=await SpeechRecognition.available({langs:['pt-BR'],processLocally:true});}catch{}
        }
        if(!micWanted)return;
        if(availability==='available'){
          recognition.processLocally=true; localMode=true;
          status.textContent='🎙️ Reconhecimento pt-BR local pronto · ligando microfone…';
        }else if(availability==='downloadable'||availability==='downloading'){
          status.textContent='⬇️ Preparando reconhecimento pt-BR no próprio navegador…';
          let installed=false;
          try{installed=await SpeechRecognition.install({langs:['pt-BR'],processLocally:true,quality:'dictation'});}
          catch{try{installed=await SpeechRecognition.install({langs:['pt-BR'],processLocally:true});}catch{}}
          if(!micWanted)return;
          recognition.processLocally=!!installed; localMode=!!installed;
          status.textContent=installed?'✓ Português instalado · ligando microfone…':'Reconhecimento local indisponível · usando serviço do navegador…';
        }else{
          recognition.processLocally=false; localMode=false;
        }
      }
      recognition.start();
    }catch(e){
      micWanted=false; closeTranscript(); voiceStage('audio','error',e?.name||'falha');
      status.textContent='⚠️ Não foi possível ligar o reconhecimento de voz neste navegador.';
    }
  }

  recognition.onstart=()=>{
    resultSeen=false; speechSeen=false; clearSpeechTimer();
    setMicState(true,localMode?'🎙️ Ouvindo em português · reconhecimento local.':'🎙️ Ouvindo em português · reconhecimento do navegador.');
    paintTranscript();
    voiceStage('audio','ok',localMode?'Reconhecimento local ativo':'Reconhecimento ativo');
    setTimeout(()=>{if(micWanted)void startVoiceMeter();},180);
  };
  recognition.onaudiostart=()=>{
    voiceStage('audio','ok','Fluxo de áudio ativo');
    if(micWanted)status.textContent='🎙️ Microfone ativo · aguardando sua fala…';
  };
  recognition.onspeechstart=()=>{
    speechSeen=true; voiceStage('speech','ok','Fala detectada');
    if(micWanted)status.textContent='🎙️ Fala detectada · transcrevendo ao vivo…';
    clearSpeechTimer();
    speechTimer=setTimeout(()=>{
      if(micWanted&&!resultSeen){
        voiceStage('text','error','Sem resultado de transcrição');
        status.textContent='⚠️ O áudio e a fala chegaram, mas ainda não veio texto do reconhecedor.';
      }
    },4500);
  };
  recognition.onresult=(event)=>{
    resultSeen=true; clearSpeechTimer(); voiceStage('text','ok','Texto recebido');
    let interim='';
    for(let i=event.resultIndex;i<event.results.length;i++){
      const text=(event.results[i][0]?.transcript||'').trim();
      if(!text)continue;
      if(event.results[i].isFinal)micFinalText+=(micFinalText?' ':'')+text;
      else interim+=(interim?' ':'')+text;
    }
    micInterimText=interim;
    const spoken=[micFinalText,micInterimText].filter(Boolean).join(' ').trim();
    briefing.value=[micBaseText,spoken].filter(Boolean).join(micBaseText&&spoken?'\n':'').slice(0,3000);
    paintTranscript();
    decisionScheduler.schedule();
  };
  recognition.onnomatch=()=>{
    voiceStage('text','error','Áudio sem palavras reconhecidas');
    status.textContent='⚠️ Ouvi áudio, mas não consegui reconhecer palavras.';
  };
  recognition.onerror=(event)=>{
    clearSpeechTimer();
    const code=String(event.error||'erro');
    if(code==='no-speech'||code==='aborted')return;
    const friendly={
      'not-allowed':'O navegador bloqueou o microfone. Libere o acesso no cadeado da barra de endereço.',
      'service-not-allowed':'O serviço de reconhecimento de voz foi bloqueado pelo navegador.',
      'audio-capture':'Nenhum microfone encontrado.',
      'network':'O serviço remoto de reconhecimento de voz falhou na rede.',
      'language-not-supported':'Português não está disponível nesse modo de reconhecimento.',
      'language-unavailable':'O pacote de português está indisponível nesse modo.'
    }[code]||`O reconhecimento de voz parou (${code}).`;
    voiceStage(speechSeen?'text':'audio','error',code);
    micWanted=false; voiceMeter?.stop?.(); voiceMeter=null;
    setMicState(false); closeTranscript();
    status.textContent='⚠️ '+friendly;
  };
  recognition.onend=()=>{
    clearSpeechTimer(); setMicState(false);
    if(micWanted&&document.visibilityState==='visible'){
      setTimeout(()=>{void startRecognitionPreferred();},220);
      return;
    }
    voiceMeter?.stop?.(); voiceMeter=null; closeTranscript();
  };

  micBtn.disabled=false;
  micBtn.title='Voz ao vivo em português do Brasil';
  micBtn.addEventListener('click',()=>{
    if(micWanted||micListening){stopMic();return;}
    micWanted=true; localMode=false;
    micBaseText=briefing.value.trim(); micFinalText=''; micInterimText='';
    paintTranscript();
    void startRecognitionPreferred();
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&micWanted)stopMic('Microfone desligado enquanto a aba estava em segundo plano.');
  });
}

async function readSse(response,onEvent){
  if(!response.ok){let d={};try{d=await response.json();}catch{}throw new Error(d.error||`HTTP ${response.status}`);}
  const reader=response.body.getReader(), decoder=new TextDecoder(); let buffer='';
  while(true){
    const {value,done}=await reader.read(); if(done)break; buffer+=decoder.decode(value,{stream:true});
    let cut; while((cut=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,cut);buffer=buffer.slice(cut+2);let event='message',data='';for(const line of block.split('\n')){if(line.startsWith('event:'))event=line.slice(6).trim();else if(line.startsWith('data:'))data+=line.slice(5).trim();}if(data)onEvent(event,JSON.parse(data));}
  }
}
async function runDecisionUpdate(texto,seq,{live=false}={}){
  texto=String(texto||'').trim();
  if(texto.split(/\s+/).filter(Boolean).length<2)return;
  copyController?.abort(); copyGenerating=false;
  const controller=new AbortController(); activeController=controller;
  latestCopy={}; latestComplete=false; latestVariation=[]; refreshProjectButtons();
  btn.disabled=true; $('#decisoes').textContent='0'; $('#latencia').textContent='—';
  Object.keys(channel).forEach(g=>setChannel(g,'working'));
  Object.keys(signal).forEach(g=>setSignal(g,'recebendo…',false));
  cables.start();
  voiceStage('jev','active','Enviando ao Jev');
  status.textContent=live?'🎙️ Ouvindo… nova direção de arte em processamento.':'Abrindo os 6 canais do Jev…';
  const started=performance.now(); let decisions=0, failures=0;
  try{
    const r=await fetch('/api/decidir',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({texto,seq}),signal:controller.signal});
    await readSse(r,(event,d)=>{
      if(controller!==activeController)return;
      if(event==='group'){
        const answers=applyLocksToGroup(d.group,d.answers||{});
        latestDecisions[d.group]=answers;
        const n=Object.keys(d.answers||{}).length;
        decisions+=n; $('#decisoes').textContent=String(decisions);
        setChannel(d.group,'done'); renderGroupSummary(d.group,answers,d.ms);
        if(d.group!=='entender')cables.arrive(d.group);
        status.textContent=live?`🎙️ Ouvindo… ${d.group} atualizado (${d.ms||0} ms).`:`${d.group}: ${n} decisões recebidas.`;
      } else if(event==='group_error'){
        failures+=1; setChannel(d.group,'error'); setSignal(d.group,d.code||'erro',false); status.textContent=d.error;
      } else if(event==='done'){
        const total=Math.round(performance.now()-started);
        $('#latencia').textContent=`${total} ms`;
        latestComplete=d.ok&&decisions===89; liveUpdateCount+=latestComplete?1:0; refreshProjectButtons(); voiceStage('jev',latestComplete?'ok':'error',latestComplete?'89 decisões recebidas':'Falha parcial no Jev');
        status.textContent=live&&micWanted
          ?`🎙️ Ouvindo… 89 decisões atualizadas em ${total} ms · atualização ${liveUpdateCount}. Continue falando.`
          :latestComplete?'89 decisões prontas. Você já pode salvar esta versão.':`Canais concluídos com ${failures} erro(s).`;
      }
    });
  }catch(e){
    if(e.name!=='AbortError')status.textContent=e.message;
  }finally{
    if(controller===activeController)btn.disabled=false;
    setTimeout(()=>{if(!decisionScheduler.inFlight)cables.stop();},900);
  }
}
function analyze(){
  const texto=briefing.value.trim();
  if(texto.split(/\s+/).filter(Boolean).length<2){status.textContent='Escreva pelo menos algumas palavras sobre o negócio.';return;}
  decisionScheduler.schedule({immediate:true});
}

btn.addEventListener('click',analyze);
briefing.addEventListener('input',()=>{if(!micWanted)decisionScheduler.schedule();});
briefing.addEventListener('keydown',(e)=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();decisionScheduler.schedule({immediate:true});}});
createProjectBtn.addEventListener('click',createProject);
projectSelect.addEventListener('change',selectProject);
saveVersionBtn.addEventListener('click',saveVersion);
openVersionsBtn.addEventListener('click',openVersions);
generateCopyBtn.addEventListener('click',generateCopy);
applyCommandBtn.addEventListener('click',applyCommand);
commandInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();applyCommand();}});
anotherVersionBtn.addEventListener('click',anotherVersion);
xrayBtn.addEventListener('click',openXray);
exportBtn.addEventListener('click',openExport);
exportSiteBtn.addEventListener('click',exportSite);
exportEmailBtn.addEventListener('click',exportEmail);
exportSignatureBtn.addEventListener('click',exportSignature);
copySignatureBtn.addEventListener('click',copySignature);
exportAdsBtn.addEventListener('click',exportAds);
exportJsonBtn.addEventListener('click',exportJson);
backJevBtn.addEventListener('click',backToJev);
setupMic();
await Promise.all([loadConfig(),loadProjects()]);
