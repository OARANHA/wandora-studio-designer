import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';
import { jevDecide } from './jev.mjs';

const TASKS=Object.freeze({
  briefing:{label:'Entendimento',needs:['text'],priority:['speed','structured']},
  copy:{label:'Copy / Writer',needs:['text'],priority:['quality','creativity']},
  brand:{label:'Marca / Estratégia',needs:['text'],priority:['quality','creativity']},
  layout:{label:'Site / Layout',needs:['text'],priority:['structured','quality']},
  review:{label:'Revisão',needs:['text'],priority:['quality','structured']},
  image:{label:'Imagem',needs:['image_out'],priority:['visual','quality']},
  video:{label:'Vídeo',needs:['video_out'],priority:['visual','quality']},
});

const STATIC_CHUTES_META={
  'Kimi-K3-TEE':{label:'Kimi K3',input:['text','image','video'],strengths:['copy','brand','review'],speed:'medium',cost:'high'},
  'Kimi-K2.6-TEE':{label:'Kimi K2.6',input:['text','image','video'],strengths:['copy','brand','review'],speed:'medium',cost:'medium'},
  'DeepSeek-V4-Flash-0731-TEE':{label:'DeepSeek V4 Flash',input:['text'],strengths:['briefing','layout','review'],speed:'fast',cost:'low'},
  'Qwen3.8-27B-TEE':{label:'Qwen 3.8 27B',input:['text','image'],strengths:['copy','layout','review'],speed:'medium',cost:'medium'},
  'Qwen3.6-27B-TEE':{label:'Qwen 3.6 27B',input:['text','image'],strengths:['copy','layout'],speed:'medium',cost:'medium'},
};

let cache={at:0,models:[]};
const now=()=>Date.now();
const normalizeId=(v)=>String(v||'').trim();
const compact=(s,n=120)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,n);

