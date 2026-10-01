import { QUESTION_GROUPS } from '../questions/catalog.mjs';
import { extractBriefingFacts } from './briefing-facts.mjs';

const norm=(v)=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const compact=(v,max=900)=>String(v||'').replace(/\s+/g,' ').trim().slice(0,max);
const choice=(answer)=>String(answer?.choice||'').trim();

const SEGMENT_TO_NICHE=Object.freeze({
  hamburgueria:'restaurant',pizzaria:'restaurant',restaurante:'restaurant',cafeteria:'cafe',confeitaria:'cafe',saudavel:'restaurant',bar:'restaurant',
  eventos:'general',hospedagem:'general',fotografia:'general',moda:'general',estetica:'aesthetics',salao:'aesthetics',barbearia:'aesthetics',
  odontologia:'dental',saude:'clinic',psicologia:'psychology',nutricao:'clinic',academia:'fitness',bemestar:'physiotherapy',pet:'general',
  consultoria:'consulting',contabilidade:'accounting',advocacia:'legal',marketing:'consulting',tecnologia:'tech',idiomas:'consulting',cursos:'consulting',
  imobiliaria:'real_estate',arquitetura:'architecture',reformas:'architecture',oficina:'general',outro:'general'
});
const PERSONALITY_ARCHETYPE=Object.freeze({
  rebelde:'bold-youth',sofisticada:'editorial-luxury',acolhedora:'organic-warm',divertida:'bold-youth',natural:'organic-warm',
  especialista:'professional-authority',moderna:'minimal-modern',tradicional:'heritage-classic',energetica:'sport-intense',
  delicada:'fashion-premium',ludica:'bold-youth'
});
const HERO_MAP=Object.freeze({
  split:'hero-split-image',central:'hero-full-background',cinema:'hero-full-background',editorial:'hero-editorial',
  cartoes:'hero-split-image',minimal:'hero-editorial',ludico:'hero-full-background',formulario:'hero-split-image',mosaico:'hero-product'
});

