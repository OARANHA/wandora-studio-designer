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
function palette(decisions,v2={}){
  const explicit=v2?.studioContext?.briefingFacts?.palette||v2?.briefingFacts?.palette||v2?.creativePlan?.brand?.palette;
  if(Array.isArray(explicit)&&explicit.length>=5&&explicit.every(x=>/^#[0-9a-f]{6}$/i.test(String(x||'')))){
    return {key:'briefing',colors:explicit.slice(0,5)};
  }
  const key=choice(decisions?.marca?.paleta);
  return {key:key||'mono', colors:PALETTES[key]||PALETTES.mono};
}
function brandFallback(decisions,v2={}){
  const canonical=String(v2?.studioContext?.copyFallback?.brand?.name||'').trim();
  if(canonical)return canonical;
  const planned=String(v2?.creativePlan?.business?.label||'').split('/')[0].trim();
  if(planned)return planned;
  const seg=choice(decisions?.entender?.seg);
  return seg?labelKey(seg):'Sua marca';
}
function textCopy(copy,path,fallback){
  let cur=copy;
  for(const k of path.split('.')) cur=cur?.[k];
  return typeof cur==='string' && cur.trim()?cur.trim():fallback;
}
function contextCopy(v2,path,fallback){
  let cur=v2?.studioContext?.copyFallback;
  for(const k of path.split('.'))cur=cur?.[k];
  return typeof cur==='string'&&cur.trim()?cur.trim():fallback;
}
function node(tag,cls,text){
  const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n;
}
function setPalette(root,colors){
  root.style.setProperty('--p1',colors[0]); root.style.setProperty('--p2',colors[1]);
  root.style.setProperty('--p3',colors[2]); root.style.setProperty('--p4',colors[3]); root.style.setProperty('--p5',colors[4]);
}
function creativeAsset(v2={},slot=''){
  const assets=v2?.creativePlan?.assets;
  return Array.isArray(assets)?assets.find(a=>a?.slot===slot&&a?.assetId):null;
}
function creativeAssetUrl(v2={},slot=''){
  const a=creativeAsset(v2,slot); if(!a)return '';
  if(typeof a.contentUrl==='string'&&a.contentUrl.startsWith('/api/projects/'))return a.contentUrl;
  const projectId=v2?.projectId||v2?.creativePlan?.projectId;
  return projectId?`/api/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(a.assetId)}/content`:'';
}
function empty(root,label,sub){
  root.replaceChildren(); const box=node('div','piece-empty'); box.append(node('b','',label),node('span','',sub)); root.append(box);
}
export function resetPieces(){
  const defs=[['site-preview','LANDING PAGE','O site nasce aqui'],['posts-preview','CARROSSÉIS','3 histórias em 18 lâminas'],['brand-preview','MARCA','Logo, paleta e fontes'],['email-preview','E-MAIL','Template + assinatura'],['ads-preview','300×250','6 formatos de display'],['stories-preview','9:16','Stories derivados da campanha'],['manual-preview','BRAND BOOK','Logo, cores, tipo e aplicações']];
  for(const [id,a,b] of defs){const root=document.getElementById(id); if(root)empty(root,a,b);}
}
export function renderBrand(decisions,copy={},v2={}){
  const root=document.getElementById('brand-preview'); if(!root)return;
  const d=decisions?.marca; if(!d){empty(root,'MARCA','Logo, paleta e fontes');return;}
  const {colors}=palette(decisions,v2); setPalette(root,colors); root.replaceChildren();
  const card=node('div','brand-card'); const top=node('div','brand-lockup');
  const mark=node('div',`brand-mark brand-mark--${choice(d.forma)||'circulo'}`,(choice(d.icone)||'W').slice(0,1).toUpperCase());
  const naming=node('div','brand-name'); naming.append(node('strong','',textCopy(copy,'brand.name',contextCopy(v2,'brand.name',brandFallback(decisions,v2)))),node('span','',textCopy(copy,'brand.slogan',contextCopy(v2,'brand.slogan',SLOGAN[choice(d.slogan)]||labelKey(choice(d.slogan)||'identidade viva')))));
  top.append(mark,naming);
  const swatches=node('div','brand-swatches'); colors.forEach(c=>{const s=node('i');s.style.background=c;s.title=c;swatches.append(s);});
  const meta=node('div','brand-meta'); meta.append(node('span','',`logo · ${labelKey(choice(d.estilo)||'clássico')}`),node('span','',`fonte · ${labelKey(choice(d.fonte)||'editorial')}`));
  card.append(top,swatches,meta); root.append(card);
}
export function renderSite(decisions,copy={},v2={}){
  const root=document.getElementById('site-preview'); if(!root)return;
  const d=decisions?.site; if(!d){empty(root,'LANDING PAGE','O site nasce aqui');return;}
  const {colors}=palette(decisions,v2); setPalette(root,colors); root.replaceChildren();

  const context=v2?.studioContext?.site||{};
  const content=context?.content||{};
  const structure=v2?.siteStructure||{hero:{enabled:true,variant:'split'},sections:[]};
  const contextSections=Array.isArray(context?.sections)?context.sections:[];
  const sections=(Array.isArray(structure.sections)&&structure.sections.length?structure.sections:contextSections.length?contextSections:['features','proof','cta']).filter(Boolean);
  const heroVariant=structure.hero?.variant||context?.heroDecision||choice(d.hero)||'split';
  const shell=node('div',`site-art site-mini site-art--${choice(d.hero)||'split'}`);
  shell.classList.add(`site-v2--${String(heroVariant).replaceAll('_','-')}`);

  const brand=textCopy(copy,'brand.name',contextCopy(v2,'brand.name',brandFallback(decisions,v2)));
  const sectionLabels={benefits:'Benefícios',proof:'Resultados',features:content?.itemsTitle||'Serviços',process:'Como funciona',gallery:'Galeria',pricing:'Planos',faq:'FAQ',about:'Sobre',numbers:'Números',team:'Equipe',location:'Localização',lead:'Contato',cta:'Contato',footer:'Rodapé'};
  const navNames=[...new Set(sections.map(id=>sectionLabels[id]).filter(Boolean))].slice(0,4);
  const nav=node('div','site-nav');
  const navBrand=node('b','site-nav-brand',brand);
  const navLinks=node('span','site-nav-links',(navNames.length?navNames:['Início','Serviços','Contato']).join('  ·  '));
  nav.append(navBrand,navLinks);

  const hero=node('div','site-hero-art');
  const copyBox=node('div','site-copy');
  const title=textCopy(copy,'site.headline',contextCopy(v2,'site.headline',TITLE[choice(d.titulo)]||'Uma marca feita para ser lembrada.'));
  const subtitle=textCopy(copy,'site.subheadline',contextCopy(v2,'site.subheadline',content?.desc||'Uma experiência pensada para transformar interesse em próximo passo.'));
  copyBox.append(
    node('small','site-kicker',labelKey(choice(decisions?.entender?.seg)||'negócio')),
    node('h2','',title),
    node('p','',subtitle)
  );
  const button=node('button','site-cta',textCopy(copy,'site.cta',contextCopy(v2,'site.cta',CTA[choice(d.cta)]||'Conhecer agora'))); button.type='button';
  copyBox.append(button);

  const art=node('div',`site-object site-object--${choice(d.img)||'flat'}`);
  const heroSlot=v2?.creativePlan?.site?.hero?.assetSlot||'site.hero';
  const heroImage=creativeAssetUrl(v2,heroSlot);
  if(heroImage){
    const img=node('img','site-object-media');img.src=heroImage;img.alt='';img.loading='eager';art.append(img);art.classList.add('site-object--generated');
  }else{
    const wire=node('div','site-object-wire');
    wire.append(node('i'),node('i'),node('i'));
    art.append(wire);
  }
  if(heroVariant==='mascot_right')art.classList.add('site-object--mascot');
  if(heroVariant==='dashboard_right')art.classList.add('site-object--dashboard');

  if(structure.hero?.enabled!==false)hero.append(copyBox,art);
  else hero.append(copyBox);
  shell.append(nav,hero);

  const itemRows=Array.isArray(content?.items)?content.items:[];
  const benefitRows=Array.isArray(content?.benefits)?content.benefits:[];
  const stepRows=Array.isArray(content?.steps)?content.steps:[];
  const faqRows=Array.isArray(content?.faq)?content.faq:[];

  const makeCard=(title,desc='')=>{
    const card=node('div','site-mini-card');
    card.append(node('strong','',String(title||'Conteúdo')),node('span','',String(desc||'')));
    return card;
  };
  const makeSection=(id)=>{
    const sec=node('section',`site-mini-section site-mini-section--${id}`);
    const head=node('div','site-mini-section-head');
    head.append(node('small','',String(id).toUpperCase()),node('strong','',sectionLabels[id]||labelKey(id)));
    sec.append(head);

    if(id==='features'||id==='pricing'){
      const rows=(itemRows.length?itemRows:[['Opção 1','Benefício principal'],['Opção 2','Diferencial'],['Opção 3','Próximo passo']]).slice(0,3);
      const grid=node('div','site-mini-grid');
      rows.forEach(([a,b])=>grid.append(makeCard(a,b)));
      sec.append(grid);
    }else if(id==='benefits'){
      const rows=(benefitRows.length?benefitRows:[['Benefício 1','Valor percebido'],['Benefício 2','Experiência'],['Benefício 3','Resultado']]).slice(0,3);
      const grid=node('div','site-mini-grid');
      rows.forEach(([a,b])=>grid.append(makeCard(a,b)));
      sec.append(grid);
    }else if(id==='process'){
      const rows=(stepRows.length?stepRows:[['01','Comece aqui'],['02','Escolha'],['03','Avance']]).slice(0,3);
      const flow=node('div','site-mini-flow');
      rows.forEach(([a,b],i)=>{const step=makeCard(a,b);step.dataset.step=String(i+1);flow.append(step);});
      sec.append(flow);
    }else if(id==='proof'){
      const quote=node('div','site-mini-proof');
      quote.append(node('b','', '“'),node('span','',textCopy(copy,'posts.relationship.title','Experiência que gera confiança.')),node('small','', 'CLIENTE / PROVA SOCIAL'));
      sec.append(quote);
    }else if(id==='gallery'){
      const gallery=node('div','site-mini-gallery');
      ['stories.01','stories.02','stories.03'].forEach(slot=>{
        const fig=node('div','site-mini-thumb'); const src=creativeAssetUrl(v2,slot);
        if(src){const img=node('img');img.src=src;img.alt='';fig.append(img);}else fig.append(node('i'));
        gallery.append(fig);
      });
      sec.append(gallery);
    }else if(id==='faq'){
      const faq=node('div','site-mini-faq');
      (faqRows.length?faqRows:[['Pergunta frequente','Resposta objetiva'],['Outra dúvida','Resposta curta']]).slice(0,2).forEach(([q,a])=>{
        const row=node('div','site-mini-faq-row');row.append(node('strong','',q),node('span','',a));faq.append(row);
      });
      sec.append(faq);
    }else if(id==='about'||id==='team'||id==='location'||id==='lead'||id==='numbers'){
      const split=node('div','site-mini-split');
      split.append(makeCard(sectionLabels[id]||id,content?.about||content?.desc||subtitle),node('div','site-mini-placeholder',''));
      sec.append(split);
    }else if(id==='cta'){
      const band=node('div','site-mini-cta');
      band.append(node('strong','',textCopy(copy,'brand.slogan',contextCopy(v2,'brand.slogan','Pronto para começar?'))),node('span','',textCopy(copy,'site.cta',contextCopy(v2,'site.cta','Falar com a equipe'))));
      sec.append(band);
    }else{
      sec.append(makeCard(sectionLabels[id]||id,'Bloco do site definido pelo briefing.'));
    }
    return sec;
  };

  sections.slice(0,7).forEach(id=>shell.append(makeSection(id)));
  const footer=node('div','site-mini-footer');
  footer.append(node('b','',brand),node('span','',(navNames.length?navNames:['Sobre','Suporte','Contato']).join('  ·  ')));
  shell.append(footer);
  root.append(shell);
}
export function renderPosts(decisions,copy={},v2={}){
  const root=document.getElementById('posts-preview'); if(!root)return;
  const d=decisions?.posts; if(!d){empty(root,'CARROSSÉIS','3 histórias em 18 lâminas');return;}
  const {colors}=palette(decisions,v2); setPalette(root,colors); root.replaceChildren();
  const titles=[
    textCopy(copy,'posts.presentation.title',contextCopy(v2,'posts.presentation.title',labelKey(choice(d.p1_hook)||'Conheça a marca'))),
    textCopy(copy,'posts.sales.title',contextCopy(v2,'posts.sales.title',labelKey(choice(d.p2_hook)||'Oferta em destaque'))),
    textCopy(copy,'posts.relationship.title',contextCopy(v2,'posts.relationship.title',labelKey(choice(d.p3_hook)||'Salve este conteúdo'))),
  ];
  ['APRESENTAÇÃO','VENDA','RELACIONAMENTO'].forEach((kind,i)=>{
    const c=node('article',`post-card post-card--${i+1}`);
    const bg=creativeAssetUrl(v2,`stories.${String(i+1).padStart(2,'0')}`)||creativeAssetUrl(v2,'site.hero');
    const top=node('div','post-top');top.append(node('small','',`0${i+1} · ${kind}`),node('i','', '1/6'));
    const media=node('div','post-media');
    if(bg){const img=node('img');img.src=bg;img.alt='';img.loading='lazy';media.append(img);c.classList.add('post-card--media');}
    else media.append(node('span','', 'IMAGEM / ARTE'));
    const body=node('div','post-copy');body.append(node('strong','',titles[i]),node('span','',labelKey(choice(d[`p${i+1}_fmt`])||'sequência')));
    const foot=node('div','post-footer');foot.append(node('b','', '● ● ● ○ ○ ○'),node('span','', 'CARROSSEL'));
    c.append(top,media,body,foot);root.append(c);
  });
}
export function renderEmail(decisions,copy={},v2={}){
  const root=document.getElementById('email-preview'); if(!root)return;
  const d=decisions?.email; if(!d){empty(root,'E-MAIL','Template + assinatura');return;}
  const {colors}=palette(decisions,v2); setPalette(root,colors); root.replaceChildren();
  const mail=node('div','email-art'); const bar=node('div','email-bar'); bar.append(node('b','',textCopy(copy,'brand.name',brandFallback(decisions,v2))),node('span','',labelKey(choice(d.em_tipo)||'newsletter')));
  const body=node('div','email-body');
  body.append(node('small','','ASSUNTO'),node('strong','',textCopy(copy,'email.subject',contextCopy(v2,'email.subject',labelKey(choice(d.em_assunto)||'Uma novidade para você')))),node('p','',textCopy(copy,'email.preview',contextCopy(v2,'email.preview','Uma mensagem curta, clara e consistente com a nova identidade da marca.'))));
  const b=node('button','email-cta',textCopy(copy,'email.cta',CTA[choice(d.em_cta)]||'Saiba mais')); b.type='button'; body.append(b);
  const sig=node('div','email-signature'); sig.append(node('i','', (textCopy(copy,'brand.name',brandFallback(decisions,v2))).slice(0,1)),node('span','',textCopy(copy,'email.signature','Equipe · relacionamento e atendimento')));
  mail.append(bar,body,sig); root.append(mail);
}
export function renderStories(decisions,copy={},v2={}){
  const root=document.getElementById('stories-preview'); if(!root)return;
  const d=decisions?.posts; if(!d){empty(root,'9:16','Stories derivados da campanha');return;}
  const {colors}=palette(decisions,v2); setPalette(root,colors); root.replaceChildren();
  const planned=Array.isArray(v2?.creativePlan?.stories?.items)?v2.creativePlan.stories.items:[];
  const defaults=[
    {type:'presentation',headline:textCopy(copy,'posts.presentation.title',contextCopy(v2,'posts.presentation.title','Conheça a marca')),cta:'Toque para conhecer',assetSlot:'stories.01'},
    {type:'offer',headline:textCopy(copy,'posts.sales.title',contextCopy(v2,'posts.sales.title','Oferta em destaque')),cta:contextCopy(v2,'site.cta','Arraste para saber mais'),assetSlot:'stories.02'},
    {type:'relationship',headline:textCopy(copy,'posts.relationship.title',contextCopy(v2,'posts.relationship.title','Fale com a gente')),cta:'Responda este story',assetSlot:'stories.03'},
  ];
  const labels={presentation:'APRESENTAÇÃO',offer:'VENDA',authority:'AUTORIDADE',tip:'DICA',testimonial:'PROVA',cta:'CHAMADA',relationship:'RELACIONAMENTO',product:'PRODUTO'};
  defaults.map((fallback,i)=>({...fallback,...(planned[i]||{}),headline:(planned[i]?.headline||fallback.headline)})).forEach((item,i)=>{
    const card=node('article',`story-card story-card--${i+1}`);
    const progress=node('div','story-progress');
    for(let p=0;p<3;p++)progress.append(node('i',p===i?'on':''));
    const bg=creativeAssetUrl(v2,item.assetSlot||`stories.${String(i+1).padStart(2,'0')}`);
    const media=node('div','story-media');
    if(bg){const img=node('img');img.src=bg;img.alt='';img.loading='lazy';media.append(img);card.classList.add('story-card--media');}
    else media.append(node('span','', 'FUNDO 9:16'));
    const top=node('div','story-top'); top.append(node('small','',`0${i+1} · ${labels[item.type]||String(item.type||'STORY').toUpperCase()}`),node('i','',i===1?'▶':'W'));
    const body=node('div','story-body'); body.append(node('strong','',item.headline||fallback.headline),node('span','',item.cta||fallback.cta));
    const foot=node('div','story-foot',String(item.cta||'ENVIAR MENSAGEM').toUpperCase());
    card.append(progress,media,top,body,foot); root.append(card);
  });
}
export function renderManual(decisions,copy={},v2={}){
  const root=document.getElementById('manual-preview'); if(!root)return;
  const d=decisions?.marca; if(!d){empty(root,'BRAND BOOK','Logo, cores, tipo e aplicações');return;}
  const {colors}=palette(decisions,v2); setPalette(root,colors); root.replaceChildren();
  const shell=node('div','manual-art');
  const cover=node('div','manual-cover');
  cover.append(node('small','','MANUAL DE MARCA'),node('strong','',textCopy(copy,'brand.name',contextCopy(v2,'brand.name',brandFallback(decisions,v2)))),node('span','',textCopy(copy,'brand.slogan',contextCopy(v2,'brand.slogan',SLOGAN[choice(d.slogan)]||'Identidade que trabalha como sistema.'))));
  const guide=node('div','manual-guide');
  const swatches=node('div','manual-swatches');colors.forEach(c=>{const i=node('i');i.style.background=c;i.title=c;swatches.append(i);});
  const rules=node('ul','manual-rules');
  ['Logo e variações',`Cores · ${choice(d.paleta)||'paleta'}`,`Tipografia · ${labelKey(choice(d.fonte)||'editorial')}`,'Tom de voz e aplicações','Mascote e elementos visuais'].forEach(x=>rules.append(node('li','',x)));
  const structure=v2?.siteStructure;
  if(structure?.hero?.enabled)rules.append(node('li','',`Aplicação digital · hero ${labelKey(structure.hero.variant)}`));
  guide.append(swatches,rules);shell.append(cover,guide);root.append(shell);
}

export function renderAds(decisions,copy={},v2={}){
  const root=document.getElementById('ads-preview'); if(!root)return;
  const d=decisions?.anuncios; if(!d){empty(root,'300×250','6 formatos de display');return;}
  const {colors}=palette(decisions,v2); setPalette(root,colors); root.replaceChildren();
  const ad=node('div',`ad-art ad-art--${choice(d.ad_estilo)||'tipografico'}`);
  const reuse=v2?.creativePlan?.ads?.reuseSlot||'site.hero';
  const bg=creativeAssetUrl(v2,reuse)||creativeAssetUrl(v2,'stories.01');
  if(bg){ad.classList.add('ad-art--media');ad.style.backgroundImage=`linear-gradient(135deg,rgba(7,8,7,.2),rgba(7,8,7,.88)),url("${bg}")`;ad.style.backgroundSize='cover';ad.style.backgroundPosition='center';}
  ad.append(node('small','',labelKey(choice(d.ad_conceito)||'campanha')),node('strong','',textCopy(copy,'ads.headline',contextCopy(v2,'ads.headline',labelKey(choice(d.ad_titulo)||'Uma oferta para você')))),node('span','',textCopy(copy,'brand.slogan',SLOGAN[choice(decisions?.marca?.slogan)]||'Marca, produto e chamada em sintonia.')));
  const b=node('button','ad-cta',textCopy(copy,'ads.cta',contextCopy(v2,'ads.cta',CTA[choice(d.ad_cta)]||'Saiba mais')));b.type='button';ad.append(b);root.append(ad);
}
export function renderAll(decisions={},copy={},v2={}){
  renderBrand(decisions,copy,v2); renderSite(decisions,copy,v2); renderPosts(decisions,copy,v2); renderStories(decisions,copy,v2); renderEmail(decisions,copy,v2); renderAds(decisions,copy,v2); renderManual(decisions,copy,v2);
}
