export const LIMIAR=0.5;
export const LIMIAR_MODO=0.6;
export const LIMIAR_ONDE=0.4;
export const PECAS=Object.freeze(['site','posts','email','anuncios']);
export const PROPS=Object.freeze(['fundo','caixa','tamanho','peso','espaco','cor_texto','sombra','italico','alinhamento']);
export const ELEMENTOS=Object.freeze(['pagina','topo','secoes','cartoes','botoes','titulos','textos','menu','rodape','tudo']);

const RAW_COLORS=[
['branco','branco','#ffffff','white'],['creme','creme','#f5ecd7','marfim,off-white,pérola,baunilha'],['bege','bege','#e6d5b8','areia,palha,kraft'],
['cinza_claro','cinza-claro','#e4e6ea','gelo,cinza-gelo,cinza bem clarinho'],['cinza','cinza','#9aa0a8','cinzento,cinza-médio,gray'],['grafite','grafite','#363b44','cinza-escuro,chumbo,carvão,antracite'],
['preto','preto','#111111','black,preto fosco,escuro total'],['prateado','prateado','#c3c7ce','prata,metálico,silver'],['vermelho','vermelho','#d62828','vermelho-vivo,escarlate,red'],
['vinho','vinho','#6e1c2e','bordô,marsala,grená,burgundy'],['coral','coral','#ff7a59','salmão'],['rosa','rosa','#ec6fa6','rosado,rosa-médio,chiclete'],
['rosa_claro','rosa-claro','#f8d3e0','rosa-bebê,rosé,rosinha,blush'],['pink','pink','#ff2e88','rosa-choque,magenta,fúcsia'],['laranja','laranja','#f97316','alaranjado,tangerina,orange'],
['terracota','terracota','#c4552b','laranja-queimado,tijolo,ferrugem'],['pessego','pêssego','#ffcba4','damasco,abricó'],['amarelo','amarelo','#facc15','amarelo-vivo,canário,yellow'],
['amarelo_claro','amarelo-claro','#fbeea0','amarelo-bebê,amarelo pastel,amarelinho'],['mostarda','mostarda','#d4a017','ocre,amarelo-queimado'],['dourado','dourado','#c9a55c','ouro,gold,champanhe'],
['verde','verde','#1f9d55','verde-folha,verde-bandeira,verde-grama,green'],['verde_claro','verde-claro','#8fdca8','verde pastel,verdinho'],['verde_escuro','verde-escuro','#14532d','verde-floresta,verde-garrafa'],
['verde_limao','verde-limão','#a3e635','verde-lima,verde-neon,verde fluorescente'],['verde_menta','verde-menta','#a7e8cf','menta,hortelã'],['verde_oliva','verde-oliva','#6b7a2f','oliva,verde-militar,verde-musgo,musgo,cáqui'],
['salvia','verde-sálvia','#8fa382','sálvia,verde acinzentado,eucalipto'],['turquesa','turquesa','#2ec4b6','verde-água,tiffany,água-marinha'],['azul','azul','#2563eb','azul-royal,azul-cobalto,azulão,blue'],
['azul_claro','azul-claro','#9cc9f5','azul-bebê,azul-céu,celeste,azul pastel'],['azul_marinho','azul-marinho','#1b2a4e','marinho,navy,azul-escuro,azul-noite'],['azul_petroleo','azul-petróleo','#0f5f68','petróleo'],
['ciano','ciano','#22c3e6','azul-piscina,azul-turquesa,cyan'],['roxo','roxo','#6d28d9','violeta,púrpura,uva,purple'],['lilas','lilás','#c4b5fd','lavanda,roxo-claro'],
['marrom','marrom','#7b4a2d','castanho,brown'],['cafe','café','#4a2c20','chocolate,marrom-escuro,cacau'],['caramelo','caramelo','#c58940','mel,cobre,bronze,âmbar'],['nude','nude','#e3c1ad','cor de pele,bege-rosado'],
];
export const CORES=Object.freeze(RAW_COLORS.map(([id,nome,hex,s])=>Object.freeze({id,nome,hex,sinonimos:s?s.split(','):[]})));
export const COR=Object.freeze(Object.fromEntries(CORES.map(c=>[c.id,c])));
export const CORES_MARCA=Object.freeze({
  cor_da_marca:{chave:'pri',nome:'cor da marca',jev:'A cor principal da marca que já existe ("cor da marca", "nossa cor", "cor do logo", "cor principal")'},
  cor_secundaria_da_marca:{chave:'sec',nome:'cor secundária da marca',jev:'A segunda cor da marca ("cor secundária da marca")'},
  cor_de_destaque_da_marca:{chave:'acc',nome:'cor de destaque da marca',jev:'A cor de destaque ou de realce da marca ("cor de destaque", "cor de realce")'},
});

