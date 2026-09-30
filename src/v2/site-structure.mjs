import { jevDecide } from '../ai/jev.mjs';

export const SITE_SECTION_LABELS=Object.freeze({
  hero:'Hero / topo',
  benefits:'Benefícios',
  proof:'Prova social',
  features:'Serviços / recursos',
  process:'Como funciona',
  gallery:'Galeria',
  pricing:'Planos / preços',
  faq:'Perguntas frequentes',
  lead:'Captura de lead',
  cta:'CTA final',
  footer:'Rodapé',
});

const QUESTIONS=Object.freeze({
  operation:{
    type:'choice',
    instructions:'O que a pessoa quer fazer com a estrutura do site?',
    criteria:{
      add:'Adicionar/criar uma nova seção que ainda não está visível',
      edit:'Editar, reforçar ou transformar uma seção existente',
      remove:'Remover/esconder uma seção',
      reorder:'Mudar a ordem/posição de uma seção',
      none:'Não é uma mudança estrutural do site',
    },
  },
  section:{
    type:'choice',
    instructions:'Qual seção do site é o alvo principal?',
    criteria:{
      hero:'Hero, topo, primeira dobra, banner principal',
      benefits:'Benefícios, vantagens, motivos para escolher',
      proof:'Prova social, depoimentos, avaliações, clientes',
      features:'Serviços, recursos, soluções, funcionalidades',
      process:'Como funciona, etapas, processo',
      gallery:'Galeria, portfólio, fotos, trabalhos',
      pricing:'Planos, preços, pacotes',
      faq:'FAQ, dúvidas, perguntas frequentes',
      lead:'Formulário, captura de lead, contato',
      cta:'CTA final, chamada final, faixa de conversão',
      footer:'Rodapé',
    },
  },
  hero_variant:{
    type:'choice',
    instructions:'Se o alvo for hero, qual composição atende melhor ao pedido? Se não houver preferência explícita, escolha a mais adequada ao briefing.',
    criteria:{
      split:'Texto à esquerda e visual à direita',
      centered:'Título centralizado com CTA e prova abaixo',
      mascot_right:'Texto à esquerda e mascote/visual de marca à direita',
      dashboard_right:'Texto à esquerda e mockup/dashboard à direita',
      editorial:'Composição editorial com título grande e hierarquia forte',
    },
  },
});

const choice=(a,fallback)=>a?.choice||fallback;
export async function routeSiteStructure({command,briefing,current={}}){
  const result=await jevDecide({
    state:{
      comando:String(command||'').slice(0,500),
      briefing:String(briefing||'').slice(0,1400),
      estrutura_atual:current,
      regra:'Interprete literalmente pedidos estruturais. "Cria um hero", "coloca FAQ", "adiciona benefícios" são ADD. "Muda o hero" é EDIT. Não transforme um pedido de cor/fonte em estrutura.',
    },
    questions:QUESTIONS,
  });
  const operation=choice(result.answers?.operation,'none');
  const section=choice(result.answers?.section,'hero');
  const heroVariant=choice(result.answers?.hero_variant,'split');
  return {operation,section,heroVariant,model:result.model||null,probabilities:{operation:result.answers?.operation?.probabilities||null,section:result.answers?.section?.probabilities||null}};
}
export function normalizeSiteStructure(value={}){
  const hero=value?.hero&&typeof value.hero==='object'?value.hero:{};
  const sections=Array.isArray(value?.sections)?value.sections:[];
  const valid=new Set(Object.keys(SITE_SECTION_LABELS).filter(x=>x!=='hero'));
  return {
    hero:{enabled:hero.enabled!==false,variant:['split','centered','mascot_right','dashboard_right','editorial'].includes(hero.variant)?hero.variant:'split'},
    sections:sections.map(s=>typeof s==='string'?s:s?.id).filter(id=>valid.has(id)).filter((id,i,a)=>a.indexOf(id)===i).slice(0,12),
  };
}
export function applySiteStructure(current,route){
  const next=normalizeSiteStructure(current);
  if(route.section==='hero'){
    if(route.operation==='remove')next.hero.enabled=false;
    else if(['add','edit'].includes(route.operation)){next.hero.enabled=true;next.hero.variant=route.heroVariant||next.hero.variant;}
    return next;
  }
  const id=route.section;
  if(route.operation==='add'&&!next.sections.includes(id))next.sections.push(id);
  if(route.operation==='remove')next.sections=next.sections.filter(x=>x!==id);
  if(route.operation==='edit'&&!next.sections.includes(id))next.sections.push(id);
  if(route.operation==='reorder'&&next.sections.includes(id)){next.sections=next.sections.filter(x=>x!==id);next.sections.unshift(id);}
  return next;
}
