import { jevDecide } from '../ai/jev.mjs';
import { extractBriefingFacts } from './briefing-facts.mjs';
import { buildStudioContext } from './studio-context.mjs';

const norm=(v)=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const compact=(v,max=900)=>String(v||'').replace(/\s+/g,' ').trim().slice(0,max);

export const NICHE_PACKS=Object.freeze({
  clinic:{label:'Clínica',businessModel:'healthcare',keywords:['clinica','consultorio','saude','tratamento'],archetypes:['clinical-premium','clinical-clean','professional-authority'],sections:['benefits','features','proof','faq','lead','cta'],subject:'modern healthcare clinic interior with a welcoming professional atmosphere',storySubjects:['welcoming clinic environment','professional care moment','clean premium healthcare detail'],tone:['confiança','acolhimento','clareza']},
  medical:{label:'Médico / Medicina',businessModel:'healthcare',keywords:['medico','medica','medicina','cardiologista','dermatologista','pediatra','ortopedista'],archetypes:['clinical-premium','professional-authority','clinical-clean'],sections:['features','proof','process','faq','lead','cta'],subject:'premium medical office with natural light and discreet professional details',storySubjects:['doctor consultation environment','health guidance visual','professional medical portrait environment'],tone:['autoridade','clareza','acolhimento']},
  dental:{label:'Odontologia',businessModel:'healthcare',keywords:['dentista','odontologia','odontologica','dental','implante','ortodontia'],archetypes:['clinical-clean','clinical-premium','professional-authority'],sections:['benefits','features','proof','gallery','faq','lead','cta'],subject:'contemporary dental clinic with premium clean design',storySubjects:['modern dental room','smile care detail','premium dental service atmosphere'],tone:['confiança','cuidado','precisão']},
  psychology:{label:'Psicologia',businessModel:'professional',keywords:['psicologa','psicologo','psicologia','terapia','terapeuta'],archetypes:['organic-warm','minimal-modern','clinical-premium'],sections:['benefits','features','process','faq','lead','cta'],subject:'warm contemporary therapy office with soft natural light and calm textures',storySubjects:['calm therapy space','soft contemplative lifestyle scene','welcoming neutral interior with negative space'],tone:['acolhimento','serenidade','proximidade']},
  physiotherapy:{label:'Fisioterapia',businessModel:'healthcare',keywords:['fisioterapia','fisioterapeuta','reabilitacao','pilates clinico'],archetypes:['clinical-clean','sport-intense','minimal-modern'],sections:['benefits','features','process','proof','lead','cta'],subject:'modern physiotherapy studio with movement and rehabilitation equipment',storySubjects:['rehabilitation exercise','mobility detail','professional physiotherapy environment'],tone:['movimento','confiança','cuidado']},
  aesthetics:{label:'Estética / Beleza',businessModel:'local_service',keywords:['estetica','esteticista','beleza','harmonizacao','depilacao','salao','barbearia','manicure'],archetypes:['fashion-premium','editorial-luxury','organic-warm'],sections:['benefits','features','gallery','proof','lead','cta'],subject:'elegant beauty studio with refined materials and flattering soft light',storySubjects:['premium beauty treatment atmosphere','elegant beauty detail','stylish service environment'],tone:['elegância','desejo','cuidado']},
  legal:{label:'Advocacia',businessModel:'professional',keywords:['advogado','advogada','advocacia','juridico','juridica','direito'],archetypes:['professional-authority','editorial-luxury','minimal-modern'],sections:['features','benefits','proof','faq','lead','cta'],subject:'sophisticated law office with architectural lines and professional atmosphere',storySubjects:['law office detail','professional consultation setting','editorial authority visual'],tone:['autoridade','confiança','clareza']},
  accounting:{label:'Contabilidade',businessModel:'professional',keywords:['contador','contadora','contabilidade','contabil','fiscal'],archetypes:['professional-authority','corporate-modern','minimal-modern'],sections:['features','benefits','process','proof','lead','cta'],subject:'contemporary accounting office with organized business atmosphere',storySubjects:['business planning desk','professional accounting environment','clean financial consulting visual'],tone:['segurança','organização','clareza']},
  architecture:{label:'Arquitetura / Design',businessModel:'professional',keywords:['arquiteto','arquiteta','arquitetura','interiores','designer de interiores'],archetypes:['editorial-luxury','minimal-modern','organic-warm'],sections:['gallery','features','process','proof','lead','cta'],subject:'high-end contemporary architecture interior with editorial composition',storySubjects:['architectural interior detail','material and texture study','modern design project atmosphere'],tone:['sofisticação','autoria','precisão']},
  consulting:{label:'Consultoria / Profissional liberal',businessModel:'professional',keywords:['consultor','consultora','consultoria','mentor','mentoria','profissional liberal','especialista'],archetypes:['professional-authority','minimal-modern','corporate-modern'],sections:['benefits','features','process','proof','lead','cta'],subject:'modern professional consulting environment with confident editorial composition',storySubjects:['professional strategy meeting','minimal work environment','authority portrait setting'],tone:['autoridade','proximidade','resultado']},
  real_estate:{label:'Imobiliário',businessModel:'local_service',keywords:['imobiliaria','imovel','imoveis','corretor','corretora','construtora'],archetypes:['editorial-luxury','professional-authority','minimal-modern'],sections:['gallery','features','benefits','proof','lead','cta'],subject:'premium contemporary residential architecture photographed for real estate campaign',storySubjects:['luxury living room','modern residential facade','real estate lifestyle detail'],tone:['confiança','aspiração','clareza']},
  fitness:{label:'Academia / Fitness',businessModel:'local_service',keywords:['academia','fitness','crossfit','musculacao','treino','box'],archetypes:['sport-intense','bold-youth','digital-futuristic'],sections:['benefits','features','gallery','proof','pricing','cta'],subject:'energetic contemporary gym interior with dramatic athletic atmosphere',storySubjects:['athlete training in modern gym','gym equipment action detail','high energy fitness environment'],tone:['energia','performance','superação']},
  personal:{label:'Personal Trainer',businessModel:'professional',keywords:['personal trainer','personal','treinador','treinadora'],archetypes:['sport-intense','professional-authority','bold-youth'],sections:['benefits','features','proof','process','lead','cta'],subject:'professional personal training session in a modern fitness environment',storySubjects:['personal training action','athletic coaching moment','fitness transformation mood'],tone:['energia','proximidade','resultado']},
  restaurant:{label:'Restaurante / Gastronomia',businessModel:'hospitality',keywords:['restaurante','pizzaria','hamburgueria','bistro','gastronomia','delivery'],archetypes:['organic-warm','editorial-luxury','bold-youth'],sections:['gallery','features','benefits','proof','lead','cta'],subject:'beautiful restaurant food and ambience photographed with appetizing editorial lighting',storySubjects:['signature dish close-up','restaurant ambience','food preparation detail'],tone:['desejo','sabor','proximidade']},
  cafe:{label:'Cafeteria / Confeitaria',businessModel:'hospitality',keywords:['cafeteria','cafe','confeitaria','padaria','doceria'],archetypes:['organic-warm','heritage-classic','minimal-modern'],sections:['gallery','features','benefits','proof','lead','cta'],subject:'warm specialty coffee shop with artisan details and natural light',storySubjects:['coffee close-up','pastry and table detail','cozy cafe ambience'],tone:['aconchego','sabor','artesanal']},
  tech:{label:'Tecnologia / SaaS',businessModel:'digital',keywords:['software','saas','tecnologia','ti','aplicativo','plataforma','startup','agencia digital'],archetypes:['digital-futuristic','minimal-modern','corporate-modern'],sections:['benefits','features','process','proof','pricing','cta'],subject:'futuristic digital product environment with refined interface-inspired lighting',storySubjects:['abstract technology visual','modern dashboard atmosphere','digital innovation concept'],tone:['inovação','clareza','velocidade']},
  paint_factory:{label:'Fábrica de tintas',businessModel:'industry',keywords:['fabrica de tinta','fabricante de tinta','industria de tinta','industria de tintas','revestimento industrial','tintas industriais'],archetypes:['industrial-color','industrial-tech','corporate-modern'],sections:['benefits','features','process','gallery','proof','lead','cta'],subject:'paint manufacturing and architectural coatings campaign with color science, premium surfaces and industrial precision',storySubjects:['paint color laboratory','architectural wall coating detail','industrial paint product application'],tone:['tecnologia','qualidade','rendimento']},
  paint_store:{label:'Loja de tintas',businessModel:'retail',keywords:['loja de tinta','loja de tintas','casa de tintas','tintas e ferramentas','material de pintura'],archetypes:['retail-colorful','local-friendly','minimal-modern'],sections:['benefits','features','gallery','proof','lead','cta'],subject:'beautiful home interior transformed by expressive wall colors, retail paint campaign',storySubjects:['stylish living room with painted wall','paint color swatches and roller','freshly painted interior transformation'],tone:['inspiração','proximidade','praticidade']},
  watch_store:{label:'Relojoaria',businessModel:'retail',keywords:['relojoaria','relogio','relogios','conserto de relogio','reparacao de relogio'],archetypes:['editorial-luxury','heritage-classic','professional-authority'],sections:['gallery','features','benefits','proof','lead','cta'],subject:'luxury wristwatch macro photography with dramatic light, precision and refined materials',storySubjects:['luxury watch macro detail','watch repair precision tools','elegant wristwatch lifestyle composition'],tone:['precisão','tradição','elegância']},
  optical:{label:'Ótica',businessModel:'retail',keywords:['otica','oculos','oculos de grau','oculos solar','armacao','lentes','exame de vista'],archetypes:['fashion-premium','clinical-clean','minimal-modern'],sections:['gallery','features','benefits','proof','lead','cta'],subject:'premium optical store fashion campaign with contemporary eyewear and clean lifestyle photography',storySubjects:['stylish eyewear lifestyle portrait','eyeglass frame macro detail','premium optical store interior'],tone:['estilo','confiança','cuidado visual']},
  general:{label:'Negócio / Marca',businessModel:'other',keywords:[],archetypes:['minimal-modern','professional-authority','organic-warm'],sections:['benefits','features','proof','lead','cta'],subject:'contemporary premium brand campaign with a versatile professional visual',storySubjects:['premium brand lifestyle scene','editorial detail with negative space','contemporary professional atmosphere'],tone:['clareza','identidade','resultado']},
});