const escolha=(instructions,criteria)=>({type:'choice',instructions,criteria});
function criteriosCor(extra){
  const out={...extra};
  for(const c of CORES)out[c.id]=c.sinonimos.length?`${c.nome.charAt(0).toUpperCase()+c.nome.slice(1)} (${c.sinonimos.join(', ')})`:c.nome;
  for(const [id,c] of Object.entries(CORES_MARCA))out[id]=c.jev;
  return out;
}
export const PERGUNTAS_AJUSTE=Object.freeze({
  aj_modo:escolha('O COMANDO da pessoa pede para trocar por outra opção pronta, pede um ajuste visual exato, as duas coisas, ou nenhuma mudança visual?',{
    biblioteca:'Trocar por outra opção pronta ou mudar o estilo sem dar um valor exato: outro logo, outra paleta ("troca as cores", "cores mais escuras e elegantes"), outra fonte, outro layout, outro título, "mais moderno", "mais elegante", "tipo selo", "mais divertido", "mais chamativo"',
    ajuste:'Um ajuste visual exato e pontual: cor ou degradê do FUNDO (background), cor dos botões, caixa alta ou baixa (caps lock, maiúsculas, minúsculas), letras maiores ou menores, negrito, itálico, espaço entre letras, cor ou sombra das letras, alinhamento',
    ambos:'As duas coisas na mesma frase: trocar por outra opção pronta E um ajuste visual exato (ex.: "troca a fonte por uma mais moderna e deixa tudo em caixa alta")',
    nenhum:'Não pede mudança visual: descreve o negócio, pede para desfazer ou voltar atrás, elogia, ou é conversa',
  }),
  aj_pecas:escolha('Em qual peça o comando quer o ajuste?',{nao_diz:'O comando não diz a peça',site:'No site, na página, na landing page',posts:'Nos carrosséis ou posts do Instagram',email:'No e-mail marketing',anuncios:'Nos anúncios, nos banners',todas:'Em todas as peças ao mesmo tempo ("em tudo", "em todas as peças", "em todo lugar")'}),
  aj_fundo:escolha('O comando pede mudar a COR DE FUNDO (background) da página ou de um elemento (topo, seções, cartões, botões, menu, rodapé)? "Botões verdes" também é cor de fundo, a dos botões. Trocar a paleta de cores da marca não é cor de fundo.',{nao_pedido:'O comando não pede mudar a cor de fundo',solida:'Fundo de uma cor só (ex.: "fundo verde", "background preto", "botões azuis", "fundo #1a7f3c")',degrade:'Fundo em degradê ou gradiente de duas cores (ex.: "degradê verde e branco", "gradiente de azul pra roxo")',escurecer:'Fundo mais escuro, sem dizer a cor (ex.: "escurece o fundo", "background mais escuro")',clarear:'Fundo mais claro, sem dizer a cor (ex.: "clareia o fundo", "background mais clarinho")'}),
  aj_fundo_onde:escolha('Se o comando muda uma cor de fundo, de onde é esse fundo?',{pagina:'O fundo inteiro da peça: a página do site, a lâmina do carrossel, o e-mail ou o banner (é o padrão quando diz só "fundo" ou "background")',topo:'Só o topo, a primeira parte, o banner principal',secoes:'As faixas e seções do meio da página',cartoes:'Os cartões, cards e caixas dentro da peça',botoes:'Os botões',menu:'O menu, a barra de cima, o cabeçalho',rodape:'O rodapé, a parte de baixo da página'}),
  aj_cor1:escolha('Qual é a PRIMEIRA cor que o comando pede para um FUNDO: o da página ou o de um elemento, como botões, topo, cartões, menu ou rodapé ("botões verdes" → verde)? No degradê, é a cor citada primeiro. Não confunda com a cor das letras. Se o comando não pede cor de fundo, escolha nenhuma.',criteriosCor({nenhuma:'Nenhuma: o comando não pede uma cor de fundo'})),
  aj_cor2:escolha('No degradê de um FUNDO (da página ou de um elemento), qual é a SEGUNDA cor que o comando pede (a cor citada depois)? Se o fundo pedido é de uma cor só, ou não há degradê, escolha nenhuma.',criteriosCor({nenhuma:'Nenhuma: não há segunda cor de fundo'})),
  aj_direcao:escolha('Se o comando pede degradê, em que direção?',{nao_diz:'Não diz a direção, ou não é degradê',vertical:'De cima para baixo',horizontal:'Da esquerda para a direita, de um lado para o outro',diagonal:'Na diagonal, de um canto ao outro',radial:'Do centro para fora, circular, radial'}),
  aj_caixa:escolha('O comando pede mudar maiúsculas e minúsculas das letras?',{nao_pedido:'Não fala de maiúsculas ou minúsculas',maiusculas:'Tudo em MAIÚSCULAS: caixa alta, caps lock, letras garrafais, letra de forma',minusculas:'Tudo em minúsculas: caixa baixa, sem nenhuma maiúscula',capitalizada:'Primeira Letra De Cada Palavra Maiúscula',normal:'Voltar ao normal: tirar a caixa alta, tirar o caps lock, desfazer as maiúsculas'}),
  aj_tamanho:escolha('O comando pede mudar o TAMANHO das letras?',{nao_pedido:'Não fala do tamanho das letras',bem_menor:'Letras bem menores, muito menores',menor:'Letras um pouco menores, diminuir a letra',maior:'Letras um pouco maiores, aumentar a letra',bem_maior:'Letras bem maiores, muito maiores, enormes'}),
  aj_peso:escolha('O comando pede letras mais grossas ou mais finas?',{nao_pedido:'Não fala da grossura das letras',negrito:'Negrito, bold, letras mais grossas, mais fortes, mais pesadas',fino:'Letras mais finas, mais leves, sem negrito'}),
  aj_espaco:escolha('O comando pede mudar o espaço ENTRE AS LETRAS (não entre seções ou linhas)?',{nao_pedido:'Não fala do espaço entre as letras',amplo:'Letras mais espaçadas, mais afastadas umas das outras',junto:'Letras mais juntas, mais coladas, mais apertadas'}),
  aj_cor_texto:escolha('Que cor o comando pede para as LETRAS (textos, títulos, fontes)? Não confunda com a cor do fundo.',criteriosCor({nenhuma:'Nenhuma: o comando não pede cor para as letras',claras:'Letras mais claras, sem dizer a cor',escuras:'Letras mais escuras, sem dizer a cor'})),
  aj_sombra:escolha('O comando pede sombra?',{nao_pedido:'Não fala de sombra',com:'Com sombra, sombreado, efeito de sombra',sem:'Sem sombra, tirar a sombra'}),
  aj_italico:escolha('O comando pede letras em itálico?',{nao_pedido:'Não fala de itálico',sim:'Em itálico, letras inclinadas',nao:'Tirar o itálico, letras retas'}),
  aj_alinhamento:escolha('O comando pede mudar o alinhamento dos textos?',{nao_pedido:'Não fala de alinhamento',centro:'Centralizado, no meio',esquerda:'Alinhado à esquerda'}),
  aj_onde:escolha('Em quais letras o comando quer a mudança de letra (caixa, tamanho, negrito, itálico, espaço, cor, sombra ou alinhamento)?',{tudo:'Em todas as letras e textos ("todas as fontes", "tudo", "as letras") — é o padrão',titulos:'Só nos títulos',textos:'Só nos textos corridos, parágrafos e descrições',botoes:'Só nos botões',cartoes:'Só nos cartões e caixas',topo:'Só no topo, no banner principal',menu:'Só no menu, na barra de cima',rodape:'Só no rodapé'}),
});
export const IDS_AJUSTE=Object.freeze(Object.keys(PERGUNTAS_AJUSTE));

