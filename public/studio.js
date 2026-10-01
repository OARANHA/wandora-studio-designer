import { resetPieces, renderAll, renderBrand, renderSite, renderPosts, renderStories, renderEmail, renderAds, renderManual } from './render.mjs?v=20261001-engine3';
import { sampleGoodVariants, restoreJevChoices } from './variation.mjs?v=20261001-engine3';
import { buildSiteHtml, buildEmailHtml, buildSignatureHtml, buildAdsHtml, buildBrandManualHtml, buildProjectJson, downloadText, slugify } from './export.mjs?v=20261001-engine3';
import { createBackendVoiceCapture, createDecisionScheduler, createSignalCables, mergeTranscriptText } from './live.mjs?v=20261001-engine3';
const $ = (s) => document.querySelector(s);
const briefing=$('#briefing'), btn=$('#analisar'), status=$('#status'), providers=$('#providers');
const projectSelect=$('#project-select'), projectName=$('#project-name'), clientName=$('#client-name');
const createProjectBtn=$('#create-project'), saveVersionBtn=$('#save-version'), openVersionsBtn=$('#open-versions'), generateCopyBtn=$('#generate-copy');
const anotherVersionBtn=$('#another-version'), xrayBtn=$('#xray'), backJevBtn=$('#back-jev'), micBtn=$('#mic'), exportBtn=$('#export');
const commandInput=$('#command'), applyCommandBtn=$('#apply-command'), lockStrip=$('#lock-strip');
const versionsDialog=$('#versions-dialog'), versionsList=$('#versions-list'), xrayDialog=$('#xray-dialog'), xrayList=$('#xray-list'), xraySummary=$('#xray-summary');
const exportDialog=$('#export-dialog'), exportSiteBtn=$('#export-site'), exportEmailBtn=$('#export-email'), exportSignatureBtn=$('#export-signature'), copySignatureBtn=$('#copy-signature'), exportAdsBtn=$('#export-ads'), exportManualBtn=$('#export-manual'), exportJsonBtn=$('#export-json');
const openModelsBtn=$('#open-models'), modelsDialog=$('#models-dialog'), modelGrid=$('#model-grid'), modelRouteStatus=$('#model-route-status'), saveModelRoutingBtn=$('#save-model-routing');
const openAssetsBtn=$('#open-assets'), assetsDialog=$('#assets-dialog'), assetRole=$('#asset-role'), assetFile=$('#asset-file'), uploadAssetBtn=$('#upload-asset'), assetGrid=$('#asset-grid');
const mediaPrompt=$('#media-prompt'), generateImageBtn=$('#generate-image'), generateVideoBtn=$('#generate-video'), mediaStatus=$('#media-status');
const generateKitBtn=$('#generate-kit'), kitDialog=$('#kit-dialog'), confirmGenerateKitBtn=$('#confirm-generate-kit'), kitStatus=$('#kit-status');
const previewDialog=$('#preview-dialog'), previewTitle=$('#preview-title'), previewFrame=$('#preview-frame'), previewClone=$('#preview-clone'), previewCommand=$('#preview-command'), previewApplyBtn=$('#preview-apply'), previewExportBtn=$('#preview-export'), previewCloseBtn=$('#preview-close'), previewMicBtn=$('#preview-mic');
const pipelineBriefing=$('#pipeline-briefing'), pipelineMaterials=$('#pipeline-materials'), pipelineKit=$('#pipeline-kit'), heroCalloutTitle=$('#hero-callout-title'), heroCalloutText=$('#hero-callout-text');
let activeController=null, copyController=null, activeProject=null, latestDecisions={}, latestCopy={}, latestComplete=false, nvidiaReady=false, chutesReady=false, chutesImageReady=false, chutesVideoReady=false, writerReady=false, copyGenerating=false, latestVariation=[], questionInfo=null, commandBusy=false, lockedChoices={}, lockedTargets={}, commandHistory=[], lastAutoBriefingMediaKey='';
let modelCatalog=[], modelTasks={}, modelRouting={mode:'auto',selections:{}}, assetItems=[], projectV2={kitStatus:'draft',materials:[],siteStructure:{hero:{enabled:true,variant:'split'},sections:[]},creativePlan:null,studioContext:null,briefingFacts:{colors:[],palette:[],explicitColors:false}};
let activePreviewKind='';
function viewV2(){
  const liveFacts=extractBriefingFactsLocal(briefing?.value||'');
  return {...projectV2,briefingFacts:liveFacts.explicitColors?liveFacts:projectV2.briefingFacts,projectId:activeProject?.id||projectV2?.creativePlan?.projectId||''};
}
const liveTranscript=$('#live-transcript'), transcriptFinal=$('#transcript-final'), transcriptInterim=$('#transcript-interim'), briefingLabel=briefing.closest('.screen-label'), vuEl=$('.mic-row .vu');
const voiceDiag=$('#voice-diag'), voiceStages=Object.fromEntries([...voiceDiag.querySelectorAll('[data-stage]')].map(el=>[el.dataset.stage,el]));
let micListening=false, micWanted=false, micBaseText='', micFinalText='', micInterimText='', voiceCapture=null, voiceSession=0, liveUpdateCount=0;
const labels={seg:'Segmento',pers:'Personalidade',pub:'Público',obj:'Objetivo',canal:'Canal',preco:'Preço',mat:'Maturidade',dif:'Diferencial',oferta:'Oferta',emoji:'Emojis'};
const channel={entender:$('#ch-entender'),site:$('#ch-site'),marca:$('#ch-marca'),posts:$('#ch-posts'),email:$('#ch-email'),anuncios:$('#ch-anuncios')};
const signal={site:$('#signal-site'),marca:$('#brand-signal'),posts:$('#signal-posts'),email:$('#signal-email'),anuncios:$('#signal-anuncios')};
const cableTargets={site:$('.monitor.site'),posts:$('.monitor.posts'),marca:$('.monitor.brand-monitor'),email:$('.monitor.email'),anuncios:$('.monitor.ads')};
const cables=createSignalCables({svg:$('#signal-cables'),source:briefingLabel,targets:cableTargets});
const decisionScheduler=createDecisionScheduler({getText:()=>briefing.value,run:(text,seq)=>runDecisionUpdate(text,seq,{live:micWanted||micListening})});