export const VISUAL_ARCHETYPES=Object.freeze({
  'clinical-clean':{label:'Clínico clean',image:'clean premium healthcare photography, bright natural light, white and soft neutral surfaces, trustworthy and calm',hero:'hero-split-image'},
  'clinical-premium':{label:'Clínico premium',image:'premium healthcare editorial photography, soft architectural light, refined neutral materials, calm sophistication',hero:'hero-split-image'},
  'professional-authority':{label:'Autoridade profissional',image:'confident editorial professional photography, architectural composition, restrained premium palette, strong negative space',hero:'hero-editorial'},
  'organic-warm':{label:'Orgânico acolhedor',image:'warm organic editorial photography, natural textures, soft sunlight, human and welcoming atmosphere',hero:'hero-split-image'},
  'editorial-luxury':{label:'Editorial luxo',image:'luxury editorial photography, dramatic controlled light, refined materials, high-end magazine composition',hero:'hero-full-background'},
  'corporate-modern':{label:'Corporativo moderno',image:'modern corporate editorial photography, clean geometry, confident professional lighting, contemporary architecture',hero:'hero-split-image'},
  'sport-intense':{label:'Esporte intenso',image:'high-energy sports campaign, dramatic contrast, cinematic action lighting, dynamic composition, powerful movement',hero:'hero-full-background'},
  'bold-youth':{label:'Ousado vibrante',image:'bold contemporary campaign, dynamic color, energetic editorial composition, youthful visual language',hero:'hero-full-background'},
  'industrial-tech':{label:'Industrial tecnológico',image:'industrial technology campaign, precise engineering details, modern production environment, technical premium lighting',hero:'hero-split-image'},
  'industrial-color':{label:'Industrial cromático',image:'architectural coatings and color science campaign, premium surfaces, saturated controlled color, industrial precision',hero:'hero-full-background'},
  'retail-colorful':{label:'Varejo cromático',image:'colorful retail lifestyle photography, inviting home transformation, vivid but sophisticated palette, clear commercial composition',hero:'hero-split-image'},
  'fashion-premium':{label:'Fashion premium',image:'premium fashion editorial photography, sophisticated styling, clean composition, flattering natural light',hero:'hero-full-background'},
  'minimal-modern':{label:'Minimalista moderno',image:'minimal contemporary editorial photography, ample negative space, clean geometry, soft refined light',hero:'hero-split-image'},
  'heritage-classic':{label:'Clássico / tradição',image:'heritage editorial photography, timeless materials, craftsmanship, warm dramatic light, authentic premium atmosphere',hero:'hero-editorial'},
  'local-friendly':{label:'Local próximo',image:'friendly local business lifestyle photography, natural light, welcoming people and environment, approachable commercial composition',hero:'hero-split-image'},
  'digital-futuristic':{label:'Digital futurista',image:'futuristic digital campaign, elegant neon accents, dimensional light, clean high-tech composition, premium interface mood',hero:'hero-split-image'},
});

