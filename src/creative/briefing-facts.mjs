const COLOR_DEFS=Object.freeze([
  ['vermelho','Vermelho','#d62828',['vermelho','vermelha','red','escarlate']],
  ['azul','Azul','#2563eb',['azul','azul royal','azul-royal','blue']],
  ['azul_marinho','Azul-marinho','#1b2a4e',['azul marinho','azul-marinho','marinho','navy']],
  ['verde','Verde','#1f9d55',['verde','green']],
  ['verde_limao','Verde-limão','#a3e635',['verde limao','verde-limao','verde neon','verde fluorescente']],
  ['preto','Preto','#111111',['preto','black']],
  ['branco','Branco','#ffffff',['branco','white']],
  ['cinza','Cinza','#9aa0a8',['cinza','gray','grey']],
  ['grafite','Grafite','#363b44',['grafite','chumbo','antracite']],
  ['amarelo','Amarelo','#facc15',['amarelo','yellow']],
  ['laranja','Laranja','#f97316',['laranja','orange']],
  ['rosa','Rosa','#ec6fa6',['rosa','pink']],
  ['roxo','Roxo','#6d28d9',['roxo','violeta','purple']],
  ['lilas','Lilás','#c4b5fd',['lilas','lavanda']],
  ['bege','Bege','#e6d5b8',['bege','areia']],
  ['dourado','Dourado','#c9a55c',['dourado','ouro','gold']],
  ['prateado','Prateado','#c3c7ce',['prateado','prata','silver']],
  ['marrom','Marrom','#7b4a2d',['marrom','castanho','brown']],
  ['vinho','Vinho','#6e1c2e',['vinho','bordo','marsala','burgundy']],
  ['turquesa','Turquesa','#2ec4b6',['turquesa','tiffany','agua-marinha']],
]);

function norm(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}
function clampByte(n){return Math.max(0,Math.min(255,Math.round(n)));}
function hexToRgb(hex){
  const h=String(hex||'').replace('#','');
  if(!/^[0-9a-f]{6}$/i.test(h))return null;
  return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
}
function rgbToHex(rgb){
  return '#'+rgb.map(v=>clampByte(v).toString(16).padStart(2,'0')).join('');
}
function mixHex(a,b,ratio=.5){
  const x=hexToRgb(a),y=hexToRgb(b); if(!x||!y)return a||b||'#777777';
  const r=Math.max(0,Math.min(1,Number(ratio)||0));
  return rgbToHex(x.map((v,i)=>v*(1-r)+y[i]*r));
}
function negativeNear(text,index){
  const left=text.slice(Math.max(0,index-28),index);
  return /(?:nao|sem|evit(?:e|ar)|nunca)\s+(?:quero\s+)?$/.test(left.trim());
}

export function extractBriefingFacts(text=''){
  const raw=norm(text);
  const colorContext=/(?:\bcores?\b|\bpaleta\b|\bprimarias?\b|\bsecundarias?\b|\bidentidade\s+visual\b)/.test(raw);
  const matches=[];
  for(const [id,name,hex,aliases] of COLOR_DEFS){
    let best=-1;
    for(const aliasRaw of aliases){
      const alias=norm(aliasRaw).replace(/[.*+?^$()|[\]\\{}]/g,'\\$&').replace(/\s+/g,'\\s+');
      const re=new RegExp('(?:^|[^a-z0-9])('+alias+')(?=$|[^a-z0-9])','g');
      let m;
      while((m=re.exec(raw))){
        const idx=m.index+(m[0].length-m[1].length);
        if(!negativeNear(raw,idx)){best=best<0?idx:Math.min(best,idx);break;}
      }
      if(best>=0)break;
    }
    if(best>=0)matches.push({id,name,hex,index:best});
  }
  matches.sort((a,b)=>a.index-b.index);
  const colors=[];
  for(const c of matches){
    if(colors.some(x=>x.id===c.id))continue;
    colors.push({id:c.id,name:c.name,hex:c.hex});
    if(colors.length>=4)break;
  }
  const explicit=colorContext||colors.length>=2;
  const chosen=explicit?colors:[];
  return {colors:chosen,palette:buildExplicitPalette(chosen),explicitColors:chosen.length>0};
}

export function buildExplicitPalette(colors=[]){
  const list=(Array.isArray(colors)?colors:[]).map(c=>String(c?.hex||'')).filter(h=>/^#[0-9a-f]{6}$/i.test(h)).slice(0,4);
  if(!list.length)return [];
  if(list.length===1){
    const a=list[0];
    return [a,'#111111','#f7f7f4',mixHex(a,'#ffffff',.65),mixHex(a,'#000000',.35)];
  }
  if(list.length===2){
    return [list[0],list[1],'#f7f7f4','#111111',mixHex(list[0],list[1],.5)];
  }
  return [list[0],list[1],'#f7f7f4','#111111',list[2]];
}