const BRIEFING_COLOR_DEFS=[
  ['vermelho','Vermelho','#d62828',['vermelho','vermelha','red']],
  ['azul','Azul','#2563eb',['azul','azul royal','azul-royal','blue']],
  ['azul_marinho','Azul-marinho','#1b2a4e',['azul marinho','azul-marinho','marinho','navy']],
  ['verde','Verde','#1f9d55',['verde','green']],
  ['verde_limao','Verde-limão','#a3e635',['verde limao','verde-limao','verde neon']],
  ['preto','Preto','#111111',['preto','black']],
  ['branco','Branco','#ffffff',['branco','white']],
  ['amarelo','Amarelo','#facc15',['amarelo','yellow']],
  ['laranja','Laranja','#f97316',['laranja','orange']],
  ['rosa','Rosa','#ec6fa6',['rosa','pink']],
  ['roxo','Roxo','#6d28d9',['roxo','violeta','purple']],
  ['cinza','Cinza','#9aa0a8',['cinza','gray']],
  ['grafite','Grafite','#363b44',['grafite','chumbo','antracite']],
  ['bege','Bege','#e6d5b8',['bege','areia']],
  ['dourado','Dourado','#c9a55c',['dourado','ouro','gold']],
];
function briefNorm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function mixBriefHex(a,b,ratio=.5){
  const parse=h=>{const s=String(h||'').replace('#','');return /^[0-9a-f]{6}$/i.test(s)?[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)):null;};
  const x=parse(a),y=parse(b);if(!x||!y)return a||b||'#777777';
  const r=Math.max(0,Math.min(1,Number(ratio)||0));return '#'+x.map((v,i)=>Math.round(v*(1-r)+y[i]*r).toString(16).padStart(2,'0')).join('');
}
function extractBriefingFactsLocal(text=''){
  const raw=briefNorm(text),hasContext=/(?:\bcores?\b|\bpaleta\b|\bprimarias?\b|\bsecundarias?\b|\bidentidade\s+visual\b)/.test(raw);
  const found=[];
  for(const [id,name,hex,aliases] of BRIEFING_COLOR_DEFS){
    let pos=-1;
    for(const aliasRaw of aliases){
      const alias=briefNorm(aliasRaw).replace(/[.*+?^$()|[\]\\{}]/g,ch=>'\\'+ch).replace(/\s+/g,'\\s+');
      const re=new RegExp('(?:^|[^a-z0-9])('+alias+')(?=$|[^a-z0-9])','g');
      const m=re.exec(raw);if(m){pos=m.index+(m[0].length-m[1].length);break;}
    }
    if(pos>=0)found.push({id,name,hex,index:pos});
  }
  found.sort((a,b)=>a.index-b.index);
  const colors=(hasContext||found.length>=2?found:[]).slice(0,4).map(({id,name,hex})=>({id,name,hex}));
  let palette=[];
  if(colors.length===1)palette=[colors[0].hex,'#111111','#f7f7f4',mixBriefHex(colors[0].hex,'#ffffff',.65),mixBriefHex(colors[0].hex,'#000000',.35)];
  else if(colors.length===2)palette=[colors[0].hex,colors[1].hex,'#f7f7f4','#111111',mixBriefHex(colors[0].hex,colors[1].hex,.5)];
  else if(colors.length>=3)palette=[colors[0].hex,colors[1].hex,'#f7f7f4','#111111',colors[2].hex];
  return {colors,palette,explicitColors:colors.length>0};
}
function syncBriefingFacts(text=briefing.value){
  projectV2={...projectV2,briefingFacts:extractBriefingFactsLocal(text)};
}
async function refreshStudioContext(text=briefing.value){
  const d=await json('/api/v2/context',{method:'POST',body:JSON.stringify({
    briefing:text,
    decisions:latestDecisions,
    brandName:activeProject?.clientName||'',
  })});
  const liveFacts=extractBriefingFactsLocal(text);
  projectV2={
    ...projectV2,
    studioContext:d.context,
    briefingFacts:liveFacts.explicitColors?liveFacts:(d.context?.briefingFacts||projectV2.briefingFacts),
  };
  try{renderAll(latestDecisions,latestCopy,viewV2());}catch(e){console.error('renderAll/context',e);}
  try{renderSiteThumbnail();}catch(e){console.error('renderSite/context',e);}
  if(previewDialog?.open){try{renderPreviewContent(activePreviewKind);}catch(e){console.error('preview/context',e);}}
  return d.context;
}
let decisionFinalizeKey='';
async function finalizeDecisionState(text,{autoStory=false}={}){
  const finalCount=Object.values(latestDecisions).reduce((n,g)=>n+Object.keys(g||{}).length,0);
  if(finalCount!==89)return false;
  latestComplete=true;
  refreshProjectButtons();
  const key=String(text||'').trim()+'|'+finalCount;
  if(decisionFinalizeKey===key)return true;
  decisionFinalizeKey=key;
  try{await refreshStudioContext(text);}catch(e){status.textContent='89 decisões recebidas, mas o contexto falhou: '+e.message;return true;}
  refreshProjectButtons();
  if(autoStory){
    try{await maybeAutoGenerateBriefingStory(text);}catch(e){status.textContent='Briefing analisado, mas a imagem do Story falhou: '+e.message;}
  }
  return true;
}
function setPipelineState(el,state,label){if(!el)return;el.dataset.state=state;const i=el.querySelector('i'),s=el.querySelector('span');if(i)i.textContent=state==='done'?'✓':state==='working'?'◌':'○';if(s&&label)s.textContent=label;}
function updatePipeline(){
  const kit=projectV2?.kitStatus||'draft';
  setPipelineState(pipelineBriefing,latestComplete?'done':'idle',latestComplete?'Briefing analisado':'Briefing aguardando');
  const generating=kit==='planning'||kit==='generating';
  setPipelineState(pipelineMaterials,kit==='ready'?'done':generating?'working':'idle',kit==='ready'?'Materiais gerados':generating?'Materiais em criação':'Materiais pendentes');
  setPipelineState(pipelineKit,kit==='ready'?'done':'idle',kit==='ready'?'Kit completo':'Kit pendente');
  if(!heroCalloutTitle||!heroCalloutText)return;
  if(kit==='ready'){heroCalloutTitle.textContent='Tudo pronto!';heroCalloutText.textContent='Textos, direção visual e mídias foram aplicados ao kit.';}
  else if(generating){heroCalloutTitle.textContent='Criando seu kit…';heroCalloutText.textContent='O Studio está produzindo e aplicando os materiais do projeto.';}
  else if(latestComplete){heroCalloutTitle.textContent='Briefing entendido';heroCalloutText.textContent='Agora gere o kit completo para produzir textos, imagens e composições.';}
  else{heroCalloutTitle.textContent='Conte sobre o negócio';heroCalloutText.textContent='O Studio vai analisar o briefing antes de produzir o kit.';}
}

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
  draw?.(latestDecisions,latestCopy,viewV2());
  if(group==='posts')renderStories(latestDecisions,latestCopy,viewV2());
  if(group==='marca')renderManual(latestDecisions,latestCopy,viewV2());
  if(group==='site')renderSiteThumbnail();
  if(previewDialog?.open){
    const relevant={site:['site'],brand:['marca'],instagram:['posts'],carousel:['posts'],stories:['posts'],email:['email'],ads:['anuncios'],manual:['marca']}[activePreviewKind]||[];
    if(relevant.includes(group))requestAnimationFrame(()=>renderPreviewContent(activePreviewKind));
  }
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
  generateCopyBtn.disabled=!latestComplete || !writerReady || copyGenerating;
  openAssetsBtn.disabled=!activeProject;
  generateKitBtn.disabled=briefing.value.trim().split(/\s+/).filter(Boolean).length<2 || copyGenerating;
  openModelsBtn.textContent=`MODELOS · ${String(modelRouting.mode||'auto').toUpperCase()}`;
  anotherVersionBtn.disabled=!latestComplete;
  xrayBtn.disabled=!latestComplete;
  applyCommandBtn.disabled=commandBusy;
  backJevBtn.hidden=!latestVariation.length;
  exportBtn.disabled=!latestComplete;
  updatePipeline();
}
async function json(url,opts={}){
  const r=await fetch(url,{...opts,headers:{'content-type':'application/json',...(opts.headers||{})}});
  const d=await r.json(); if(!r.ok)throw Object.assign(new Error(d.error||'Erro'),{data:d,status:r.status}); return d;
}
async function loadConfig(){
  try{
    const c=await json('/api/config');
    nvidiaReady=!!c.providers.nvidia.configured;
    chutesReady=!!c.providers.chutes?.configured;
    const mediaCaps=c.providers.chutes?.media||{};
    chutesImageReady=chutesReady&&!!(mediaCaps.fast?.configured||mediaCaps.quality?.configured||mediaCaps.style?.configured||c.providers.chutes?.image);
    chutesVideoReady=chutesReady&&!!(mediaCaps.video?.configured||c.providers.chutes?.video);
    writerReady=nvidiaReady||chutesReady;
    providers.textContent=`JEV ${c.providers.jev.configured?'●':'○'} · NVIDIA ${nvidiaReady?'●':'○'} · CHUTES ${chutesReady?'●':'○'} · VOZ ${c.providers.speech?.configured?'●':'○'} · V2`;
    providers.classList.toggle('ready',c.providers.jev.configured&&writerReady);
    generateCopyBtn.title=writerReady?'Writer roteado pelo Jev':'Configure NVIDIA_API_KEY ou CHUTES_API_KEY';
    generateImageBtn.disabled=!chutesImageReady; generateVideoBtn.disabled=!chutesVideoReady;
    generateImageBtn.title=chutesImageReady?'Gerar imagem com roteamento Chutes (Z-Image / Qwen / Imageclassic)':'Configure CHUTES_API_KEY e os workers de imagem';
    generateVideoBtn.title=chutesVideoReady?'Gerar vídeo curto no Chutes':'Configure CHUTES_API_KEY e CHUTES_VIDEO_URL';
    refreshProjectButtons();
  }catch{providers.textContent='IA indisponível';nvidiaReady=false;chutesReady=false;chutesImageReady=false;chutesVideoReady=false;writerReady=false;generateImageBtn.disabled=true;generateVideoBtn.disabled=true;refreshProjectButtons();}
}
async function loadProjects(selectId=null){
  const d=await json('/api/projects');
  const previous=selectId || activeProject?.id || projectSelect.value;
  projectSelect.replaceChildren(new Option('Novo projeto…',''));
  for(const p of d.projects) projectSelect.add(new Option(`${p.name}${p.versionCount?` · v${p.versionCount}`:''}`,p.id));
  if(previous && d.projects.some(p=>p.id===previous)){
    projectSelect.value=previous; activeProject=d.projects.find(p=>p.id===previous);
    modelRouting=activeProject.modelRouting||{mode:'auto',selections:{}};
    projectV2=activeProject.v2||{kitStatus:'draft',materials:[],siteStructure:{hero:{enabled:true,variant:'split'},sections:[]},creativePlan:null,studioContext:null,briefingFacts:{colors:[],palette:[],explicitColors:false}};
  }
  else if(!previous){ activeProject=null; projectSelect.value=''; modelRouting={mode:'auto',selections:{}}; projectV2={kitStatus:'draft',materials:[],siteStructure:{hero:{enabled:true,variant:'split'},sections:[]},creativePlan:null,studioContext:null,briefingFacts:{colors:[],palette:[],explicitColors:false}}; }
  refreshProjectButtons();
}
async function createProject(){
  const name=projectName.value.trim(); if(name.length<2){status.textContent='Dê um nome ao projeto primeiro.';projectName.focus();return;}
  createProjectBtn.disabled=true;
  try{
    const d=await json('/api/projects',{method:'POST',body:JSON.stringify({name,clientName:clientName.value,briefing:briefing.value})});
    activeProject=d.project; modelRouting=d.project.modelRouting||{mode:'auto',selections:{}}; projectV2=d.project.v2||{kitStatus:'draft',materials:[],siteStructure:{hero:{enabled:true,variant:'split'},sections:[]},creativePlan:null,studioContext:null,briefingFacts:{colors:[],palette:[],explicitColors:false}}; projectName.value=''; clientName.value=''; await loadProjects(d.project.id);
    status.textContent=`Projeto “${d.project.name}” criado.`;
  }catch(e){status.textContent=e.message;}finally{createProjectBtn.disabled=false;}
}
async function selectProject(){
  const id=projectSelect.value;
  if(!id){activeProject=null;modelRouting={mode:'auto',selections:{}};projectV2={kitStatus:'draft',materials:[],siteStructure:{hero:{enabled:true,variant:'split'},sections:[]},creativePlan:null,studioContext:null,briefingFacts:{colors:[],palette:[],explicitColors:false}};refreshProjectButtons();status.textContent='Novo projeto: dê um nome e crie quando quiser salvar versões.';return;}
  try{
    const d=await json(`/api/projects/${id}`); activeProject=d.project; briefing.value=d.project.briefing||''; modelRouting=d.project.modelRouting||{mode:'auto',selections:{}}; projectV2=d.project.v2||{kitStatus:'draft',materials:[],siteStructure:{hero:{enabled:true,variant:'split'},sections:[]},creativePlan:null,studioContext:null,briefingFacts:{colors:[],palette:[],explicitColors:false}}; resetSignals(); refreshProjectButtons();
    status.textContent=`Projeto “${d.project.name}” carregado · ${d.project.versionCount||0} versão(ões) · modelos ${modelRouting.mode}.`;
  }catch(e){status.textContent=e.message;}
}
async function saveVersion(){
  if(!activeProject || !latestComplete)return;
  saveVersionBtn.disabled=true; status.textContent='Salvando versão…';
  try{
    await json(`/api/projects/${activeProject.id}`,{method:'PATCH',body:JSON.stringify({briefing:briefing.value})});
    const d=await json(`/api/projects/${activeProject.id}/versions`,{method:'POST',body:JSON.stringify({briefing:briefing.value,decisions:latestDecisions,copy:latestCopy,reason:'manual',metadata:{decisionCount:Object.values(latestDecisions).reduce((n,g)=>n+Object.keys(g||{}).length,0),variationChanges:latestVariation,lockedChoices,lockedTargets,modelRouting,projectV2}})});
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
    briefing.value=v.briefing||''; latestDecisions=v.decisions||{}; latestCopy=v.copy||{}; latestVariation=Array.isArray(v.metadata?.variationChanges)?v.metadata.variationChanges:[]; lockedChoices=v.metadata?.lockedChoices&&typeof v.metadata.lockedChoices==='object'?v.metadata.lockedChoices:{}; lockedTargets=v.metadata?.lockedTargets&&typeof v.metadata.lockedTargets==='object'?v.metadata.lockedTargets:{}; modelRouting=v.metadata?.modelRouting||modelRouting; projectV2=v.metadata?.projectV2||projectV2; renderLocks();
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
  renderAll(latestDecisions,latestCopy,viewV2()); renderSiteThumbnail(); refreshProjectButtons();
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
  latestDecisions=r.decisions; latestVariation=[]; renderAll(latestDecisions,latestCopy,viewV2()); renderSiteThumbnail();
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
    latestVariation=[];renderAll(latestDecisions,latestCopy,viewV2()); renderSiteThumbnail();renderLocks();refreshProjectButtons();
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
function applySiteRouteClient(route){
  const current=projectV2.siteStructure||{hero:{enabled:true,variant:'split'},sections:[]};
  const next={hero:{enabled:current.hero?.enabled!==false,variant:current.hero?.variant||'split'},sections:[...(current.sections||[])]};
  if(route.section==='hero'){
    if(route.operation==='remove')next.hero.enabled=false;
    if(route.operation==='add'||route.operation==='edit'){next.hero.enabled=true;next.hero.variant=route.heroVariant||next.hero.variant;}
  }else{
    if(route.operation==='add'||route.operation==='edit'){if(!next.sections.includes(route.section))next.sections.push(route.section);}
    if(route.operation==='remove')next.sections=next.sections.filter(x=>x!==route.section);
    if(route.operation==='reorder'&&next.sections.includes(route.section)){next.sections=next.sections.filter(x=>x!==route.section);next.sections.unshift(route.section);}
  }
  projectV2={...projectV2,siteStructure:next};
  return next;
}
function localStructuralIntent(comando){
  const s=String(comando||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,' ');
  const sectionTests=[
    ['hero',/\b(hero|topo|primeira\s+dobra|banner\s+principal)\b/],
    ['faq',/\b(faq|perguntas?\s+frequentes|duvidas?)\b/],
    ['benefits',/\b(beneficios?|vantagens?|diferenciais?)\b/],
    ['proof',/\b(prova\s+social|depoimentos?|avaliacoes?|clientes?)\b/],
    ['features',/\b(servicos?|recursos?|funcionalidades?|solucoes?)\b/],
    ['process',/\b(como\s+funciona|processo|etapas?|passo\s+a\s+passo)\b/],
    ['gallery',/\b(galeria|portfolio|fotos?|trabalhos?)\b/],
    ['pricing',/\b(precos?|planos?|valores?|pacotes?)\b/],
    ['lead',/\b(formulario|captura\s+de\s+lead|lead|contato)\b/],
    ['cta',/\b(cta|call\s+to\s+action|chamada\s+final|conversao\s+final)\b/],
    ['footer',/\b(rodape|footer)\b/],
  ];
  const hit=sectionTests.find(([,rx])=>rx.test(s));
  if(!hit)return null;
  let operation='edit';
  if(/\b(cria|crie|criar|adiciona|adicione|adicionar|coloca|coloque|incluir|inclui|insere|insira|bota|botar)\b/.test(s))operation='add';
  else if(/\b(remove|remova|tirar|tira|excluir|exclui|apagar|apaga|esconder|esconde)\b/.test(s))operation='remove';
  else if(/\b(move|mover|sobe|subir|desce|descer|reordena|reordenar)\b/.test(s))operation='reorder';
  const section=hit[0];
  let heroVariant='split';
  if(section==='hero'){
    if(/\b(desenho|ilustracao|ilustrado|illustration)\b/.test(s))heroVariant='illustration';
    else if(/\b(video|cinematica|cinematico|movimento)\b/.test(s))heroVariant='video';
    else if(/\b(produto|embalagem|oculos|relogio|lata)\b/.test(s))heroVariant='product';
    else if(/\b(fundo\s+inteiro|imagem\s+de\s+fundo|tela\s+cheia|full\s*background)\b/.test(s))heroVariant='full_background';
    else if(/\b(mascote|personagem|robo|robot)\b/.test(s))heroVariant='mascot_right';
    else if(/\b(dashboard|painel|mockup|interface)\b/.test(s))heroVariant='dashboard_right';
    else if(/\b(central|centralizado|centrado)\b/.test(s))heroVariant='centered';
    else if(/\b(editorial|revista|tipografico|tipografia\s+grande)\b/.test(s))heroVariant='editorial';
  }
  return {operation,section,heroVariant,source:'local'};
}
async function persistStructuralRoute(route){
  applySiteRouteClient(route);
  if(activeProject){
    const d=await json(`/api/projects/${activeProject.id}`,{method:'PATCH',body:JSON.stringify({v2:projectV2})});
    activeProject=d.project;projectV2=d.project.v2||projectV2;
  }
  renderAll(latestDecisions,latestCopy,viewV2()); renderSiteThumbnail();
  selectV2Tab('site');
  commandInput.value='';
  const verbs={add:'criada',edit:'atualizada',remove:'removida',reorder:'reposicionada'};
  status.textContent=`🏗️ Seção ${route.section} ${verbs[route.operation]||'atualizada'}${route.section==='hero'?` · ${route.heroVariant}`:''}.`;
  return true;
}
async function tryStructuralSiteCommand(comando,target='site',tipo='comando_de_edicao'){
  const local=localStructuralIntent(comando);
  if(local)return persistStructuralRoute(local);
  if(target!=='site'||tipo!=='comando_de_edicao')return false;
  const route=await json('/api/v2/site-command',{method:'POST',body:JSON.stringify({command:comando,briefing:briefing.value,current:projectV2.siteStructure||{}})});
  if(!route.ok||route.operation==='none')return false;
  return persistStructuralRoute(route);
}
function briefingStoryIntent(text){
  const s=briefNorm(text);
  const story=/\b(story|stories|reel|reels)\b/.test(s);
  const visual=/\b(imagem|foto|fundo|background|fumaca|smoke|desenho|ilustracao|visual|cena|ambiente|academia|clinica|produto|pessoa)\b/.test(s);
  const ask=/\b(quero|coloca|colocar|gera|gerar|cria|criar|fundo|imagem|foto|fumaca)\b/.test(s);
  if(!story||!visual||!ask)return null;
  let n=1;
  if(/\b(2|02|segundo|segunda)\b/.test(s))n=2;
  else if(/\b(3|03|terceiro|terceira)\b/.test(s))n=3;
  return {slot:`stories.${String(n).padStart(2,'0')}`,label:`Story ${n}`};
}
async function ensureCreativePlanForStory(text){
  await ensureActiveProjectForKit();
  const existing=projectV2?.creativePlan;
  const hasStory=Array.isArray(existing?.assets)&&existing.assets.some(a=>String(a?.slot||'').startsWith('stories.'));
  if(hasStory)return existing;
  const materials=[...new Set([...(existing?.deliverables||projectV2?.materials||[]),'site','stories'])];
  status.textContent='Preparando o Story no plano criativo…';
  const planned=await json('/api/v2/creative-plan',{method:'POST',body:JSON.stringify({
    projectId:activeProject.id,briefing:text,materials,decisions:latestDecisions,studioContext:projectV2.studioContext,useJev:true,
  })});
  projectV2=planned.v2||{...projectV2,creativePlan:planned.plan,studioContext:planned.plan?.studioContext||projectV2.studioContext,materials,kitStatus:'planning'};
  activeProject={...activeProject,v2:projectV2};
  return projectV2.creativePlan;
}
async function maybeAutoGenerateBriefingStory(text){
  const intent=briefingStoryIntent(text);
  if(!intent||!chutesImageReady)return false;
  const key=`${activeProject?.id||'new'}|${intent.slot}|${String(text||'').trim()}`;
  if(key===lastAutoBriefingMediaKey&&projectV2?.creativePlan?.assets?.some(a=>a?.slot===intent.slot&&a?.assetId))return false;

  const plan=await ensureCreativePlanForStory(text);
  const item=plan?.assets?.find(a=>a?.slot===intent.slot);
  if(!item)return false;

  status.textContent=`Gerando imagem real para ${intent.label}…`;
  projectV2={...projectV2,kitStatus:'generating'};updatePipeline();

  const d=await json('/api/v2/media/materialize-slot',{method:'POST',body:JSON.stringify({
    projectId:activeProject.id,
    slot:intent.slot,
    instruction:text,
    useJev:true,
  })});

  projectV2=d.v2||{
    ...projectV2,
    creativePlan:d.plan,
    briefingFacts:d.plan?.briefingFacts||projectV2.briefingFacts,
    studioContext:d.plan?.studioContext||projectV2.studioContext,
    kitStatus:d.plan?.status==='ready'?'ready':'generating',
  };
  activeProject={...activeProject,v2:projectV2};
  lastAutoBriefingMediaKey=key;

  renderAll(latestDecisions,latestCopy,viewV2());
  renderSiteThumbnail();
  if(previewDialog?.open&&activePreviewKind==='stories')renderPreviewContent('stories');
  updatePipeline();

  const attached=projectV2?.creativePlan?.assets?.find(a=>a?.slot===intent.slot&&a?.assetId);
  status.textContent=attached
    ?`✓ ${intent.label} recebeu uma imagem real do Chutes.`
    :`⚠ A geração terminou, mas ${intent.label} ainda não recebeu o asset.`;
  return !!attached;
}
function localCreativeMediaIntent(text){
  const s=String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const change=/\b(troca|trocar|muda|mudar|substitui|substituir|refaz|refazer|gera|gerar|coloca|colocar|quero|deixa|deixar)\b/.test(s);
  const visual=/\b(imagem|foto|fundo|desenho|ilustracao|visual|cena|ambiente|pessoa|mulher|homem|produto|oculos|relogio|parede|academia|clinica)\b/.test(s);
  if(!change||!visual)return null;
  if(/\b(hero|topo|primeira\s+dobra|banner\s+principal)\b/.test(s))return {slot:'site.hero',label:'Hero'};
  if(/\b(story|stories|reel|reels)\b/.test(s)){
    let n=1;
    if(/\b(2|02|segundo|segunda)\b/.test(s))n=2;
    else if(/\b(3|03|terceiro|terceira)\b/.test(s))n=3;
    else if(/\b(1|01|primeiro|primeira)\b/.test(s))n=1;
    const slot=`stories.${String(n).padStart(2,'0')}`;
    return {slot,label:`Story ${n}`};
  }
  return null;
}
async function tryCreativeMediaCommand(comando){
  const intent=localCreativeMediaIntent(comando);
  if(!intent)return false;
  if(!activeProject)await ensureActiveProjectForKit();
  if(intent.slot.startsWith('stories.')&&!projectV2?.creativePlan?.assets?.some(a=>a?.slot===intent.slot)){
    await ensureCreativePlanForStory(`${briefing.value}\nAjuste solicitado: ${comando}`);
  }
  if(!projectV2?.creativePlan?.assets?.some(a=>a?.slot===intent.slot))return false;
  if(!chutesImageReady){
    status.textContent=`Entendi a mudança visual em ${intent.label}, mas o Chutes de imagem ainda não está conectado neste servidor.`;
    return true;
  }
  const currentItem=projectV2?.creativePlan?.assets?.find(a=>a?.slot===intent.slot);
  const endpoint=currentItem?.assetId?'/api/v2/media/revise-slot':'/api/v2/media/materialize-slot';
  status.textContent=currentItem?.assetId
    ?`Diretor Criativo revisando ${intent.label}…`
    :`Gerando imagem real para ${intent.label}…`;
  const d=await json(endpoint,{method:'POST',body:JSON.stringify({
    projectId:activeProject.id,slot:intent.slot,instruction:comando,useJev:true,
  })});
  projectV2=d.v2||{...projectV2,creativePlan:d.plan,kitStatus:d.plan?.status==='ready'?'ready':'generating'};
  activeProject={...activeProject,v2:projectV2};
  latestVariation=[];
  renderAll(latestDecisions,latestCopy,viewV2());renderSiteThumbnail();renderLocks();
  commandInput.value='';
  if(previewDialog?.open)renderPreviewContent(activePreviewKind);
  status.textContent=`✨ ${intent.label} recriado · ${d.route?.model||d.route?.provider||'IA'} → Chutes.`;
  return true;
}

async function applyCommand(){
  const comando=commandInput.value.trim();
  if(comando.split(/\s+/).length<2){status.textContent='Digite o que quer mudar em algumas palavras.';return;}
  commandBusy=true;refreshProjectButtons();status.textContent=`Entendendo “${comando}”…`;
  try{
    if(await tryCreativeMediaCommand(comando))return;
    if(await tryStructuralSiteCommand(comando))return;
    if(!latestComplete){status.textContent='Para ajustes de identidade, conclua primeiro a análise do briefing.';return;}
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
      latestVariation=[];renderAll(latestDecisions,latestCopy,viewV2()); renderSiteThumbnail();renderLocks();commandInput.value='';refreshProjectButtons();
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
    brand:{name:activeProject?.clientName||'',slogan:fields.slogan||''},
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
  if(!writerReady){status.textContent='Configure NVIDIA_API_KEY ou CHUTES_API_KEY para escrever os textos.';return;}
  copyController?.abort(); copyController=new AbortController(); const controller=copyController;
  copyGenerating=true; refreshProjectButtons(); generateCopyBtn.textContent='IA ESCREVENDO…'; status.textContent='Jev escolhendo o Writer…';
  try{
    const r=await fetch('/api/escrever',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({texto:briefing.value,decisoes:latestDecisions,modelMode:modelRouting.mode,modelKey:modelRouting.selections?.copy||''}),signal:controller.signal});
    await readSse(r,(event,d)=>{
      if(controller!==copyController)return;
      if(event==='inicio') status.textContent=`${String(d.provider||'IA').toUpperCase()} · ${d.model} · ${d.route?.reason||'iniciando…'}`;
      if(event==='tok' && d.fields){
        latestCopy=copyShape(d.fields);
        renderAll(latestDecisions,latestCopy,viewV2()); renderSiteThumbnail();
        const n=Object.values(d.fields).filter(Boolean).length;
        status.textContent=`IA escrevendo… ${n}/11 campos`;
      }
      if(event==='fim'){
        latestCopy=copyShape(d.fields||{});
        renderAll(latestDecisions,latestCopy,viewV2()); renderSiteThumbnail();
        status.textContent=d.complete?`11 textos prontos · primeira palavra em ${d.first_token_ms??'—'} ms · total ${d.ms} ms`:`IA terminou com ${Object.values(d.fields||{}).filter(Boolean).length}/11 campos.`;
      }
      if(event==='erro') throw Object.assign(new Error(d.error||'Falha da NVIDIA.'),{code:d.code});
    });
  }catch(e){
    if(e.name!=='AbortError') status.textContent=e.message;
  }finally{
    if(controller===copyController){copyGenerating=false;generateCopyBtn.textContent='TEXTOS IA';refreshProjectButtons();}
  }
}


async function loadModelCatalog({refresh=false}={}){
  const d=await json(`/api/models${refresh?'?refresh=1':''}`);
  modelCatalog=d.models||[];modelTasks=d.tasks||{};
  return d;
}
function modelsForTask(task){
  return modelCatalog.filter(m=>{
    if(!m.configured)return false;
    if(task==='image')return m.output?.includes('image');
    if(task==='video')return m.output?.includes('video');
    return m.output?.includes('text')&&(m.strengths?.includes(task)||!(m.strengths||[]).length);
  });
}
function renderModelGrid(){
  modelGrid.replaceChildren();
  for(const [task,meta] of Object.entries(modelTasks)){
    const card=document.createElement('section');card.className='model-task';
    const head=document.createElement('header'),b=document.createElement('b'),em=document.createElement('em');
    b.textContent=meta.label;em.textContent=task.toUpperCase();head.append(b,em);
    const sel=document.createElement('select');sel.dataset.task=task;
    const options=modelsForTask(task);
    sel.append(new Option(options.length?'Jev escolhe automaticamente':'Nenhum worker disponível',''));
    for(const m of options)sel.append(new Option(`${m.label} · ${m.provider}`,m.key));
    sel.value=modelRouting.selections?.[task]||'';
    sel.disabled=modelRouting.mode==='auto';
    sel.addEventListener('change',()=>{modelRouting.selections={...(modelRouting.selections||{}),[task]:sel.value};});
    const p=document.createElement('p');
    p.textContent=options.length?`${options.length} worker(s) disponível(is). Em Auto o Jev decide por tarefa.`:(task==='image'||task==='video'?'Configure o endpoint de mídia do Chutes no Portainer.':'Nenhum provider configurado.');
    card.append(head,sel,p);modelGrid.append(card);
  }
}
async function openModels(){
  modelsDialog.querySelectorAll('input[name="routing-mode"]').forEach(r=>{r.checked=r.value===modelRouting.mode;});
  modelsDialog.showModal();modelRouteStatus.textContent='Consultando providers…';
  try{await loadModelCatalog({refresh:true});renderModelGrid();modelRouteStatus.textContent=`${modelCatalog.filter(m=>m.configured).length} worker(s) disponível(is).`;}
  catch(e){modelRouteStatus.textContent=e.message;}
}
function routingModeChanged(){
  const input=modelsDialog.querySelector('input[name="routing-mode"]:checked');
  modelRouting.mode=input?.value||'auto';renderModelGrid();
}
async function saveModelRouting(){
  modelRouting.mode=modelsDialog.querySelector('input[name="routing-mode"]:checked')?.value||'auto';
  if(modelRouting.mode==='auto')modelRouting.selections={};
  if(activeProject){
    const d=await json(`/api/projects/${activeProject.id}`,{method:'PATCH',body:JSON.stringify({modelRouting})});
    activeProject=d.project;modelRouting=d.project.modelRouting||modelRouting;
  }
  refreshProjectButtons();modelRouteStatus.textContent=`Roteamento ${modelRouting.mode} salvo`;status.textContent=`Modelos: modo ${modelRouting.mode}.`;
}
async function loadAssets(){
  if(!activeProject)return;
  const d=await json(`/api/projects/${activeProject.id}/assets`);assetItems=d.assets||[];renderAssets();
}
function renderAssets(){
  assetGrid.replaceChildren();
  if(!assetItems.length){const p=document.createElement('p');p.textContent='Nenhum ativo enviado ainda. Suba o logo ou mascote deste cliente.';assetGrid.append(p);return;}
  for(const a of assetItems){
    const card=document.createElement('article');card.className='asset-card';if(String(a.role).startsWith('generated-'))card.classList.add('generated');
    const url=`/api/projects/${activeProject.id}/assets/${a.id}/content`;
    let media;
    if(a.contentType==='video/mp4'){
      media=document.createElement('video');media.src=url;media.controls=true;media.muted=true;media.preload='metadata';media.playsInline=true;
    }else{
      media=document.createElement('img');media.src=url;media.alt=a.name;media.loading='lazy';
    }
    const meta=document.createElement('div');meta.className='asset-meta';const b=document.createElement('b'),small=document.createElement('small');b.textContent=a.name;small.textContent=`${a.role} · ${Math.ceil(a.size/1024)} KB`;meta.append(b,small);
    const del=document.createElement('button');del.type='button';del.textContent='×';del.title='Excluir ativo';
    del.addEventListener('click',async()=>{await fetch(`/api/projects/${activeProject.id}/assets/${a.id}`,{method:'DELETE'});await loadAssets();});
    card.append(media,meta,del);assetGrid.append(card);
  }
}
async function openAssets(){if(!activeProject)return;assetsDialog.showModal();assetGrid.textContent='Carregando…';try{await loadAssets();}catch(e){assetGrid.textContent=e.message;}}
async function uploadAsset(){
  if(!activeProject)return;const file=assetFile.files?.[0];if(!file){status.textContent='Escolha um arquivo primeiro.';return;}
  uploadAssetBtn.disabled=true;
  try{
    const r=await fetch(`/api/projects/${activeProject.id}/assets`,{method:'POST',headers:{'content-type':file.type,'x-asset-role':assetRole.value,'x-file-name':encodeURIComponent(file.name)},body:file});
    const d=await r.json();if(!r.ok)throw new Error(d.error||'Falha no upload.');
    assetFile.value='';await loadAssets();status.textContent=`Ativo “${d.asset.name}” salvo no projeto.`;
  }catch(e){status.textContent=e.message;}finally{uploadAssetBtn.disabled=false;}
}
async function generateMedia(kind){
  if(!activeProject)return;
  const prompt=mediaPrompt.value.trim();
  if(prompt.length<4){mediaStatus.textContent='Descreva o visual que quer criar.';mediaPrompt.focus();return;}
  const button=kind==='image'?generateImageBtn:generateVideoBtn;
  button.disabled=true;
  mediaStatus.textContent=kind==='image'?'Gerando imagem no Chutes…':'Gerando vídeo curto no Chutes… isso pode levar alguns minutos.';
  try{
    const d=await json(`/api/v2/media/${kind}`,{method:'POST',body:JSON.stringify({projectId:activeProject.id,prompt})});
    await loadAssets();
    const routedLabel=d.route?.model||d.route?.worker||'Chutes';
    mediaStatus.textContent=`✓ ${kind==='image'?'Imagem':'Vídeo'} salvo nos ativos · ${routedLabel}`;
    status.textContent=`Mídia IA criada por ${routedLabel} e anexada ao projeto.`;
  }catch(e){
    mediaStatus.textContent=`⚠ ${e.message}`;
  }finally{
    button.disabled=kind==='image'?!chutesImageReady:!chutesVideoReady;
  }
}

function openKit(){kitStatus.textContent='';kitDialog.showModal();}

async function ensureActiveProjectForKit(){
  if(activeProject)return activeProject;
  const seg=String(latestDecisions?.entender?.seg?.choice||'projeto').replaceAll('_',' ');
  const stamp=new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',','');
  const facts=projectV2.briefingFacts||extractBriefingFactsLocal(briefing.value);
  const d=await json('/api/projects',{method:'POST',body:JSON.stringify({name:`Kit · ${seg} · ${stamp}`,clientName:'',briefing:briefing.value})});
  activeProject=d.project;modelRouting=d.project.modelRouting||modelRouting;
  await loadProjects(d.project.id);
  projectV2={...projectV2,briefingFacts:facts};
  refreshProjectButtons();
  return activeProject;
}

async function materializeCreativeAssets(plan){
  if(!plan||!Array.isArray(plan.assets))return plan;
  const queue=plan.assets.filter(a=>a?.kind==='image'&&a?.auto!==false&&a?.required!==false&&!a?.assetId);
  if(!queue.length){
    plan.status='ready';plan.progress={total:plan.assets.length,ready:plan.assets.filter(a=>a?.assetId).length,failed:plan.assets.filter(a=>a?.status==='failed').length};
    return plan;
  }
  if(!chutesImageReady){
    plan.status='planned';
    plan.progress={total:plan.assets.length,ready:plan.assets.filter(a=>a?.assetId).length,failed:0};
    return plan;
  }
  let done=plan.assets.filter(a=>a?.assetId).length,failed=0;
  for(let i=0;i<queue.length;i++){
    const item=queue[i];
    item.status='generating';item.error=null;
    projectV2={...projectV2,kitStatus:'generating',creativePlan:plan};
    updatePipeline();
    kitStatus.textContent=`4/5 · Chutes criando mídia ${i+1}/${queue.length} · ${item.slot}`;
    try{
      const d=await json('/api/v2/media/image',{method:'POST',body:JSON.stringify({
        projectId:activeProject.id,
        prompt:item.prompt,
        negativePrompt:item.negativePrompt,
        width:item.width,
        height:item.height,
        slot:item.slot,
        role:item.role,
        purpose:item.purpose,
        mediaMode:item.mediaMode,
        archetype:plan?.brand?.archetype,
        workerHint:item.workerHint,
        styleModel:item.styleModel,
        useJev:true,
      })});
      item.assetId=d.asset.id;
      item.contentUrl=`/api/projects/${activeProject.id}/assets/${d.asset.id}/content`;
      item.mediaWorker=d.route?.worker||item.workerHint||null;
      item.mediaModel=d.route?.model||null;
      item.styleModel=d.route?.styleModel||item.styleModel||null;
      item.routeReason=d.route?.reason||null;
      item.status='attached';done++;
    }catch(e){
      item.status='failed';item.error=String(e.message||'Falha ao gerar mídia').slice(0,280);failed++;
    }
    plan.progress={total:plan.assets.length,ready:done,failed};
    projectV2={...projectV2,creativePlan:plan};
    renderAll(latestDecisions,latestCopy,viewV2());renderSiteThumbnail();
  }
  plan.status=failed?(done?'partial':'planned'):'ready';
  plan.progress={total:plan.assets.length,ready:done,failed};
  return plan;
}

async function generateCompleteKit(){
  const materials=[...kitDialog.querySelectorAll('.kit-checks input:checked')].map(x=>x.value);
  if(!materials.length){kitStatus.textContent='Escolha ao menos um entregável.';return;}
  confirmGenerateKitBtn.disabled=true;kitStatus.textContent='1/5 · entendendo negócio e fechando decisões…';
  try{
    await ensureActiveProjectForKit();
    if(!latestComplete){
      await runDecisionUpdate(briefing.value,Date.now(),{live:false});
      if(!latestComplete)throw new Error('As 89 decisões não fecharam; confira os canais antes de continuar.');
    }
    kitStatus.textContent='2/5 · Writer produzindo os textos do kit…';
    if(writerReady)await generateCopy();

    kitStatus.textContent='3/5 · Diretor Criativo montando composição, nicho e plano de mídia…';
    const planned=await json('/api/v2/creative-plan',{method:'POST',body:JSON.stringify({
      projectId:activeProject.id,briefing:briefing.value,materials,decisions:latestDecisions,copy:latestCopy,studioContext:projectV2.studioContext,useJev:true,
    })});
    projectV2=planned.v2||{...projectV2,materials,creativePlan:planned.plan,studioContext:planned.plan?.studioContext||projectV2.studioContext,briefingFacts:planned.plan?.briefingFacts||projectV2.briefingFacts,kitStatus:'planning'};
    updatePipeline();
    activeProject={...activeProject,v2:projectV2};

    const plan=await materializeCreativeAssets(projectV2.creativePlan);
    const required=plan?.assets?.filter(a=>a?.required!==false)||[];
    const pending=required.filter(a=>!a?.assetId).length;
    projectV2={...projectV2,materials,creativePlan:plan,briefingFacts:plan?.briefingFacts||projectV2.briefingFacts,kitStatus:pending?'generating':'ready'};
    updatePipeline();

    kitStatus.textContent='5/5 · salvando composição, assets e versão do projeto…';
    const d=await json(`/api/projects/${activeProject.id}`,{method:'PATCH',body:JSON.stringify({briefing:briefing.value,modelRouting,v2:projectV2})});
    activeProject=d.project;projectV2=d.project.v2||projectV2;
    renderAll(latestDecisions,latestCopy,viewV2());renderSiteThumbnail();
    await loadAssets().catch(()=>{});
    await saveVersion();

    const p=projectV2.creativePlan;
    const label=p?.business?.label||'negócio';
    const arch=p?.brand?.archetypeLabel||'direção definida';
    if(pending){
      kitStatus.textContent=`◐ Plano criativo pronto para ${label} · ${arch}. ${pending} mídia(s) ainda pendente(s) porque o gerador de imagem não respondeu ou não está configurado.`;
      status.textContent='Kit estruturado e versionado; existem mídias pendentes.';
    }else{
      kitStatus.textContent=`✓ Kit completo · ${label} · ${arch} · ${required.length} mídia(s) gerada(s) e aplicadas nas peças.`;
      status.textContent='Kit VNext pronto: direção, textos, imagens e composições versionados.';
    }
  }catch(e){kitStatus.textContent='⚠ '+e.message;}finally{confirmGenerateKitBtn.disabled=false;refreshProjectButtons();}
}
function renderSiteThumbnail(){
  const root=document.getElementById('site-preview'); if(!root)return;
  const hasSite=Object.keys(latestDecisions?.site||{}).length>0;
  if(!hasSite)return;
  const frame=document.createElement('iframe');
  frame.className='site-thumbnail-frame';
  frame.title='Miniatura real do site';
  frame.tabIndex=-1;
  frame.setAttribute('aria-hidden','true');
  frame.setAttribute('sandbox','allow-same-origin');
  frame.srcdoc=buildSiteHtml(exportContext());
  root.replaceChildren(frame);
  const fit=()=>{
    const w=root.clientWidth||1,h=root.clientHeight||1;
    const scale=Math.min(w/1280,h/820);
    frame.style.transform=`scale(${scale})`;
    frame.style.left=`${Math.max(0,(w-1280*scale)/2)}px`;
    frame.style.top=`${Math.max(0,(h-820*scale)/2)}px`;
  };
  requestAnimationFrame(fit);
  frame.addEventListener('load',fit,{once:true});
}

const PREVIEW_META=Object.freeze({
  site:{title:'Site · Página inicial',selector:'#site-preview',mode:'html'},
  brand:{title:'Marca · Identidade Visual',selector:'#brand-preview',mode:'clone'},
  instagram:{title:'Instagram · Post + Carrossel',selector:'#posts-preview',mode:'clone'},
  carousel:{title:'Carrossel · Painel a painel',selector:'#posts-preview',mode:'clone'},
  stories:{title:'Stories / Reels · 9:16',selector:'#stories-preview',mode:'clone'},
  email:{title:'E-mail · Template',selector:'#email-preview',mode:'html'},
  ads:{title:'Anúncios · Kit de formatos',selector:'#ads-preview',mode:'html'},
  manual:{title:'Manual de Marca',selector:'#manual-preview',mode:'html'},
});
function previewHtml(kind){
  const ctx=exportContext();
  if(kind==='site')return buildSiteHtml(ctx);
  if(kind==='email')return buildEmailHtml(ctx);
  if(kind==='ads')return buildAdsHtml(ctx);
  if(kind==='manual')return buildBrandManualHtml(ctx);
  return '';
}
function renderPreviewContent(kind=activePreviewKind){
  const meta=PREVIEW_META[kind]; if(!meta)return;
  previewTitle.textContent=meta.title;
  previewFrame.hidden=true; previewClone.hidden=true; previewClone.replaceChildren();
  if(meta.mode==='html'){
    previewFrame.hidden=false;
    previewFrame.srcdoc=previewHtml(kind);
  }else{
    const source=document.querySelector(meta.selector);
    previewClone.hidden=false;
    if(!source){previewClone.textContent='Material ainda não disponível.';return;}
    const clone=source.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    previewClone.className=`preview-clone preview-clone--${kind}`;
    previewClone.append(clone);
  }
  previewExportBtn.hidden=!['site','email','ads','manual'].includes(kind);
}
function openMaterialPreview(kind){
  const meta=PREVIEW_META[kind]; if(!meta)return;
  activePreviewKind=kind; selectV2Tab(kind);
  renderPreviewContent(kind);
  previewCommand.value='';
  if(!previewDialog.open)previewDialog.showModal();
}
function previewCommandPrefix(kind,text){
  const target={site:'No site',brand:'Na marca',instagram:'Nos posts',carousel:'No carrossel',stories:'Nos posts',email:'No e-mail',ads:'Nos anúncios',manual:'Na marca'}[kind]||'Nesta peça';
  return `${target}, ${text}`;
}
async function applyPreviewCommand(){
  const text=previewCommand.value.trim();
  if(text.split(/\s+/).filter(Boolean).length<2){status.textContent='Descreva o ajuste desta peça em algumas palavras.';return;}
  previewApplyBtn.disabled=true;
  try{
    commandInput.value=previewCommandPrefix(activePreviewKind,text);
    await applyCommand();
    previewCommand.value='';
    renderPreviewContent(activePreviewKind);
  }finally{previewApplyBtn.disabled=false;}
}
function exportActivePreview(){
  if(activePreviewKind==='site')return exportSite();
  if(activePreviewKind==='email')return exportEmail();
  if(activePreviewKind==='ads')return exportAds();
  if(activePreviewKind==='manual')return exportManual();
}
function selectV2Tab(tab){
  document.querySelectorAll('.v2-nav button[data-v2-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v2Tab===tab));
  const map={site:'.monitor.site',brand:'.monitor.brand-monitor',instagram:'.monitor.posts',carousel:'.monitor.posts',stories:'.monitor.stories',email:'.monitor.email',ads:'.monitor.ads',manual:'.monitor.manual'};
  document.querySelectorAll('.pieces .monitor').forEach(m=>m.classList.remove('v2-focus'));
  if(map[tab])document.querySelector(map[tab])?.classList.add('v2-focus');
  if(tab==='manual')status.textContent='Manual de Marca: clique no card para abrir em tela grande e revisar as aplicações.';
  if(tab==='stories')status.textContent='Stories / Reels: clique no card para ampliar e ajustar.';
}

function exportContext(){
  return {project:activeProject,decisions:latestDecisions,copy:latestCopy,locks:{choices:lockedChoices,targets:lockedTargets},history:commandHistory,v2:viewV2(),modelRouting};
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
function exportManual(){
  const ctx={...exportContext(),v2:viewV2()};
  downloadText(`manual-${exportBase()}.html`,buildBrandManualHtml(ctx),'text/html;charset=utf-8');
  status.textContent='Manual de Marca HTML exportado.';
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
  if(previewMicBtn){
    previewMicBtn.classList.toggle('is-listening',micListening);
    previewMicBtn.setAttribute('aria-pressed',String(micListening));
    previewMicBtn.textContent=micListening?'● REC':'● MIC';
  }
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
async function transcribeVoiceSegment(wav,{durationMs=0,forced=false,session}={}){
  if(session!==voiceSession)return;
  voiceStage('text','active',`Transcrevendo ${Math.round(durationMs)} ms`);
  status.textContent=forced?'🎙️ Transcrevendo enquanto você continua falando…':'🎙️ Transcrevendo a última fala…';
  try{
    const r=await fetch('/api/transcribe',{
      method:'POST',
      headers:{'content-type':'audio/wav'},
      body:wav,
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Object.assign(new Error(d.error||`Falha na transcrição (${r.status})`),{code:d.code,status:r.status});
    if(session!==voiceSession)return;
    const text=String(d.text||'').replace(/\s+/g,' ').trim();
    if(!text){
      voiceStage('text','active','Trecho sem palavras reconhecidas');
      status.textContent='🎙️ Ouvindo… continue falando.';
      return;
    }
    micFinalText=mergeTranscriptText(micFinalText,text);
    micInterimText='';
    const spoken=micFinalText.trim();
    briefing.value=[micBaseText,spoken].filter(Boolean).join(micBaseText&&spoken?'\n':'').slice(0,3000);
    paintTranscript();
    voiceStage('text','ok',`Whisper local · ${d.ms||0} ms`);
    status.textContent=`✓ Texto recebido em ${d.ms||0} ms · atualizando direção de arte…`;
    decisionScheduler.schedule({immediate:true});
  }catch(e){
    if(session!==voiceSession)return;
    voiceStage('text','error',e.code||e.message);
    status.textContent=`⚠️ Transcrição: ${e.message}`;
  }
}
async function stopMic(message='Microfone desligado.'){
  if(!micWanted&&!micListening)return;
  const capture=voiceCapture; voiceCapture=null;
  try{await capture?.stop?.({flush:true});}catch{}
  micWanted=false;
  voiceSession+=1;
  setMicState(false,message);
  closeTranscript();
  decisionScheduler.schedule({immediate:true});
}
function setupMic(){
  const supported=!!navigator.mediaDevices?.getUserMedia && !!(window.AudioContext||window.webkitAudioContext);
  if(!supported){
    micBtn.disabled=true;
    micBtn.title='Captura de áudio indisponível neste navegador.';
    voiceStage('audio','error','Web Audio indisponível');
    status.textContent='Este navegador não permite captura de áudio necessária ao Studio.';
    return;
  }

  micBtn.disabled=false;
  micBtn.title='Voz ao vivo · transcrição NVIDIA';
  micBtn.addEventListener('click',async()=>{
    if(micWanted||micListening){void stopMic();return;}
    const session=++voiceSession;
    micWanted=true;
    micBaseText=briefing.value.trim();
    micFinalText='';micInterimText='';
    resetVoiceStages();
    voiceStage('audio','active','Abrindo microfone');
    paintTranscript();
    setMicState(true,'🎙️ Abrindo voz ao vivo · transcrição local…');
    try{
      voiceCapture=await createBackendVoiceCapture(vuEl,{
        onAudio:()=>{
          if(session!==voiceSession)return;
          voiceStage('audio','ok','Áudio chegando');
          status.textContent='🎙️ Áudio ativo · fale normalmente.';
        },
        onSpeech:()=>{
          if(session!==voiceSession)return;
          voiceStage('speech','ok','Fala detectada');
          status.textContent='🎙️ Fala detectada · preparando transcrição…';
        },
        onSegment:(wav,meta)=>transcribeVoiceSegment(wav,{...meta,session}),
        onError:(e)=>{
          if(session!==voiceSession)return;
          voiceStage('text','error',e?.message||'erro');
          status.textContent='⚠️ Erro no fluxo de voz: '+(e?.message||'erro');
        },
        silenceMs:460,
        maxSegmentMs:1800,
        minSegmentMs:320,
      });
      if(session!==voiceSession){await voiceCapture?.stop?.({flush:false});voiceCapture=null;return;}
      setMicState(true,'🎙️ Ouvindo ao vivo · Whisper local transcreve e o Jev redesenha.');
    }catch(e){
      if(session!==voiceSession)return;
      micWanted=false;voiceCapture=null;
      setMicState(false);
      closeTranscript();
      voiceStage('audio','error',e?.name||e?.message||'falha');
      status.textContent='⚠️ Não consegui abrir o microfone: '+(e?.message||'permissão/captura indisponível');
    }
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&micWanted)void stopMic('Microfone desligado enquanto a aba estava em segundo plano.');
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
  syncBriefingFacts(texto);
  projectV2={...projectV2,studioContext:null};
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
        const accumulated=Object.values(latestDecisions).reduce((sum,g)=>sum+Object.keys(g||{}).length,0);
        if(accumulated===89&&!latestComplete){
          latestComplete=true;
          refreshProjectButtons();
          queueMicrotask(()=>finalizeDecisionState(texto,{autoStory:!live}));
        }
      } else if(event==='group_error'){
        failures+=1; setChannel(d.group,'error'); setSignal(d.group,d.code||'erro',false); status.textContent=d.error;
      } else if(event==='done'){
        const total=Math.round(performance.now()-started);
        $('#latencia').textContent=`${total} ms`;
        const decisionCount=Number(d.decisionCount)||Object.values(latestDecisions).reduce((n,g)=>n+Object.keys(g||{}).length,0);
        latestComplete=decisionCount===89;
        const liveFacts=extractBriefingFactsLocal(texto);
        if(d.context&&typeof d.context==='object'){
          projectV2={
            ...projectV2,
            studioContext:d.context,
            briefingFacts:liveFacts.explicitColors?liveFacts:(d.context.briefingFacts||projectV2.briefingFacts),
          };
        }
        liveUpdateCount+=latestComplete?1:0; refreshProjectButtons();
        if(latestComplete)queueMicrotask(()=>finalizeDecisionState(texto,{autoStory:!live})); voiceStage('jev',latestComplete?'ok':'error',latestComplete?'89 decisões recebidas':'Falha parcial no Jev');
        status.textContent=live&&micWanted
          ?`🎙️ Ouvindo… ${decisionCount} decisões atualizadas em ${total} ms · atualização ${liveUpdateCount}. Continue falando.`
          :latestComplete?'89 decisões prontas. Agora clique em “Gerar kit completo” para produzir textos, imagens e composições.':`Recebi ${decisionCount}/89 decisões; ${failures} canal(is) com erro.`;
      }
    });
    await finalizeDecisionState(texto,{autoStory:!live});
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
openModelsBtn.addEventListener('click',openModels);
modelsDialog.querySelectorAll('input[name="routing-mode"]').forEach(r=>r.addEventListener('change',routingModeChanged));
saveModelRoutingBtn.addEventListener('click',saveModelRouting);
openAssetsBtn.addEventListener('click',openAssets);
uploadAssetBtn.addEventListener('click',uploadAsset);
generateImageBtn.addEventListener('click',()=>generateMedia('image'));
generateVideoBtn.addEventListener('click',()=>generateMedia('video'));
generateKitBtn.addEventListener('click',openKit);
confirmGenerateKitBtn.addEventListener('click',generateCompleteKit);
document.querySelectorAll('.v2-nav button[data-v2-tab]').forEach(b=>b.addEventListener('click',()=>{
  const tab=b.dataset.v2Tab;
  if(tab==='overview'){selectV2Tab(tab);return;}
  openMaterialPreview(tab);
}));
document.querySelectorAll('[data-action-export]').forEach(b=>b.addEventListener('click',openExport));
[
  ['.monitor.site','site'],['.monitor.brand-monitor','brand'],['.monitor.posts','instagram'],
  ['.monitor.stories','stories'],['.monitor.email','email'],['.monitor.ads','ads'],['.monitor.manual','manual']
].forEach(([selector,kind])=>document.querySelector(selector)?.addEventListener('click',()=>openMaterialPreview(kind)));
previewCloseBtn.addEventListener('click',()=>previewDialog.close());
previewMicBtn.addEventListener('click',()=>micBtn.click());
previewApplyBtn.addEventListener('click',applyPreviewCommand);
previewCommand.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();applyPreviewCommand();}});
previewExportBtn.addEventListener('click',exportActivePreview);
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
exportManualBtn.addEventListener('click',exportManual);
exportJsonBtn.addEventListener('click',exportJson);
backJevBtn.addEventListener('click',backToJev);
setupMic();
await Promise.all([loadConfig(),loadProjects(),loadModelCatalog().catch(()=>null)]);
modelsDialog.querySelector(`input[name="routing-mode"][value="${modelRouting.mode}"]`)?.setAttribute('checked','checked');