function scorePack(text,pack){
  const t=norm(text); const words=new Set(t.split(/[^a-z0-9]+/).filter(Boolean)); let score=0;
  for(const k of pack.keywords||[]){
    const key=norm(k);
    const hit=key.includes(' ')?t.includes(key):words.has(key);
    if(hit)score+=Math.max(2,key.split(/\s+/).length*2);
  }
  return score;
}
export function detectNicheFallback(briefing=''){
  let best='general',score=0;
  for(const [id,pack] of Object.entries(NICHE_PACKS)){
    if(id==='general')continue;
    const s=scorePack(briefing,pack);
    if(s>score){best=id;score=s;}
  }
  return best;
}
function explicitArchetype(briefing,pack){
  const t=norm(briefing);
  if(/premium|luxo|sofistic|elegant/.test(t))return pack.archetypes.find(x=>['editorial-luxury','fashion-premium','clinical-premium'].includes(x))||pack.archetypes[0];
  if(/acolhed|humano|calm|seren|natural|organico/.test(t))return pack.archetypes.find(x=>x==='organic-warm'||x==='local-friendly')||pack.archetypes[0];
  if(/clean|minimal|limp[oa]|leve/.test(t))return pack.archetypes.find(x=>['clinical-clean','minimal-modern'].includes(x))||pack.archetypes[0];
  if(/forte|impact|energia|agress|vibrant|performance/.test(t))return pack.archetypes.find(x=>['sport-intense','bold-youth','industrial-color'].includes(x))||pack.archetypes[0];
  if(/futur|tecnolog|digital|inov/.test(t))return pack.archetypes.find(x=>x==='digital-futuristic'||x==='industrial-tech')||pack.archetypes[0];
  return pack.archetypes[0];
}
function heroIntent(briefing,archetype){
  const t=norm(briefing);
  if(/desenho|ilustracao|ilustrad|illustration/.test(t))return {composition:'hero-illustration',mediaMode:'illustration'};
  if(/video|film|cinemat/.test(t))return {composition:'hero-video',mediaMode:'video'};
  if(/produto|embalagem|lata|oculos|relogio/.test(t))return {composition:'hero-product',mediaMode:'photography'};
  if(/foto|fotograf/.test(t))return {composition:VISUAL_ARCHETYPES[archetype]?.hero||'hero-split-image',mediaMode:'photography'};
  return {composition:VISUAL_ARCHETYPES[archetype]?.hero||'hero-split-image',mediaMode:'photography'};
}
function dimensions(slot){
  if(slot.startsWith('stories.'))return {width:864,height:1536,aspect:'9:16'};
  if(slot==='site.hero')return {width:1536,height:1024,aspect:'3:2'};
  if(slot.startsWith('ads.'))return {width:1200,height:1200,aspect:'1:1'};
  return {width:1200,height:1200,aspect:'1:1'};
}
function promptFor({pack,archetype,subject,slot,mode='photography',briefing='',facts={}}) {
  const style=VISUAL_ARCHETYPES[archetype]?.image||VISUAL_ARCHETYPES['minimal-modern'].image;
  const aspect=dimensions(slot).aspect;
  const medium=mode==='illustration'
    ? 'high-end editorial illustration, believable spatial depth, sophisticated commercial art direction'
    : 'high-end commercial photography, realistic materials, natural human proportions when people appear';
  const negative='No text, no typography, no logos, no watermark, no UI, no distorted hands, no duplicated objects, no malformed faces.';
  const explicit=Array.isArray(facts?.colors)&&facts.colors.length?` Mandatory brand colors: ${facts.colors.map(c=>`${c.name} ${c.hex}`).join(', ')}. Use these colors as the dominant visual palette and do not replace them with unrelated brand colors.`:'';
  return compact(`${medium}. ${subject}. ${style}.${explicit} Composition designed for ${slot.replaceAll('.',' ')}, ${aspect}, with intentional negative space for marketing copy. Brand context: ${compact(briefing,420)}. ${negative}`,1800);
}
function storyCopy(pack){
  const label=pack.label;
  return [
    {type:'presentation',headline:`Conheça ${label.toLowerCase()}`,cta:'Saiba mais'},
    {type:'authority',headline:'Detalhes que fazem diferença',cta:'Veja como funciona'},
    {type:'cta',headline:'Seu próximo passo começa aqui',cta:'Fale com a gente'},
  ];
}
function normalizeMaterials(materials){
  const allowed=new Set(['brand','site','instagram','stories','email','ads','manual']);
  const list=Array.isArray(materials)?materials:[];
  const out=list.map(x=>String(x||'').trim()).filter(x=>allowed.has(x));
  return out.length?[...new Set(out)]:['brand','site','instagram','stories','email','ads'];
}