const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const probs=a=>(a&&a.probabilities)||{};
const pRequested=(a,nullId)=>Math.max(0,1-Number(probs(a)[nullId]||0));
function best(a,excluded=[]){
  return Object.entries(probs(a)).filter(([id])=>!excluded.includes(id)).sort((x,y)=>Number(y[1])-Number(x[1]))[0]||[null,0];
}
function validHex(v){return /^#[0-9a-f]{6}$/i.test(String(v||''));}
export function lerMarca(input){
  const src=input?.cores&&typeof input.cores==='object'?input.cores:{};
  const cores={};for(const k of ['bg','surf','ink','muted','pri','sec','acc'])if(validHex(src[k]))cores[k]=src[k].toLowerCase();
  return Object.keys(cores).length?{cores}:null;
}
function resolverCor(id,marca){
  if(COR[id])return {hex:COR[id].hex,nome:COR[id].nome,id};
  const m=CORES_MARCA[id], hex=m&&marca?.cores?.[m.chave];
  return m&&validHex(hex)?{hex:hex.toLowerCase(),nome:m.nome,id}:null;
}
function hex2rgb(h){const x=h.slice(1);return [0,2,4].map(i=>parseInt(x.slice(i,i+2),16));}
function rgb2hex(a){return '#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
export function misturar(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return rgb2hex(A.map((v,i)=>v+(B[i]-v)*t));}
export function luminancia(hex){
  const c=hex2rgb(hex).map(v=>v/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
function hslToHex(h,s,l){
  h=((h%360)+360)%360;s/=100;l/=100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
  let r=0,g=0,b=0;if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else [r,g,b]=[c,0,x];
  return rgb2hex([(r+m)*255,(g+m)*255,(b+m)*255]);
}
const RE_COR=/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-z])|\brgba?\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)\s*(?:[,/]\s*[\d.]+%?\s*)?\)|\bhsla?\(\s*(-?\d{1,3}(?:\.\d+)?)(?:deg)?\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*(?:[,/]\s*[\d.]+%?\s*)?\)/gi;
const RE_FUNDO=/\b(fundos?|background|bg|degrades?|gradientes?|gradient|plano de fundo)\b/g;
const RE_TEXTO=/\b(letras?|textos?|fontes?|titulos?|subtitulos?|escritas?|palavras?|tipografia|caracteres)\b/g;
const RE_CONTAINER=/\b(botao|botoes|cartao|cartoes|cards?|topo|menu|cabecalho|rodape|secao|secoes|faixas?|pagina|site|banner)\b/g;
function lastIndex(re,s){let m,last=-1;re.lastIndex=0;while((m=re.exec(s)))last=m.index;return last;}
function classifyRoles(items,text){
  const n=normalize(text);
  for(let i=0;i<items.length;i++){
    const c=items[i], before=n.slice(i?items[i-1].fim:0,c.ini), after=n.slice(c.fim,items[i+1]?.ini??n.length);
    const f=lastIndex(RE_FUNDO,before),t=lastIndex(RE_TEXTO,before);
    if(f>=0||t>=0)c.papel=f>t?'fundo':'texto';
    else if(i>0&&/^[\s,\-→>]*(e|ate|para|pra|pro|a|ao|com)?[\s,\-→>]*$/.test(before))c.papel=items[i-1].papel;
    else if(RE_TEXTO.test(after.slice(0,45)))c.papel='texto';
    else if(RE_FUNDO.test(after.slice(0,45))||RE_CONTAINER.test(before.slice(-45))||RE_CONTAINER.test(after.slice(0,45)))c.papel='fundo';
    RE_FUNDO.lastIndex=RE_TEXTO.lastIndex=RE_CONTAINER.lastIndex=0;
  }
  return items;
}
export function lerCores(frase){
  const original=String(frase||''), n=normalize(original), found=[];let m;
  RE_COR.lastIndex=0;
  while((m=RE_COR.exec(n))){
    let hex;
    if(m[1]){let x=m[1].slice(0,6);if(x.length===3)x=x.split('').map(c=>c+c).join('');hex='#'+x;}
    else if(m[2])hex=rgb2hex([m[2],m[3],m[4]].map(v=>Math.min(255,Number(v))));
    else hex=hslToHex(Number(m[5]),Math.min(100,Number(m[6])),Math.min(100,Number(m[7])));
    found.push({hex:hex.toLowerCase(),nome:hex.toUpperCase(),ini:m.index,fim:RE_COR.lastIndex,bruto:m[0],papel:null,explicit:true});
  }
  const occupied=()=>found.map(x=>[x.ini,x.fim]);
  const terms=[];
  for(const c of CORES)for(const term of [c.nome,...c.sinonimos])terms.push({term:normalize(term),c});
  terms.sort((a,b)=>b.term.length-a.term.length);
  for(const {term,c} of terms){
    let pos=0;while((pos=n.indexOf(term,pos))>=0){
      const end=pos+term.length,before=n[pos-1],after=n[end];
      const boundary=(!before||/[^a-z0-9]/.test(before))&&(!after||/[^a-z0-9]/.test(after));
      const overlap=occupied().some(([a,b])=>pos<b&&end>a);
      if(boundary&&!overlap)found.push({hex:c.hex,nome:c.nome,ini:pos,fim:end,bruto:original.slice(pos,end),papel:null,explicit:false});
      pos=end;
    }
  }
  found.sort((a,b)=>a.ini-b.ini);return classifyRoles(found,original);
}
function piecesFromAnswer(answer,target,kind,hasBackground){
  const [id,p]=best(answer,['nao_diz']);
  if(id&&p>=LIMIAR)return id==='todas'?[...PECAS]:[id];
  if(PECAS.includes(target))return [target];
  if(target==='tudo')return [...PECAS];
  if(kind==='fundo')return ['site'];
  if(kind==='texto')return hasBackground?['site']:[...PECAS];
  return [];
}
function colorName(hex){return CORES.find(c=>c.hex.toLowerCase()===String(hex).toLowerCase())?.nome||String(hex).toUpperCase();}
function suffixPieces(pieces){
  if(pieces.length===1&&pieces[0]==='site')return '';
  if(pieces.length===PECAS.length)return ' (todas as peças)';
  const n={posts:'carrosséis',email:'e-mail',anuncios:'anúncios',site:'site'};return ` (${pieces.map(x=>n[x]||x).join(', ')})`;
}
export function rotuloAjuste(a){
  const where={pagina:'Fundo',topo:'Fundo do topo',secoes:'Fundo das seções',cartoes:'Fundo dos cartões',botoes:'Botões',menu:'Fundo do menu',rodape:'Fundo do rodapé',titulos:'Fundo dos títulos',textos:'Fundo dos textos',tudo:'Todos os fundos'};
  const loc={tudo:'em tudo',titulos:'nos títulos',textos:'nos textos',botoes:'nos botões',cartoes:'nos cartões',topo:'no topo',menu:'no menu',rodape:'no rodapé',pagina:'na página',secoes:'nas seções'};
  const ps=suffixPieces(a.pecas);
  if(a.prop==='fundo'){
    const base=where[a.elemento]||'Fundo',v=a.valor;
    if(v.tipo==='solida')return `${base}${a.elemento==='botoes'?' em':' '}${colorName(v.cores[0])}${ps}`.replace(/\s+/g,' ');
    if(v.tipo==='degrade'){const dir={horizontal:' (horizontal)',diagonal:' (diagonal)',radial:' (do centro)',vertical:''}[v.direcao]||'';return `${base} em degradê ${colorName(v.cores[0])} → ${colorName(v.cores[1])}${dir}${ps}`;}
    return `${base} mais ${v.tipo==='escurecer'?'escuro':'claro'}${ps}`;
  }
  const l=a.pecas.length===PECAS.length&&a.elemento==='tudo'?'em todas as peças':loc[a.elemento]||'em tudo';
  const map={
    caixa:{maiusculas:'Caixa alta',minusculas:'Minúsculas',capitalizada:'Iniciais maiúsculas',normal:'Caixa normal'},
    peso:{negrito:'Negrito',fino:'Letras finas'},espaco:{amplo:'Letras mais espaçadas',junto:'Letras mais juntas'},
    sombra:{com:'Sombra',sem:'Sem sombra'},italico:{sim:'Itálico',nao:'Sem itálico'},
    alinhamento:{centro:'Centralizado',esquerda:'Alinhado à esquerda'},
  };
  if(a.prop==='tamanho')return `${a.valor<=.88?'Letras bem menores':a.valor<1?'Letras menores':a.valor>=1.15?'Letras bem maiores':'Letras maiores'} ${l}${a.pecas.length===PECAS.length?'':' '+ps}`.trim();
  if(a.prop==='cor_texto'){const v=typeof a.valor==='string'?(a.valor==='claro'?'Letras mais claras':'Letras mais escuras'):`Cor das letras: ${colorName(a.valor.cor)}`;return `${v} ${l}${a.pecas.length===PECAS.length?'':ps}`.trim();}
  return `${map[a.prop]?.[a.valor]||a.prop} ${l}${a.pecas.length===PECAS.length?'':ps}`.replace(/\s+/g,' ').trim();
}
function adjustment(prop,pieces,element,value,p,command){const a={id:`${prop}|${pieces.join('+')}|${element}`,prop,pieces,element,value,p:Number(p.toFixed?.(2)??p),comando:command};a.rotulo=rotuloAjuste(a);return a;}
function explicitFor(items,role){return items.filter(c=>c.papel===role||c.papel==null);}
function colorFromAnswer(a,nullId,marca){
  if(pRequested(a,nullId)<LIMIAR)return null;const [id]=best(a,[nullId]);return id?resolverCor(id,marca):null;
}

