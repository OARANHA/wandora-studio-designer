const PALETTES = {
  rock:['#141414','#e23b2e','#f4efd9','#86867f','#f4c430'],
  terra:['#8f432d','#c68b59','#e8d6b7','#5f6b48','#2e2924'],
  italiano:['#b5252a','#39704a','#f4efd9','#d5b55c','#222222'],
  nude:['#e9d2c3','#c99c8f','#f7efe8','#7d5a4f','#b78d55'],
  luxo:['#0f0f10','#c7a45b','#f5f0e5','#5d5d61','#2a2117'],
  vinho:['#6c1d32','#efe4cf','#b99c66','#292122','#9d6b75'],
  salvia:['#7c8f79','#e7e0cf','#b69371','#394237','#c9bca8'],
  menta:['#8fd3b4','#f7f6ee','#f19b89','#254e45','#d5e7de'],
  tropical:['#236f53','#f28d35','#e65771','#f3cf45','#f5f1de'],
  cafe:['#4a3026','#d0a267','#f4e7d2','#8b5e3c','#1f1815'],
  pastel:['#b9a4dc','#f2c6d6','#b9dfd2','#f4d7a8','#fffaf1'],
  candy:['#f05f9d','#f4d64a','#67c8e5','#a986d9','#fff8ed'],
  clinico:['#77b8df','#f8fbfc','#d7eef7','#2e5e75','#b9d9e8'],
  lavanda:['#a89cc8','#dbe2ea','#f5f1f7','#5c5870','#cad6c9'],
  corporativo:['#16385c','#f7fafc','#6aa6d8','#1c2530','#d9e5ef'],
  noite:['#111827','#c7a45b','#f5f2e8','#2d3f62','#6e5d40'],
  floresta:['#244b39','#f2ecdd','#7a8c68','#342b23','#b9a47a'],
  neon:['#25272b','#c9ff27','#f7f7f0','#3c65ff','#ff4d8e'],
  criativo:['#6f3cc3','#f2c94c','#ff6b6b','#f8f5ef','#2d2440'],
  coral:['#126f78','#ff7d6c','#f8f2df','#173f45','#f4b36b'],
  energia:['#f26b2d','#171717','#f7f1da','#ffc72c','#8d2c16'],
  amarelo:['#f4c430','#171717','#f7f1da','#696969','#fff2a6'],
  pink:['#f24f9b','#171717','#f7e8f2','#9f2a67','#f29fc7'],
  mediterraneo:['#164e9b','#f8f6ef','#f4d34f','#75b7d9','#d9b16d'],
  retro:['#cb6d38','#c79a2b','#6e4b31','#f0dcc0','#2c514c'],
  mono:['#111111','#f7f7f4','#777777','#d8d8d2','#2f2f2f'],
};

const TITLE = {
  atitude:'Sem frescura. Com muita atitude.',
  volume:'Aumenta o volume: chegou o que faltava.',
  regras:'Quebrando regras desde o primeiro dia.',
  detalhes:'Os detalhes fazem toda a diferença.',
  lembrada:'Uma experiência feita para ser lembrada.',
  raro:'Para quem aprecia o que é raro.',
  casa:'Feito com carinho, como em casa.',
  bairro:'O cantinho favorito do bairro.',
  cuidado:'Cuidado de verdade, do jeito que você merece.',
  feliz:'Bora deixar o seu dia mais feliz?',
  sorrir:'Dá vontade de sorrir só de olhar.',
  natureza:'Do jeito que a natureza fez.',
  leveza:'Mais leveza para o seu dia a dia.',
  confiar:'Resultados em que você pode confiar.',
  especialistas:'Especialistas no que realmente importa.',
  solucao:'A solução certa, sem complicação.',
  simples:'Simples. Rápido. Do seu jeito.',
  futuro:'O futuro do seu negócio começa agora.',
  tradicao:'Tradição que atravessa gerações.',
  artesanal:'Feito à mão, do jeito certo.',
  nivel:'O seu próximo nível começa aqui.',
  energia:'Mais energia para o que importa.',
  delicadeza:'Delicadeza em cada detalhe.',
  versao:'A sua melhor versão, todos os dias.',
  brincando:'Aprender brincando é muito mais divertido.',
  aventuras:'Grandes aventuras para pequenos exploradores.',
  transformacao:'A transformação que você procurava.',
  tempo:'Ganhe tempo para o que realmente importa.',
  vontade:'Deu vontade? A gente resolve.',
  saudade:'Sabor que dá saudade.',
};