const SITE_SECTION_MAP=Object.freeze({
  sec_servicos:'features',
  sec_planos:'pricing',
  sec_como_funciona:'process',
  sec_depoimentos:'proof',
  sec_sobre:'about',
  sec_galeria:'gallery',
  sec_numeros:'numbers',
  sec_equipe:'team',
  sec_faq:'faq',
  sec_localizacao:'location',
  sec_lead:'lead',
});
const SEGMENT_CONTENT=Object.freeze({
  academia:{
    desc:'Musculação, treino funcional e uma rotina feita para manter você em movimento.',
    itemsTitle:'Treinos e planos',
    items:[
      ['Musculação','Estrutura para evoluir força, condicionamento e constância.'],
      ['Treino funcional','Aulas dinâmicas para trabalhar corpo inteiro e resistência.'],
      ['Aula experimental','Conheça o espaço, sinta o clima e descubra como começar.'],
    ],
    benefits:[
      ['Energia para treinar','Um ambiente pensado para transformar motivação em consistência.'],
      ['Evolução no seu ritmo','Treinos que acompanham diferentes níveis e objetivos.'],
      ['Experiência que puxa você para cima','Música, movimento e clima de treino de verdade.'],
    ],
    about:'Uma academia feita para quem quer sair do automático, treinar com energia e construir evolução com constância.',
    faq:[
      ['Posso fazer uma aula experimental?','Sim. Agende uma aula experimental para conhecer o espaço e entender como começar.'],
      ['Preciso já estar em forma?','Não. O ponto de partida é o seu momento atual; o importante é começar com segurança e constância.'],
      ['Quais tipos de treino encontro?','A proposta combina musculação e treino funcional, com opções para diferentes rotinas.'],
    ],
    steps:[
      ['Agende sua aula','Escolha um horário para conhecer a academia.'],
      ['Conheça o espaço','Veja a estrutura e entenda as opções de treino.'],
      ['Comece seu plano','Escolha a rotina que combina com seu objetivo e disponibilidade.'],
    ],
  },
  estetica:{
    desc:'Tratamentos de estética com atendimento cuidadoso e uma experiência pensada nos detalhes.',
    itemsTitle:'Tratamentos',
    items:[['Cuidados faciais','Protocolos voltados à saúde e aparência da pele.'],['Cuidados corporais','Opções para diferentes objetivos e momentos.'],['Avaliação','Converse sobre suas necessidades antes de escolher um tratamento.']],
  },
  odontologia:{desc:'Atendimento odontológico com foco em cuidado, clareza e confiança.',itemsTitle:'Tratamentos',items:[['Prevenção','Cuidados para manter a saúde bucal em dia.'],['Estética do sorriso','Opções para melhorar aparência e harmonia do sorriso.'],['Avaliação','Entenda o melhor caminho para o seu caso.']]},
  saude:{desc:'Atendimento em saúde com orientação clara e cuidado profissional.',itemsTitle:'Atendimentos',items:[['Consulta','Avaliação do seu momento e das suas necessidades.'],['Acompanhamento','Continuidade de cuidado com orientação profissional.'],['Agendamento','Escolha um horário e dê o próximo passo.']]},
  psicologia:{desc:'Um espaço de escuta e cuidado para atravessar momentos, escolhas e mudanças com mais clareza.',itemsTitle:'Atendimentos',items:[['Psicoterapia','Um processo de escuta e acompanhamento.'],['Atendimento individual','Espaço reservado para trabalhar questões pessoais.'],['Primeiro contato','Converse para entender como funciona o atendimento.']]},
  consultoria:{desc:'Consultoria para transformar diagnóstico em prioridades, rotina e resultado.',itemsTitle:'Programas',items:[['Diagnóstico','Leitura do cenário atual e dos principais gargalos.'],['Plano de ação','Prioridades, responsáveis e próximos passos claros.'],['Acompanhamento','Ritmo de execução e revisão de resultados.']]},
  contabilidade:{desc:'Contabilidade para organizar obrigações, números e decisões do negócio.',itemsTitle:'Serviços',items:[['Fiscal e tributário','Rotinas e obrigações acompanhadas com clareza.'],['Folha e departamento pessoal','Processos recorrentes organizados.'],['Abertura e regularização','Apoio para começar ou colocar a empresa em ordem.']]},
  advocacia:{desc:'Atuação jurídica com linguagem clara, estratégia e atenção ao contexto de cada cliente.',itemsTitle:'Áreas de atuação',items:[['Orientação jurídica','Entenda riscos, possibilidades e próximos passos.'],['Atuação estratégica','Condução do caso de acordo com a necessidade apresentada.'],['Consulta inicial','Converse para avaliar o cenário.']]},
  tecnologia:{desc:'Tecnologia para simplificar processos, conectar operações e acelerar trabalho.',itemsTitle:'Soluções',items:[['Sistemas e software','Soluções digitais para processos do dia a dia.'],['Integrações','Conecte ferramentas e reduza trabalho manual.'],['Suporte e evolução','Acompanhe melhorias e necessidades da operação.']]},
  imobiliaria:{desc:'Imóveis e atendimento para ajudar você a encontrar o próximo endereço com mais segurança.',itemsTitle:'Imóveis e serviços',items:[['Compra','Encontre opções alinhadas ao que você procura.'],['Venda','Apresente seu imóvel com estratégia e clareza.'],['Locação','Apoio para encontrar e fechar a opção certa.']]},
  arquitetura:{desc:'Arquitetura e interiores para transformar necessidades em espaços com identidade.',itemsTitle:'Projetos',items:[['Arquitetura','Projetos pensados do conceito à execução.'],['Interiores','Ambientes com função, conforto e personalidade.'],['Consultoria','Direção objetiva para decisões de espaço e acabamento.']]},
});
function sectionIds(site={}){
  const out=[];
  for(const [key,id] of Object.entries(SITE_SECTION_MAP)){
    const v=Number(site?.[key]?.noul);
    if(Number.isFinite(v)&&v>=0.5)out.push(id);
  }
  if(!out.includes('cta'))out.push('cta');
  return out;
}
function segmentContent(segmentId,label,differential,cta){
  const base=SEGMENT_CONTENT[segmentId]||{};
  const desc=base.desc||label+' com uma experiência clara, profissional e coerente do primeiro contato ao próximo passo.';
  const items=base.items||[
    ['Conheça as opções','Veja o que faz sentido para a sua necessidade.'],
    ['Atendimento claro','Tire dúvidas antes de decidir.'],
    ['Próximo passo',cta||'Fale com a equipe para continuar.'],
  ];
  const benefits=base.benefits||[
    ['Clareza','Entenda as opções e escolha com mais segurança.'],
    ['Experiência',differential||'Uma jornada coerente do primeiro contato ao atendimento.'],
    ['Proximidade','Um canal simples para conversar e avançar.'],
  ];
  return {
    desc,
    itemsTitle:base.itemsTitle||'Serviços e soluções',
    items,
    benefits,
    about:base.about||desc,
    faq:base.faq||[
      ['Como começo?','Entre em contato e explique o que você procura.'],
      ['Posso tirar dúvidas antes?','Sim. Converse com a equipe antes de escolher o próximo passo.'],
      ['Como saber qual opção escolher?','O atendimento pode orientar você de acordo com sua necessidade.'],
    ],
    steps:base.steps||[
      ['Conte o que precisa','Explique seu objetivo e tire as primeiras dúvidas.'],
      ['Conheça as opções','Veja as alternativas mais adequadas ao seu momento.'],
      ['Escolha o próximo passo','Avance pelo canal de atendimento que fizer mais sentido.'],
    ],
  };
}