export function interpretarAjustes(answers,comando,alvo,marcaInput){
  if(alvo==='logo'||alvo==='slogan')return [];
  const marca=lerMarca(marcaInput), written=lerCores(comando), writtenWithRole=written.some(c=>c.papel);
  const pm=probs(answers?.aj_modo), modeP=Number(pm.ajuste||0)+Number(pm.ambos||0);
  if(!answers?.aj_modo&&!written.length)return [];
  if(modeP<LIMIAR_MODO&&!writtenWithRole)return [];
  const out=[];
  const fundoP=pRequested(answers?.aj_fundo,'nao_pedido'), [fundoBest]=best(answers?.aj_fundo,['nao_pedido']);
  const textP=pRequested(answers?.aj_cor_texto,'nenhuma');
  let wFundo=written.filter(c=>c.papel==='fundo'),wTexto=written.filter(c=>c.papel==='texto');
  const unassigned=written.filter(c=>!c.papel);
  if(!wFundo.length&&!(textP>=LIMIAR&&fundoP<LIMIAR))wFundo=[...unassigned];
  if(!wTexto.length&&textP>=LIMIAR)wTexto=[...unassigned.filter(c=>!wFundo.includes(c))];
  let fundoRequested=fundoP>=LIMIAR||wFundo.length>0;
  const fundoPieces=piecesFromAnswer(answers?.aj_pecas,alvo,'fundo',fundoRequested);
  if(fundoRequested&&fundoPieces.length){
    let tipo=fundoBest||'solida';
    if(wFundo.length){if(tipo==='escurecer'||tipo==='clarear')tipo='solida';if((/degrad|gradien/i.test(comando))&&wFundo.length>=2)tipo='degrade';}
    const [el,elP]=best(answers?.aj_fundo_onde,[]);const elemento=el&&elP>=LIMIAR_ONDE?el:'pagina';
    const [dir,dirP]=best(answers?.aj_direcao,['nao_diz']);const direcao=dir&&dirP>=LIMIAR?dir:'vertical';
    const c1=colorFromAnswer(answers?.aj_cor1,'nenhuma',marca),c2=colorFromAnswer(answers?.aj_cor2,'nenhuma',marca);
    let colors=[];
    if(wFundo.length)colors=wFundo.slice(0,2).map(c=>({hex:c.hex,nome:c.explicit?c.nome:c.nome}));
    for(const c of [c1,c2])if(c&&!colors.some(x=>x.hex===c.hex))colors.push(c);
    let value=null;
    if(tipo==='solida'&&colors[0])value={tipo:'solida',cores:[colors[0].hex],direcao:'vertical'};
    else if(tipo==='degrade'&&colors[0]){
      let second=colors[1];if(!second){const dark=luminancia(colors[0].hex)>.6;second={hex:misturar(colors[0].hex,dark?'#000000':'#ffffff',dark?0.22:0.72)};}
      value={tipo:'degrade',cores:[colors[0].hex,second.hex],direcao};
    }else if((tipo==='escurecer'||tipo==='clarear')){
      const bg=marca?.cores?.bg;let colorsResolved=[];
      if(bg){const light=luminancia(bg)>.4;const hex=tipo==='escurecer'?misturar(bg,'#000000',light?.35:.45):misturar(bg,'#ffffff',light?.6:.25);colorsResolved=[hex];}
      value={tipo,cores:colorsResolved,direcao:'vertical'};
    }
    if(value)out.push(adjustment('fundo',fundoPieces,elemento,value,Math.max(fundoP,wFundo.length?1:0),comando));
  }
  const textPieces=piecesFromAnswer(answers?.aj_pecas,alvo,'texto',out.some(x=>x.prop==='fundo'));
  const [onde,ondeP]=best(answers?.aj_onde,[]);const elemento=onde&&ondeP>=LIMIAR_ONDE?onde:'tudo';
  const simple=[['caixa','aj_caixa','nao_pedido'],['peso','aj_peso','nao_pedido'],['espaco','aj_espaco','nao_pedido'],['sombra','aj_sombra','nao_pedido'],['italico','aj_italico','nao_pedido'],['alinhamento','aj_alinhamento','nao_pedido']];
  const byProp={};
  for(const [prop,id,nullId] of simple){const p=pRequested(answers?.[id],nullId);const [v]=best(answers?.[id],[nullId]);if(textPieces.length&&p>=LIMIAR&&v)byProp[prop]=adjustment(prop,textPieces,elemento,v,p,comando);}
  const sizeP=pRequested(answers?.aj_tamanho,'nao_pedido');
  if(textPieces.length&&sizeP>=LIMIAR){
    const p=probs(answers?.aj_tamanho),up=Number(p.maior||0)+Number(p.bem_maior||0),down=Number(p.menor||0)+Number(p.bem_menor||0);
    const key=up>=down?(Number(p.bem_maior||0)>Number(p.maior||0)?'bem_maior':'maior'):(Number(p.bem_menor||0)>Number(p.menor||0)?'bem_menor':'menor');
    byProp.tamanho=adjustment('tamanho',textPieces,elemento,{bem_menor:.85,menor:.93,maior:1.1,bem_maior:1.22}[key],sizeP,comando);
  }
  if(textPieces.length){
    let c=null,p=textP;if(wTexto[0]){c={cor:wTexto[0].hex};p=1;}
    else if(textP>=LIMIAR){const [id]=best(answers?.aj_cor_texto,['nenhuma']);if(id==='claras')c='claro';else if(id==='escuras')c='escuro';else {const r=resolverCor(id,marca);if(r)c={cor:r.hex};}}
    if(c)byProp.cor_texto=adjustment('cor_texto',textPieces,elemento,c,p,comando);
  }
  for(const prop of ['caixa','tamanho','peso','espaco','cor_texto','sombra','italico','alinhamento'])if(byProp[prop])out.push(byProp[prop]);
  return out;
}
export function modoDoComando({tipo,answers,ajustes,temBiblioteca}){
  if(tipo!=='comando_de_edicao')return 'nenhum';
  const pm=probs(answers?.aj_modo),pBib=Number(pm.biblioteca||0)+Number(pm.ambos||0);
  if(ajustes?.length)return temBiblioteca&&pBib>=LIMIAR?'ambos':'ajuste';
  return temBiblioteca?'biblioteca':'nenhum';
}