const CTA = {
  pedir_whats:'Pedir pelo WhatsApp', pedir_delivery:'Pedir delivery', comprar:'Comprar agora',
  agendar:'Agendar horário', avaliacao:'Agendar avaliação', orcamento:'Solicitar orçamento',
  especialista:'Falar com especialista', reservar:'Reservar mesa', aula:'Agendar aula',
  visitar:'Como chegar', seguir:'Seguir no Instagram', material:'Baixar material',
  pedido:'Fazer meu pedido', desconto:'Quero meu desconto', catalogo:'Ver catálogo',
  conversar:'Falar com a equipe', conhecer:'Conhecer novidades',
  peca:'Peça agora', agende:'Agende já', compre:'Compre agora', saiba:'Saiba mais', fale:'Fale com a gente', ver:'Ver opções',
};

const SLOGAN = {
  memoria:'Sabor que vira memória.', alma:'Feito com alma.', seu_dia:'Do nosso jeito, pro seu dia.',
  qualidade:'Qualidade que se sente.', cuidado:'Cuidado que transforma.', simples:'Simples assim.',
  paixao:'Paixão em cada detalhe.', confianca:'Confiança que gera resultado.', crescer:'Inteligência que faz crescer.',
  bem_estar:'Bem-estar de verdade.', tradicao:'Tradição e sabor desde sempre.', volume:'Alto volume, alto sabor.',
  arte:'Arte, técnica e cuidado.', sua_casa:'Aqui é a sua casa.', merece:'Porque você merece o melhor.',
  energia:'Energia que move você.', beleza:'Beleza que é sua.', aventura:'Aprender é uma aventura.',
  durar:'Feito para durar.', gostoso:'Rápido, fácil e gostoso.', precisao:'Precisão em cada detalhe.',
  parceria:'Mais que um serviço, uma parceria.', natural:'Natural como deve ser.', classico:'Clássico nunca sai de moda.',
  momentos:'Pequenos detalhes, grandes momentos.', lar:'Onde você se sente em casa.',
};