export function buildCreativePlanFromSignals({projectId='',briefing='',materials=[],nicheId,archetype,heroComposition,mediaMode,decisions={},studioContext=null}={}){
  const context=studioContext||buildStudioContext({decisions,briefing});
  const facts=context?.briefingFacts||extractBriefingFacts(briefing);
  const contextNiche=decisions?.entender?.seg?.choice?context?.creative?.nicheId:null;
  const pickedNiche=NICHE_PACKS[nicheId]?nicheId:(contextNiche&&NICHE_PACKS[contextNiche])?contextNiche:detectNicheFallback(briefing);
  const pack=NICHE_PACKS[pickedNiche]||NICHE_PACKS.general;
  const hinted=decisions?.entender?.pers?.choice?context?.creative?.archetypeHint:null;
  const pickedArchetype=VISUAL_ARCHETYPES[archetype]?archetype:(VISUAL_ARCHETYPES[hinted]&&pack.archetypes.includes(hinted)?hinted:explicitArchetype(briefing,pack));
  const contextHero=decisions?.site?.hero?.choice?context?.creative?.heroComposition:null;
  const hero=heroComposition?{composition:heroComposition,mediaMode:mediaMode||'photography'}:contextHero?{composition:contextHero,mediaMode:mediaMode||'photography'}:heroIntent(briefing,pickedArchetype);
  const deliverables=normalizeMaterials(materials);
  const assets=[];
  const addAsset=(slot,subject,mode='photography')=>{
    const size=dimensions(slot);
    const request=context?.media?.requests?.find(r=>r?.target===slot);
    const requestedSubject=request?.instruction?`${subject}. Explicit user visual request: ${request.instruction}`:subject;
    const workerHint=slot==='site.hero'
      ?(mode==='illustration'?'image_style':'image_quality')
      :slot.startsWith('stories.')?'image_fast':'image_quality';
    const styleModel=mode==='illustration'?'ilustmix':null;
    assets.push({
      id:slot.replaceAll('.','-'),
      slot,
      kind:'image',
      role:slot.startsWith('stories.')?'story-background':slot==='site.hero'?'hero':'background',
      purpose:slot==='site.hero'?'hero':slot.startsWith('stories.')?'story-background':'campaign-background',
      mediaMode:mode,
      workerHint,
      styleModel,
      required:true,
      auto:true,
      status:'planned',
      prompt:promptFor({pack,archetype:pickedArchetype,subject:requestedSubject,slot,mode,briefing,facts}),
      negativePrompt:'text, typography, logo, watermark, distorted anatomy, duplicated objects',
      width:size.width,height:size.height,aspect:size.aspect,
      assetId:null,contentUrl:null,error:null,
    });
  };
  if(deliverables.includes('site'))addAsset('site.hero',pack.subject,hero.mediaMode==='video'?'photography':hero.mediaMode);
  const contextStories=Array.isArray(context?.social?.stories)?context.social.stories:[];
  const storyItems=storyCopy(pack).map((item,i)=>({...item,...(contextStories[i]||{}),composition:'story-photo-overlay',assetSlot:(contextStories[i]?.assetSlot||`stories.${String(i+1).padStart(2,'0')}`)}));
  if(deliverables.includes('stories')){
    storyItems.forEach((item,i)=>addAsset(item.assetSlot,pack.storySubjects[i]||pack.subject,'photography'));
  }
  if(deliverables.includes('ads')&&!deliverables.includes('site')&&!deliverables.includes('stories'))addAsset('ads.primary',pack.subject,'photography');
  const sections=[...new Set(Array.isArray(context?.site?.sections)&&context.site.sections.length?context.site.sections:pack.sections)];
  return {
    schema:1,
    projectId:String(projectId||''),
    generatedAt:new Date().toISOString(),
    status:'planned',
    business:{
      niche:pickedNiche,
      label:pack.label,
      businessModel:pack.businessModel,
      tone:pack.tone,
    },
    briefingFacts:facts,
    studioContext:context,
    brand:{
      archetype:pickedArchetype,
      archetypeLabel:VISUAL_ARCHETYPES[pickedArchetype]?.label||pickedArchetype,
      imageDirection:VISUAL_ARCHETYPES[pickedArchetype]?.image||'',
      explicitColors:facts.colors,
      palette:facts.palette,
    },
    deliverables,
    site:{
      family:pickedNiche,
      hero:{composition:hero.composition,mediaMode:hero.mediaMode,assetSlot:deliverables.includes('site')?'site.hero':null},
      sections,
    },
    stories:{
      compositionFamily:'campaign',
      items:storyItems,
    },
    ads:{
      composition:'campaign-adapted',
      reuseSlot:deliverables.includes('site')?'site.hero':deliverables.includes('stories')?'stories.01':'ads.primary',
    },
    assets,
    progress:{total:assets.length,ready:0,failed:0},
  };
}

