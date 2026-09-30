import { QUESTION_GROUPS } from '../questions/catalog.mjs';

export const WRITER_MAX_TOKENS = 640;
export const WRITER_SYSTEM = 'Você é redator publicitário brasileiro. Português do Brasil com acentuação perfeita, frases curtas, concretas e com a personalidade da marca. Não invente preços, números, prêmios ou endereços. Não use marcações de gênero como “(a)”: prefira frases neutras. Responda só com as 11 linhas pedidas, cada uma começando pelo rótulo em maiúsculas e dois-pontos, sem markdown nem explicações.';

const LIMITS = Object.freeze({
  titulo:70, subtitulo:170, sobre:330, legenda1:240, legenda2:240, legenda3:240,
  assunto:70, preheader:110, email:320, anuncio:48, slogan:60,
});
const LABELS = Object.freeze({
  titulo:'TITULO', subtitulo:'SUBTITULO', sobre:'SOBRE', legenda1:'LEGENDA1', legenda2:'LEGENDA2',
  legenda3:'LEGENDA3', assunto:'ASSUNTO', preheader:'PREHEADER', email:'EMAIL', anuncio:'ANUNCIO', slogan:'SLOGAN',
});
const FIELD_RE=/^\s*(?:[-*•>#]+\s*|\d+[.)]\s*)?[*_"“]*\s*(T[IÍ]TULO|SUBT[IÍ]TULO|SOBRE(?:\s+N[OÓ]S)?|LEGENDA\s*(?:DO\s+(?:POST|CARROSSEL)\s*)?[123]|ASSUNTO|PRE-?HEADER|E-?MAIL|AN[UÚ]NCIO|SLOGAN)\s*[*_"”]*\s*(?:\([^)]*\))?\s*[:：\-–—]\s*(.*)$/i;

function squish(v,max=900){
  return String(v??'').replace(/\s+/g,' ').trim().slice(0,max);
}
function answer(group,id,decisions){
  const a=decisions?.[group]?.[id];
  const q=QUESTION_GROUPS[group]?.[id];
  if(!a || !q) return '';
  if(q.type==='choice') return q.criteria?.[a.choice] || a.choice || '';
  if(q.type==='score'){
    const n=Number(a.score);
    if(!Number.isFinite(n)) return '';
    const idx=Math.max(0,Math.min((q.criteria?.length||1)-1,Math.round(n)));
    return q.criteria?.[idx] || String(n);
  }
  return '';
}
function line(v){ return squish(v,500); }

export function buildWriterMessages({texto,decisoes}){
  const talk=squish(texto,3000);
  const pers=answer('entender','pers',decisoes), pub=answer('entender','pub',decisoes), obj=answer('entender','obj',decisoes);
  const seg=answer('entender','seg',decisoes), preco=answer('entender','preco',decisoes), dif=answer('entender','dif',decisoes);
  const cta=answer('site','cta',decisoes), oferta=answer('entender','oferta',decisoes), emoji=answer('entender','emoji',decisoes);
  const p1f=answer('posts','p1_fmt',decisoes), p1h=answer('posts','p1_hook',decisoes);
  const p2f=answer('posts','p2_fmt',decisoes), p2h=answer('posts','p2_hook',decisoes);
  const p3f=answer('posts','p3_fmt',decisoes), p3h=answer('posts','p3_hook',decisoes);
  const emTipo=answer('email','em_tipo',decisoes), emAssunto=answer('email','em_assunto',decisoes);
  const adConceito=answer('anuncios','ad_conceito',decisoes), adTitulo=answer('anuncios','ad_titulo',decisoes);

  const user=[
    `Fala do dono (transcrição): "${talk.replaceAll('"','”')}"`,
    `Negócio: ${line(seg)||'segmento não confirmado'}; não invente nome ou cidade se não estiverem explícitos na transcrição.`,
    `Decisões do classificador Jev: personalidade ${line(pers)||'não definida'}; público ${line(pub)||'não definido'}; objetivo ${line(obj)||'não definido'}; preço ${line(preco)||'não definido'}; diferencial ${line(dif)||'não definido'}; botão do site: ${line(cta)||'não definido'}; oferta: ${line(oferta)||'nenhuma confirmada'}; emojis: ${line(emoji)||'não definido'}.`,
    `Carrosséis do Instagram: 1) ${line(p1f)||'apresentação'} "${line(p1h)||'apresentação da marca'}"; 2) ${line(p2f)||'venda'} "${line(p2h)||'oferta'}"; 3) ${line(p3f)||'relacionamento'} "${line(p3h)||'relacionamento'}".`,
    `E-mail marketing: ${line(emTipo)||'tipo não definido'}; assunto hoje: "${line(emAssunto)||'não definido'}".`,
    `Anúncios de display: ${line(adConceito)||'conceito não definido'}; título hoje: "${line(adTitulo)||'não definido'}".`,
    'Escreva, nesta ordem (limites em caracteres):',
    'TITULO: até 60',
    'SUBTITULO: até 150',
    'SOBRE: até 300, na 1ª pessoa do plural',
    'LEGENDA1: até 220, para o carrossel 1, termina com uma chamada',
    'LEGENDA2: até 220, para o carrossel 2, termina com uma chamada',
    'LEGENDA3: até 220, para o carrossel 3, termina com uma chamada',
    'ASSUNTO: até 60, assunto do e-mail que dá vontade de abrir',
    'PREHEADER: até 100, completa o assunto sem repetir',
    `EMAIL: até 300, abertura do e-mail, calorosa e direta${oferta?', citando a oferta':''}`,
    'ANUNCIO: até 40, título do banner, lido em 1 segundo',
    'SLOGAN: até 45',
  ].join('\n');
  return [{role:'system',content:WRITER_SYSTEM},{role:'user',content:user}];
}

function fieldName(raw){
  const s=raw.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s_-]/g,'');
  if(s.startsWith('TITULO'))return 'titulo'; if(s.startsWith('SUBTITULO'))return 'subtitulo'; if(s.startsWith('SOBRE'))return 'sobre';
  if(s.includes('LEGENDA')&&s.endsWith('1'))return 'legenda1'; if(s.includes('LEGENDA')&&s.endsWith('2'))return 'legenda2'; if(s.includes('LEGENDA')&&s.endsWith('3'))return 'legenda3';
  if(s==='ASSUNTO')return 'assunto'; if(s==='PREHEADER')return 'preheader'; if(s==='EMAIL')return 'email'; if(s==='ANUNCIO')return 'anuncio'; if(s==='SLOGAN')return 'slogan';
  return null;
}
function clean(v){
  return String(v??'').replace(/\*\*|__/g,'').trim().replace(/^[“”"'‘’]+|[“”"'‘’]+$/g,'').trim();
}
function clip(v,max){
  let s=clean(v).replace(/\s+/g,' ').trim(); if(!s)return '';
  if(s.length<=max)return s;
  if(s[max]===' ')s=s.slice(0,max); else { const cut=s.slice(0,max+1).lastIndexOf(' '); s=s.slice(0,cut>0?cut:max); }
  return s.replace(/[\s,;:·/\\|&+*([{<«"“'‘\-–—]+$/g,'').trim();
}
function looksLikeInstruction(v){
  const s=String(v||'').toLowerCase();
  return s.length<90 && (/até\s+\d+/.test(s)||s.includes('primeira pessoa do plural')||s.includes('nesta ordem'));
}

export function parseWriterFields(text){
  const fields={}; let current=null;
  for(const rawLine of String(text||'').split(/\r?\n/)){
    const m=rawLine.match(FIELD_RE);
    if(m){
      const f=fieldName(m[1]); if(!f)continue;
      const v=clean(m[2]); if(looksLikeInstruction(v)){current=null;continue;}
      fields[f]=v; current=(f==='sobre'||f==='email')?f:null; continue;
    }
    if(current && rawLine.trim()) fields[current]=`${fields[current]||''} ${clean(rawLine)}`.trim();
  }
  for(const [f,max] of Object.entries(LIMITS)){
    if(fields[f]){
      if(f.startsWith('legenda')) fields[f]=fields[f].replace(/\s+\/\s+/g,'\n');
      fields[f]=clip(fields[f],max);
      if(['titulo','slogan','anuncio','assunto'].includes(f)) fields[f]=fields[f].replace(/\.$/,'');
    }
  }
  return fields;
}
export function writerComplete(fields){
  return Object.keys(LABELS).every(k=>typeof fields?.[k]==='string'&&fields[k].trim());
}
export const WRITER_FIELDS=Object.freeze(Object.keys(LABELS));