async function getJson(url,{key,timeoutMs=30000}={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const r=await fetch(url,{headers:key?{authorization:`Bearer ${key}`}:{},signal:controller.signal});
    const raw=await r.text();let data=null;try{data=JSON.parse(raw);}catch{}
    if(!r.ok)throw new HttpError(r.status===429?429:502,data?.error?.message||data?.detail||`Falha ao consultar modelos (${r.status}).`,'model_discovery_failed');
    return data;
  }catch(e){
    if(e instanceof HttpError)throw e;
    if(e?.name==='AbortError')throw new HttpError(504,'A lista de modelos demorou além do limite.','model_discovery_timeout');
    throw new HttpError(502,'Não foi possível consultar o catálogo de modelos.','model_discovery_network');
  }finally{clearTimeout(timer);}
}
function providerModel({provider,id,label,input=['text'],output=['text'],strengths=[],speed='medium',cost='medium',configured=true,source='static'}){
  return {provider,id,label:label||id,input,output,strengths,speed,cost,configured,source,key:`${provider}:${id}`};
}
function nvidiaModel(){
  return providerModel({provider:'nvidia',id:config.nvidia.model,label:config.nvidia.model,input:['text'],output:['text'],strengths:['briefing','copy','brand','layout','review'],speed:'fast',cost:'medium',configured:!!config.nvidia.apiKey,source:'runtime'});
}
async function chutesModels(){
  if(!config.chutes.apiKey)return [];
  const data=await getJson(`${config.chutes.baseUrl}/models`,{key:config.chutes.apiKey,timeoutMs:config.chutes.timeoutMs});
  const rows=Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
  return rows.slice(0,120).map(row=>{
    const id=normalizeId(row?.id||row?.model||row?.name);
    if(!id)return null;
    const meta=STATIC_CHUTES_META[id]||{};
    return providerModel({
      provider:'chutes',id,label:meta.label||row?.name||id,
      input:meta.input||['text'],output:['text'],
      strengths:meta.strengths||['copy','layout','review'],
      speed:meta.speed||'medium',cost:meta.cost||'medium',configured:true,source:'discovered',
    });
  }).filter(Boolean);
}
function mediaModels(){
  const out=[];
  if(config.chutes.imageUrl)out.push(providerModel({
    provider:'chutes-media',id:config.chutes.imageModel||'image-generator',label:config.chutes.imageModel||'Chutes Image',
    input:['text','image'],output:['image'],strengths:['image'],speed:'medium',cost:'medium',configured:!!config.chutes.apiKey,source:'runtime',
  }));
  if(config.chutes.videoUrl)out.push(providerModel({
    provider:'chutes-media',id:config.chutes.videoModel||'video-generator',label:config.chutes.videoModel||'Chutes Video',
    input:['text','image'],output:['video'],strengths:['video'],speed:'slow',cost:'high',configured:!!config.chutes.apiKey,source:'runtime',
  }));
  return out;
}
export async function listModels({refresh=false}={}){
  if(!refresh&&cache.models.length&&now()-cache.at<60_000)return cache.models;
  const models=[nvidiaModel(),...mediaModels()];
  try{models.push(...await chutesModels());}catch(e){models.push(providerModel({provider:'chutes',id:'unavailable',label:'Chutes indisponível',configured:false,source:'error'}));}
  const seen=new Set();
  cache={at:now(),models:models.filter(m=>m.id&&!seen.has(m.key)&&(seen.add(m.key),true))};
  return cache.models;
}
export function modelTasks(){return TASKS;}
function candidatesForTask(models,task){
  const t=TASKS[task];if(!t)return [];
  return models.filter(m=>{
    if(!m.configured)return false;
    if(task==='image')return m.output.includes('image');
    if(task==='video')return m.output.includes('video');
    return m.output.includes('text')&&(m.strengths.includes(task)||m.strengths.length===0);
  });
}
function fallbackRank(candidates,task){
  const preferredByTask={
    briefing:['nvidia'],
    layout:['nvidia'],
    copy:['chutes','nvidia'],
    brand:['chutes','nvidia'],
    review:['chutes','nvidia'],
    image:['chutes-media'],
    video:['chutes-media'],
  };
  const order=preferredByTask[task]||[];
  return [...candidates].sort((a,b)=>{
    const pa=order.indexOf(a.provider),pb=order.indexOf(b.provider);
    return (pa<0?99:pa)-(pb<0?99:pb);
  })[0]||null;
}
export async function routeModel({task,mode='auto',preferredKey='',context=''}={}){
  if(!TASKS[task])throw new HttpError(400,'Tarefa de modelo inválida.','bad_model_task');
  const models=await listModels();
  const candidates=candidatesForTask(models,task);
  if(!candidates.length)throw new HttpError(503,`Nenhum modelo disponível para ${TASKS[task].label}.`,'no_model_for_task');

  if(mode==='manual'){
    const picked=candidates.find(m=>m.key===preferredKey);
    if(!picked)throw new HttpError(400,'O modelo manual não está disponível para esta tarefa.','model_not_available');
    return {task,mode,selected:picked,reason:'Escolha manual do usuário.',candidates};
  }
  if(mode==='assistido'&&preferredKey){
    const picked=candidates.find(m=>m.key===preferredKey);
    if(picked)return {task,mode,selected:picked,reason:'Override do usuário sobre a recomendação assistida.',candidates};
  }

  if(candidates.length===1)return {task,mode,selected:candidates[0],reason:'Único modelo disponível para a tarefa.',candidates};

  const aliases={};const criteria={};
  candidates.slice(0,20).forEach((m,i)=>{
    const a=`m${i+1}`;aliases[a]=m;
    criteria[a]=`${m.label} · provider ${m.provider} · strengths ${m.strengths.join(', ')||'geral'} · velocidade ${m.speed} · custo relativo ${m.cost}`;
  });
  try{
    const result=await jevDecide({
      state:{
        tarefa:TASKS[task].label,
        modo:mode,
        contexto:compact(context,800),
        regra:'Escolha o worker mais adequado entre os candidatos disponíveis. Priorize qualidade adequada à tarefa, depois velocidade e custo. Para criação de marca/copy, valorize criatividade; para briefing/layout/revisão, valorize estrutura e consistência.',
      },
      questions:{worker:{type:'choice',instructions:'Qual worker deve executar esta tarefa?',criteria}},
    });
    const alias=result?.answers?.worker?.choice;
    const selected=aliases[alias]||fallbackRank(candidates,task);
    return {
      task,mode,selected,reason:mode==='assistido'?'Sugestão do Jev; o usuário pode trocar antes de gerar.':'Escolha automática do Jev.',
      candidates,jev:{model:result?.model||null,probabilities:result?.answers?.worker?.probabilities||null},
    };
  }catch{
    const selected=fallbackRank(candidates,task);
    return {task,mode,selected,reason:'Fallback determinístico porque o roteamento Jev não respondeu.',candidates,jev:null};
  }
}