const CREATIVE_QUESTIONS=Object.freeze({
  niche:{
    type:'choice',
    instructions:'Qual pack descreve melhor o negócio principal? Diferencie fabricante/indústria de loja/varejo e prefira a especialidade explícita.',
    criteria:Object.fromEntries(Object.entries(NICHE_PACKS).map(([id,p])=>[id,`${p.label} · modelo ${p.businessModel}`])),
  },
  archetype:{
    type:'choice',
    instructions:'Qual direção visual atende melhor ao posicionamento e às palavras explícitas do briefing?',
    criteria:Object.fromEntries(Object.entries(VISUAL_ARCHETYPES).map(([id,p])=>[id,p.label])),
  },
  hero:{
    type:'choice',
    instructions:'Qual composição de hero atende melhor ao pedido explícito e ao tipo de negócio?',
    criteria:{
      'hero-split-image':'Texto e imagem lado a lado',
      'hero-full-background':'Imagem em tela cheia com texto sobreposto',
      'hero-editorial':'Composição editorial com tipografia de impacto',
      'hero-illustration':'Ilustração/desenho como visual principal',
      'hero-product':'Produto como protagonista',
      'hero-video':'Vídeo/cena em movimento como fundo ou visual principal',
    },
  },
});

export async function planCreativeProject({projectId='',briefing='',materials=[],useJev=true,decisions={},brandName='',studioContext=null}={}){
  const context=studioContext||buildStudioContext({decisions,briefing,brandName});
  const fallbackNiche=NICHE_PACKS[context?.creative?.nicheId]?context.creative.nicheId:detectNicheFallback(briefing);
  const fallbackPack=NICHE_PACKS[fallbackNiche]||NICHE_PACKS.general;
  const contextArchetype=context?.creative?.archetypeHint;
  const baseArchetype=VISUAL_ARCHETYPES[contextArchetype]&&fallbackPack.archetypes.includes(contextArchetype)?contextArchetype:explicitArchetype(briefing,fallbackPack);
  const explicitHero=heroIntent(briefing,baseArchetype);
  const explicitMedia=/desenho|ilustracao|ilustrad|illustration|video|film|cinemat|produto|embalagem|lata|oculos|relogio/i.test(norm(briefing));
  let signals={
    nicheId:fallbackNiche,
    archetype:baseArchetype,
    heroComposition:explicitMedia?explicitHero.composition:(context?.creative?.heroComposition||explicitHero.composition),
    mediaMode:explicitMedia?explicitHero.mediaMode:'photography',
  };
  let trace=null;
  const hasCanonical=!!decisions?.entender?.seg?.choice&&!!decisions?.marca&&!!decisions?.site;
  if(hasCanonical){
    trace={model:null,canonical:true};
  }else if(useJev){
    try{
      const decided=await jevDecide({
        state:{
          briefing:compact(briefing,1800),
          regra:'Interprete o negócio e a intenção criativa. Respeite pedidos explícitos de ilustração, foto, produto, vídeo, estilo premium, clean, acolhedor, tecnológico ou intenso. Não force um nicho cadastrado quando nenhum for adequado: use general.',
        },
        questions:CREATIVE_QUESTIONS,
      });
      const niche=decided?.answers?.niche?.choice;
      const archetype=decided?.answers?.archetype?.choice;
      const hero=decided?.answers?.hero?.choice;
      if(NICHE_PACKS[niche])signals.nicheId=niche;
      if(VISUAL_ARCHETYPES[archetype])signals.archetype=archetype;
      if(hero)signals.heroComposition=hero;
      signals.mediaMode=hero==='hero-illustration'?'illustration':hero==='hero-video'?'video':'photography';
      trace={model:decided?.model||null,answers:decided?.answers||null};
    }catch{
      trace={model:null,fallback:true};
    }
  }
  const plan=buildCreativePlanFromSignals({projectId,briefing,materials,decisions,studioContext:context,...signals});
  const source=trace?.canonical?'canonical-decisions':trace?.fallback?'fallback':trace?'jev+rules':'rules';
  return {...plan,planner:{source,model:trace?.model||null}};
}
