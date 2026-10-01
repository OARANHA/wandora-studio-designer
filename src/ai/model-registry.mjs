import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';
import { jevDecide } from './jev.mjs';

const TASKS=Object.freeze({
  intent:{label:'Intenção / Roteamento',needs:['text'],priority:['speed','structured']},
  briefing:{label:'Entendimento',needs:['text'],priority:['speed','structured']},
  creative_plan:{label:'Direção Criativa / Planner',needs:['text'],priority:['reasoning','quality','creativity']},
  copy:{label:'Copy / Writer',needs:['text'],priority:['quality','creativity']},
  brand:{label:'Marca / Estratégia',needs:['text'],priority:['quality','creativity']},
  layout:{label:'Site / Layout',needs:['text'],priority:['structured','quality']},
  review:{label:'Revisão',needs:['text'],priority:['quality','structured']},
  image:{label:'Imagem',needs:['image_out'],priority:['visual','quality']},
  video:{label:'Vídeo',needs:['video_out'],priority:['visual','quality']},
});

const STATIC_CHUTES_META={
  'deepseek-ai/DeepSeek-V3.2-TEE':{label:'DeepSeek V3.2',input:['text'],strengths:['copy','brand','review','creative_plan'],speed:'medium',cost:'medium'},
  'moonshotai/Kimi-K3-TEE':{label:'Kimi K3',input:['text','image','video'],strengths:['brand','review','creative_plan'],speed:'medium',cost:'high'},
  'Qwen/Qwen3-235B-A22B-Thinking-2507-TEE':{label:'Qwen3 235B Thinking',input:['text'],strengths:['creative_plan','brand','layout','review'],speed:'slow',cost:'high'},
  'Qwen/Qwen3-32B-TEE':{label:'Qwen3 32B',input:['text'],strengths:['intent','briefing','layout','review'],speed:'fast',cost:'low'},
  'zai-org/GLM-5.2-TEE:latency':{label:'GLM 5.2 Latency',input:['text'],strengths:['copy','brand','layout','review'],speed:'fast',cost:'medium'},
  'Kimi-K3-TEE':{label:'Kimi K3',input:['text','image','video'],strengths:['copy','brand','review','creative_plan'],speed:'medium',cost:'high'},
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
  return providerModel({provider:'nvidia',id:config.nvidia.model,label:config.nvidia.model,input:['text'],output:['text'],strengths:['intent','briefing','creative_plan','copy','brand','layout','review'],speed:'fast',cost:'medium',configured:!!config.nvidia.apiKey,source:'runtime'});
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
  const configured=!!config.chutes.apiKey;
  if(config.chutes.imageFastUrl)out.push(providerModel({
    provider:'chutes-media',id:config.chutes.imageFastModel||'z-image-turbo',label:'Z-Image Turbo · rápido',
    input:['text'],output:['image'],strengths:['image','speed'],speed:'fast',cost:'low',configured,source:'runtime',
  }));
  if(config.chutes.imageQualityUrl)out.push(providerModel({
    provider:'chutes-media',id:config.chutes.imageQualityModel||'Qwen-Image-2512',label:'Qwen Image 2512 · qualidade',
    input:['text'],output:['image'],strengths:['image','quality'],speed:'medium',cost:'medium',configured,source:'runtime',
  }));
  if(config.chutes.imageStyleUrl)out.push(providerModel({
    provider:'chutes-media',id:config.chutes.imageStyleModel||'imageclassic',label:'Imageclassic · estilos',
    input:['text'],output:['image'],strengths:['image','creativity'],speed:'medium',cost:'medium',configured,source:'runtime',
  }));
  if(config.chutes.imageEditUrl)out.push(providerModel({
    provider:'chutes-media',id:config.chutes.imageEditModel||'Qwen-Image-Edit-2511',label:'Qwen Image Edit 2511 · edição',
    input:['text','image'],output:['image_edit'],strengths:['image_edit'],speed:'medium',cost:'medium',configured,source:'runtime',
  }));
  if(config.chutes.imageSegmentUrl)out.push(providerModel({
    provider:'chutes-media',id:config.chutes.imageSegmentModel||'sam3',label:'SAM3 · segmentação',
    input:['text','image'],output:['segmentation'],strengths:['segmentation'],speed:'medium',cost:'medium',configured,source:'runtime',
  }));
  if(config.chutes.videoUrl)out.push(providerModel({
    provider:'chutes-media',id:config.chutes.videoModel||'video-generator',label:config.chutes.videoModel||'Chutes Video',
    input:['text','image'],output:['video'],strengths:['video'],speed:'slow',cost:'high',configured,source:'runtime',
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
  const preferredIds={
    intent:['Qwen/Qwen3-32B-TEE','DeepSeek-V4-Flash-0731-TEE'],
    briefing:['Qwen/Qwen3-32B-TEE'],
    creative_plan:['Qwen/Qwen3-235B-A22B-Thinking-2507-TEE','moonshotai/Kimi-K3-TEE','deepseek-ai/DeepSeek-V3.2-TEE'],
    copy:['deepseek-ai/DeepSeek-V3.2-TEE','zai-org/GLM-5.2-TEE:latency'],
    brand:['deepseek-ai/DeepSeek-V3.2-TEE','moonshotai/Kimi-K3-TEE'],
    layout:['Qwen/Qwen3-235B-A22B-Thinking-2507-TEE','Qwen/Qwen3-32B-TEE'],
    review:['Qwen/Qwen3-235B-A22B-Thinking-2507-TEE','zai-org/GLM-5.2-TEE:latency'],
  };
  const ids=preferredIds[task]||[];
  const preferredByTask={
    intent:['chutes','nvidia'],briefing:['chutes','nvidia'],creative_plan:['chutes','nvidia'],
    layout:['chutes','nvidia'],copy:['chutes','nvidia'],brand:['chutes','nvidia'],review:['chutes','nvidia'],
    image:['chutes-media'],video:['chutes-media'],
  };
  const order=preferredByTask[task]||[];
  return [...candidates].sort((a,b)=>{
    const ia=ids.indexOf(a.id),ib=ids.indexOf(b.id);
    if((ia<0?99:ia)!==(ib<0?99:ib))return (ia<0?99:ia)-(ib<0?99:ib);
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