function question(group,id){return QUESTION_GROUPS?.[group]?.[id]||null;}
function criterion(group,id,key){
  const q=question(group,id),criteria=q?.criteria;
  if(!key||!criteria||Array.isArray(criteria))return '';
  return String(criteria[key]||'').trim();
}
function cleanCriterion(text=''){
  const s=String(text||'').trim();
  const quoted=s.match(/[“"]([^”"]+)[”"]/);
  if(quoted?.[1])return quoted[1].trim();
  return s.split(/\s+[—-]\s+/)[0].split(':')[0].trim();
}
function segmentLabel(id){
  const raw=criterion('entender','seg',id);
  const base=(raw.split(':')[0]||id).split(',')[0].trim();
  return base||String(id||'Negócio').replaceAll('_',' ');
}
function tokenValues({brandName,segmentLabel:seg,audience,differential,product}){
  return {
    nome:brandName||seg||'Sua marca',
    produto:product||seg?.toLowerCase()||'serviço',
    ang:differential||'resultado',
    em_cidade:'',
    cidade:'',
    para_publico:audience?'para '+audience.toLowerCase():'para você'
  };
}
function fillTokens(text,values={}){
  return String(text||'').replace(/\{([a-z_]+)\}/gi,(_,k)=>values[k]??'').replace(/\s+/g,' ').replace(/\s+([,.!?;:])/g,'$1').trim();
}
function resolved(group,id,key,values,fallback=''){
  const raw=criterion(group,id,key);
  const picked=cleanCriterion(raw)||fallback;
  return fillTokens(picked,values);
}
function selectedSummary(group,id,answer){
  const key=choice(answer);
  return {id:key,label:resolved(group,id,key,{},key.replaceAll('_',' ')),description:criterion(group,id,key)};
}
function storyTargetFromBriefing(text=''){
  const t=norm(text);
  if(!/\b(story|stories|reel|reels)\b/.test(t))return null;
  if(!/\b(imagem|foto|fundo|background|fumaca|smoke|desenho|ilustr|visual|cena|ambiente|produto|pessoa|academia|clinica|loja)\b/.test(t))return null;
  let n=1;
  if(/\b(2|02|segund[oa])\b/.test(t))n=2;
  else if(/\b(3|03|terceir[oa])\b/.test(t))n=3;
  return 'stories.'+String(n).padStart(2,'0');
}
function mediaRequests(briefing=''){
  const slot=storyTargetFromBriefing(briefing);
  if(!slot)return [];
  return [{target:slot,kind:'image',instruction:compact(briefing,1200),explicit:true}];
}

export function buildStudioContext({decisions={},briefing='',brandName=''}={}){
  const entender=decisions?.entender||{},site=decisions?.site||{},marca=decisions?.marca||{},posts=decisions?.posts||{},email=decisions?.email||{},ads=decisions?.anuncios||{};
  const segmentId=choice(entender.seg)||'outro';
  const personalityId=choice(entender.pers)||'moderna';
  const audienceId=choice(entender.pub)||'geral';
  const objectiveId=choice(entender.obj)||'redes';
  const channelId=choice(entender.canal)||'site';
  const differentialId=choice(entender.dif)||'qualidade';
  const offerId=choice(entender.oferta)||'nenhuma';
  const segLabel=segmentLabel(segmentId);
  const audience=resolved('entender','pub',audienceId,{},audienceId.replaceAll('_',' '));
  const differential=resolved('entender','dif',differentialId,{},differentialId.replaceAll('_',' '));
  const values=tokenValues({brandName,segmentLabel:segLabel,audience,differential});
  const facts=extractBriefingFacts(briefing);

  const siteHeadline=resolved('site','titulo',choice(site.titulo),values,'Uma experiência de '+segLabel.toLowerCase()+' pensada para você.');
  const siteCta=resolved('site','cta',choice(site.cta),values,'Saiba mais');
  const p1=resolved('posts','p1_hook',choice(posts.p1_hook),values,'Conheça '+values.nome);
  const p2=resolved('posts','p2_hook',choice(posts.p2_hook),values,'Uma oferta para você');
  const p3=resolved('posts','p3_hook',choice(posts.p3_hook),values,'Fale com a gente');
  const emailSubject=resolved('email','em_assunto',choice(email.em_assunto),values,'Novidades de '+values.nome);
  const adHeadline=resolved('anuncios','ad_titulo',choice(ads.ad_titulo),values,siteHeadline);
  const slogan=resolved('marca','slogan',choice(marca.slogan),values,differential);

  const siteSections=sectionIds(site);
  const content=segmentContent(segmentId,segLabel,differential,siteCta);

  const storyItems=[
    {type:'presentation',headline:p1,cta:'Toque para conhecer',assetSlot:'stories.01'},
    {type:'offer',headline:p2,cta:siteCta,assetSlot:'stories.02'},
    {type:'relationship',headline:p3,cta:'Fale com a gente',assetSlot:'stories.03'},
  ];

  return {
    schema:1,
    generatedAt:new Date().toISOString(),
    briefing:compact(briefing,5000),
    briefingFacts:facts,
    business:{
      segmentId,segmentLabel:segLabel,segmentDescription:criterion('entender','seg',segmentId),
      personality:selectedSummary('entender','pers',entender.pers),
      audience:selectedSummary('entender','pub',entender.pub),
      objective:selectedSummary('entender','obj',entender.obj),
      channel:selectedSummary('entender','canal',entender.canal),
      differential:selectedSummary('entender','dif',entender.dif),
      offer:selectedSummary('entender','oferta',entender.oferta),
    },
    brand:{
      name:compact(brandName,120),
      paletteDecision:choice(marca.paleta),
      paletteDescription:criterion('marca','paleta',choice(marca.paleta)),
      explicitColors:facts.colors,
      palette:facts.palette,
      fontDecision:choice(marca.fonte),
      slogan,
    },
    site:{
      heroDecision:choice(site.hero),
      heroComposition:HERO_MAP[choice(site.hero)]||'hero-split-image',
      headline:siteHeadline,
      subheadline:segLabel+' com foco em '+differential.toLowerCase()+'.',
      cta:siteCta,
      sections:siteSections,
      content,
    },
    social:{
      posts:[
        {type:'presentation',headline:p1},
        {type:'sales',headline:p2},
        {type:'relationship',headline:p3},
      ],
      stories:storyItems,
    },
    email:{subject:emailSubject,preheader:differential+'. '+siteCta+'.'},
    ads:{headline:adHeadline,cta:siteCta},
    copyFallback:{
      brand:{name:brandName||segLabel,slogan},
      site:{headline:siteHeadline,subheadline:segLabel+' com foco em '+differential.toLowerCase()+'.',cta:siteCta},
      posts:{presentation:{title:p1},sales:{title:p2},relationship:{title:p3}},
      email:{subject:emailSubject,preview:differential+'. '+siteCta+'.'},
      ads:{headline:adHeadline,cta:siteCta},
    },
    media:{requests:mediaRequests(briefing)},
    creative:{
      nicheId:SEGMENT_TO_NICHE[segmentId]||'general',
      archetypeHint:PERSONALITY_ARCHETYPE[personalityId]||null,
      heroComposition:HERO_MAP[choice(site.hero)]||'hero-split-image',
    },
  };
}