function choice(a){ return a?.choice ?? null; }
function score(a){ const n=Number(a?.score); return Number.isFinite(n)?n:null; }
function labelKey(v){ return String(v||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase()); }
function palette(decisions){
  const key=choice(decisions?.marca?.paleta);
  return {key:key||'mono', colors:PALETTES[key]||PALETTES.mono};
}
function textCopy(copy,path,fallback){
  let cur=copy;
  for(const k of path.split('.')) cur=cur?.[k];
  return typeof cur==='string' && cur.trim()?cur.trim():fallback;
}
function node(tag,cls,text){
  const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n;
}
function setPalette(root,colors){
  root.style.setProperty('--p1',colors[0]); root.style.setProperty('--p2',colors[1]);
  root.style.setProperty('--p3',colors[2]); root.style.setProperty('--p4',colors[3]); root.style.setProperty('--p5',colors[4]);
}
function empty(root,label,sub){
  root.replaceChildren(); const box=node('div','piece-empty'); box.append(node('b','',label),node('span','',sub)); root.append(box);
}
export function resetPieces(){
  const defs=[['site-preview','LANDING PAGE','O site nasce aqui'],['posts-preview','CARROSSÉIS','3 histórias em 18 lâminas'],['brand-preview','MARCA','Logo, paleta e fontes'],['email-preview','E-MAIL','Template + assinatura'],['ads-preview','300×250','6 formatos de display']];
  for(const [id,a,b] of defs){const root=document.getElementById(id); if(root)empty(root,a,b);}
}
export function renderBrand(decisions,copy={}){
  const root=document.getElementById('brand-preview'); if(!root)return;
  const d=decisions?.marca; if(!d){empty(root,'MARCA','Logo, paleta e fontes');return;}
  const {colors}=palette(decisions); setPalette(root,colors); root.replaceChildren();
  const card=node('div','brand-card'); const top=node('div','brand-lockup');
  const mark=node('div',`brand-mark brand-mark--${choice(d.forma)||'circulo'}`,(choice(d.icone)||'W').slice(0,1).toUpperCase());
  const naming=node('div','brand-name'); naming.append(node('strong','',textCopy(copy,'brand.name','NOVA MARCA')),node('span','',textCopy(copy,'brand.slogan',SLOGAN[choice(d.slogan)]||labelKey(choice(d.slogan)||'identidade viva'))));
  top.append(mark,naming);
  const swatches=node('div','brand-swatches'); colors.forEach(c=>{const s=node('i');s.style.background=c;s.title=c;swatches.append(s);});
  const meta=node('div','brand-meta'); meta.append(node('span','',`logo · ${labelKey(choice(d.estilo)||'clássico')}`),node('span','',`fonte · ${labelKey(choice(d.fonte)||'editorial')}`));
  card.append(top,swatches,meta); root.append(card);
}
export function renderSite(decisions,copy={},v2={}){
  const root=document.getElementById('site-preview'); if(!root)return;
  const d=decisions?.site; if(!d){empty(root,'LANDING PAGE','O site nasce aqui');return;}
  const {colors}=palette(decisions); setPalette(root,colors); root.replaceChildren();
  const shell=node('div',`site-art site-art--${choice(d.hero)||'split'}`);
  const nav=node('div','site-nav'); nav.append(node('b','',textCopy(copy,'brand.name','MARCA')),node('span','', 'SERVIÇOS  ·  SOBRE  ·  CONTATO'));
  const structure=v2?.siteStructure||{hero:{enabled:true,variant:'split'},sections:[]};
  const heroVariant=structure.hero?.variant||choice(d.hero)||'split';
  shell.classList.add(`site-v2--${String(heroVariant).replaceAll('_','-')}`);
  if(structure.hero?.enabled!==false){
    const hero=node('div','site-hero-art'); const copyBox=node('div','site-copy');
    const title=textCopy(copy,'site.headline',TITLE[choice(d.titulo)]||'Uma marca feita para ser lembrada.');
    copyBox.append(node('small','',labelKey(choice(decisions?.entender?.seg)||'negócio')),node('h2','',title),node('p','',textCopy(copy,'site.subheadline','Estratégia, personalidade e uma experiência visual coerente do primeiro contato à conversão.')));
    const button=node('button','site-cta',textCopy(copy,'site.cta',CTA[choice(d.cta)]||'Conhecer agora')); button.type='button';
    copyBox.append(button);
    const art=node('div',`site-object site-object--${choice(d.img)||'flat'}`); art.append(node('i'),node('i'),node('i'));
    if(heroVariant==='mascot_right')art.classList.add('site-object--mascot');
    if(heroVariant==='dashboard_right')art.classList.add('site-object--dashboard');
    hero.append(copyBox,art); shell.append(nav,hero);
  }else shell.append(nav);
  const sectionLabels={benefits:'Benefícios',proof:'Prova social',features:'Serviços / recursos',process:'Como funciona',gallery:'Galeria',pricing:'Planos / preços',faq:'Perguntas frequentes',lead:'Fale com a gente',cta:'Pronto para começar?',footer:'Rodapé'};
  for(const id of structure.sections||[]){
    const sec=node('section',`site-v2-section site-v2-section--${id}`);
    sec.append(node('small','',id.toUpperCase()),node('strong','',sectionLabels[id]||labelKey(id)),node('span','',id==='faq'?'Perguntas e respostas essenciais para reduzir objeções.':id==='proof'?'Avaliações, números ou clientes que reforçam confiança.':'Bloco estrutural criado pelo comando de voz.'));
    shell.append(sec);
  }
  root.append(shell);
}
export function renderPosts(decisions,copy={}){
  const root=document.getElementById('posts-preview'); if(!root)return;
  const d=decisions?.posts; if(!d){empty(root,'CARROSSÉIS','3 histórias em 18 lâminas');return;}
  const {colors}=palette(decisions); setPalette(root,colors); root.replaceChildren();
  const titles=[
    textCopy(copy,'posts.presentation.title',labelKey(choice(d.p1_hook)||'Conheça a marca')),
    textCopy(copy,'posts.sales.title',labelKey(choice(d.p2_hook)||'Oferta em destaque')),
    textCopy(copy,'posts.relationship.title',labelKey(choice(d.p3_hook)||'Salve este conteúdo')),
  ];
  ['APRESENTAÇÃO','VENDA','RELACIONAMENTO'].forEach((kind,i)=>{
    const c=node('div',`post-card post-card--${i+1}`); c.append(node('small','',`0${i+1} · ${kind}`),node('strong','',titles[i]),node('span','',`6 lâminas · ${labelKey(choice(d[`p${i+1}_fmt`])||'sequência')}`)); root.append(c);
  });
}
export function renderEmail(decisions,copy={}){
  const root=document.getElementById('email-preview'); if(!root)return;
  const d=decisions?.email; if(!d){empty(root,'E-MAIL','Template + assinatura');return;}
  const {colors}=palette(decisions); setPalette(root,colors); root.replaceChildren();
  const mail=node('div','email-art'); const bar=node('div','email-bar'); bar.append(node('b','',textCopy(copy,'brand.name','MARCA')),node('span','',labelKey(choice(d.em_tipo)||'newsletter')));
  const body=node('div','email-body');
  body.append(node('small','','ASSUNTO'),node('strong','',textCopy(copy,'email.subject',labelKey(choice(d.em_assunto)||'Uma novidade para você'))),node('p','',textCopy(copy,'email.preview','Uma mensagem curta, clara e consistente com a nova identidade da marca.')));
  const b=node('button','email-cta',textCopy(copy,'email.cta',CTA[choice(d.em_cta)]||'Saiba mais')); b.type='button'; body.append(b);
  const sig=node('div','email-signature'); sig.append(node('i','', (textCopy(copy,'brand.name','W')).slice(0,1)),node('span','',textCopy(copy,'email.signature','Equipe · relacionamento e atendimento')));
  mail.append(bar,body,sig); root.append(mail);
}
export function renderAds(decisions,copy={}){
  const root=document.getElementById('ads-preview'); if(!root)return;
  const d=decisions?.anuncios; if(!d){empty(root,'300×250','6 formatos de display');return;}
  const {colors}=palette(decisions); setPalette(root,colors); root.replaceChildren();
  const ad=node('div',`ad-art ad-art--${choice(d.ad_estilo)||'tipografico'}`);
  ad.append(node('small','',labelKey(choice(d.ad_conceito)||'campanha')),node('strong','',textCopy(copy,'ads.headline',labelKey(choice(d.ad_titulo)||'Uma oferta para você'))),node('span','',textCopy(copy,'brand.slogan',SLOGAN[choice(decisions?.marca?.slogan)]||'Marca, produto e chamada em sintonia.')));
  const b=node('button','ad-cta',textCopy(copy,'ads.cta',CTA[choice(d.ad_cta)]||'Saiba mais'));b.type='button';ad.append(b);root.append(ad);
}
export function renderAll(decisions={},copy={},v2={}){
  renderBrand(decisions,copy); renderSite(decisions,copy,v2); renderPosts(decisions,copy); renderEmail(decisions,copy); renderAds(decisions,copy);
}
