import { jevDecide } from './jev.mjs';

const norm=(v)=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

export const MEDIA_WORKERS=Object.freeze({
  image_fast:{label:'Z-Image Turbo',operation:'generate',tier:'fast'},
  image_quality:{label:'Qwen Image 2512',operation:'generate',tier:'quality'},
  image_style:{label:'Imageclassic',operation:'generate',tier:'style'},
  image_edit:{label:'Qwen Image Edit 2511',operation:'edit',tier:'edit'},
  image_segment:{label:'SAM3',operation:'segment',tier:'segment'},
});

const STYLE_MODELS=new Set(['flux','dreamshaper','ilustmix','juggernaut']);

export function inferStyleModel({prompt='',mediaMode='',archetype='',styleModel=''}={}){
  const explicit=String(styleModel||'').toLowerCase();
  if(STYLE_MODELS.has(explicit))return explicit;
  const t=norm([prompt,mediaMode,archetype].join(' '));
  if(/anime|manga|ilustr|illustr|desenho|semi[- ]?real|cartoon|quadrinho/.test(t))return 'ilustmix';
  if(/\b(fantasia|fantasy|sci[- ]?fi|surreal|concept art|pintura)\b/.test(t))return 'dreamshaper';
  if(/\b(juggernaut|fotografia classica|photography style|foto editorial)\b/.test(t))return 'juggernaut';
  return 'flux';
}

export function fallbackMediaRoute(input={}){
  const requested=String(input.requestedWorker||input.workerHint||'').trim();
  if(MEDIA_WORKERS[requested]){
    return {
      worker:requested,
      styleModel:requested==='image_style'?inferStyleModel(input):null,
      reason:'explicit_or_plan_hint',
      source:'rules',
    };
  }
  const operation=String(input.operation||'generate').toLowerCase();
  const hasReference=Boolean(input.hasReference);
  const t=norm([
    input.prompt,input.instruction,input.slot,input.role,input.mediaMode,input.archetype,input.purpose,
  ].join(' '));

  if(operation==='segment'||/\b(segment|segmentar|recortar|recorte|selecionar objeto|localizar objeto|detectar objeto)\b/.test(t)){
    if(hasReference)return {worker:'image_segment',styleModel:null,reason:'object_localization',source:'rules'};
  }
  if(operation==='edit'||(hasReference&&/\b(edita|editar|troca|muda|altera|substitui|remove|adiciona|coloca|mantem|preserva)\b/.test(t))){
    return {worker:'image_edit',styleModel:null,reason:'reference_edit',source:'rules'};
  }

  const styleModel=inferStyleModel(input);
  if(String(input.mediaMode||'').toLowerCase()==='illustration'||
     /ilustr|illustr|desenho|anime|manga|semi[- ]?real|cartoon|concept art/.test(t)){
    return {worker:'image_style',styleModel,reason:'explicit_visual_style',source:'rules'};
  }

  if(String(input.quality||'').toLowerCase()==='fast'||
     /\b(rascunho|draft|rapido|rápido|variac|variaç|preview|teste)\b/.test(t)){
    return {worker:'image_fast',styleModel:null,reason:'speed_priority',source:'rules'};
  }

  if(String(input.slot||'').startsWith('stories.') &&
     !/\b(pessoa|mulher|homem|rosto|portrait|retrato|produto|oculos|óculos|relogio|relógio|comida|prato)\b/.test(t)){
    return {worker:'image_fast',styleModel:null,reason:'story_background_fast',source:'rules'};
  }

  if(String(input.slot||'')==='site.hero' ||
     /\b(hero|campanha principal|key visual|produto|pessoa|mulher|homem|rosto|portrait|retrato|macro|oculos|óculos|relogio|relógio|arquitetura|interior)\b/.test(t)){
    return {worker:'image_quality',styleModel:null,reason:'hero_or_detail_quality',source:'rules'};
  }

  return {worker:'image_quality',styleModel:null,reason:'default_final_quality',source:'rules'};
}

const ROUTE_QUESTION=Object.freeze({
  media_worker:{
    type:'choice',
    instructions:'Escolha o worker visual adequado. image_fast para volume/latência; image_quality para final premium, pessoas, produto, hero e prompts detalhados; image_style para estilo visual explícito como ilustração; image_edit apenas quando há imagem existente a alterar; image_segment apenas para localizar/segmentar objetos, não para gerar ou editar.',
    criteria:{
      image_fast:'Gerar imagem rapidamente com Z-Image Turbo.',
      image_quality:'Gerar imagem final com Qwen Image 2512.',
      image_style:'Gerar com Imageclassic para estilo/checkpoint específico.',
      image_edit:'Editar uma imagem existente com Qwen Image Edit 2511.',
      image_segment:'Localizar/segmentar objetos numa imagem existente com SAM3.',
    },
  },
});

export async function routeMediaWorker(input={}, {useJev=true}={}){
  const fallback=fallbackMediaRoute(input);
  if(!useJev)return fallback;

  const requested=String(input.requestedWorker||'').trim();
  if(MEDIA_WORKERS[requested])return fallback;

  try{
    const decided=await jevDecide({
      state:{
        tarefa:'roteamento de worker de imagem',
        prompt:String(input.prompt||'').slice(0,1400),
        instrucao:String(input.instruction||'').slice(0,800),
        slot:String(input.slot||'').slice(0,120),
        papel:String(input.role||'').slice(0,80),
        modo_visual:String(input.mediaMode||'').slice(0,80),
        arquetipo:String(input.archetype||'').slice(0,120),
        prioridade:String(input.quality||'').slice(0,40),
        possui_imagem_referencia:Boolean(input.hasReference),
        fallback_recomendado:fallback.worker,
      },
      questions:ROUTE_QUESTION,
    });
    const choice=decided?.answers?.media_worker?.choice;
    if(!MEDIA_WORKERS[choice])return fallback;

    if((choice==='image_edit'||choice==='image_segment')&&!input.hasReference)return fallback;
    if(input.operation==='edit'&&choice!=='image_edit')return fallback;
    if(input.operation==='segment'&&choice!=='image_segment')return fallback;

    return {
      worker:choice,
      styleModel:choice==='image_style'?inferStyleModel(input):null,
      reason:'jev_media_route',
      source:'jev',
      model:decided?.model||null,
    };
  }catch{
    return fallback;
  }
}
