const $ = (s) => document.querySelector(s);
const briefing=$('#briefing'), btn=$('#analisar'), status=$('#status'), providers=$('#providers');
const projectSelect=$('#project-select'), projectName=$('#project-name'), clientName=$('#client-name');
const createProjectBtn=$('#create-project'), saveVersionBtn=$('#save-version'), openVersionsBtn=$('#open-versions');
const versionsDialog=$('#versions-dialog'), versionsList=$('#versions-list');
let activeController=null, activeProject=null, latestDecisions={}, latestCopy={}, latestComplete=false;
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
  const root=$('#understanding'); root.className='identity-result'; root.replaceChildren();
  for(const [id,a] of Object.entries(answers||{})){
    const row=document.createElement('div'), name=document.createElement('span'), value=document.createElement('b');
    name.textContent=labels[id]||id; value.textContent=answerText(a); row.append(name,value); root.append(row);
  }
}
function renderGroupSummary(group,answers,ms=0){
  const count=Object.keys(answers||{}).length;
  if(group==='entender'){ renderUnderstanding(answers); return; }
  setSignal(group,ms?`${count} decisões · ${ms} ms`:`${count} decisões`,true);
}
function resetSignals(){
  latestDecisions={}; latestCopy={}; latestComplete=false;
  saveVersionBtn.disabled=true;
  Object.keys(channel).forEach(g=>setChannel(g,''));
  Object.keys(signal).forEach(g=>setSignal(g,'sem sinal',false));
  $('#decisoes').textContent='0'; $('#latencia').textContent='—';
}
function refreshProjectButtons(){
  openVersionsBtn.disabled=!activeProject;
  saveVersionBtn.disabled=!activeProject || !latestComplete;
}
async function json(url,opts={}){
  const r=await fetch(url,{...opts,headers:{'content-type':'application/json',...(opts.headers||{})}});
  const d=await r.json(); if(!r.ok)throw Object.assign(new Error(d.error||'Erro'),{data:d,status:r.status}); return d;
}
async function loadConfig(){
  try{const c=await json('/api/config');providers.textContent=`JEV ${c.providers.jev.configured?'●':'○'} · NVIDIA ${c.providers.nvidia.configured?'●':'○'} · ${c.total} decisões`;providers.classList.toggle('ready',c.providers.jev.configured&&c.providers.nvidia.configured);}catch{providers.textContent='IA indisponível';}
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
    const d=await json(`/api/projects/${activeProject.id}/versions`,{method:'POST',body:JSON.stringify({briefing:briefing.value,decisions:latestDecisions,copy:latestCopy,reason:'manual',metadata:{decisionCount:Object.values(latestDecisions).reduce((n,g)=>n+Object.keys(g||{}).length,0)}})});
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
    briefing.value=v.briefing||''; latestDecisions=v.decisions||{}; latestCopy=v.copy||{};
    let total=0; for(const [group,answers] of Object.entries(latestDecisions)){total+=Object.keys(answers||{}).length;setChannel(group,'done');renderGroupSummary(group,answers);}
    latestComplete=total===89; $('#decisoes').textContent=String(total); $('#latencia').textContent='salva'; refreshProjectButtons(); versionsDialog.close();
    status.textContent=`Versão ${v.number} restaurada${latestComplete?' com 89 decisões':''}.`;
  }catch(e){status.textContent=e.message;}
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
  latestDecisions={}; latestCopy={}; latestComplete=false; refreshProjectButtons();
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
await Promise.all([loadConfig(),loadProjects()]);
