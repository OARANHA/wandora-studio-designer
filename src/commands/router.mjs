import { QUESTION_GROUPS, QUESTION_META } from '../questions/catalog.mjs';

export const ROUTE_CONTEXT='Estúdio por voz: a pessoa fala e o app cria site, logo, carrosséis de Instagram, e-mail marketing (template e assinatura) e anúncios de display. Já existe uma versão criada. A pessoa pode continuar descrevendo o negócio ou mandar mudar uma peça.';

export const ROUTE_QUESTIONS=Object.freeze({
  tipo:{
    type:'choice',
    instructions:'O que a ÚLTIMA fala da pessoa é, em relação ao que já foi criado?',
    criteria:{
      descrever_negocio:'Descreve o negócio, o público, o clima, os produtos ou o que quer vender (informação nova para criar tudo)',
      comando_de_edicao:'Manda mudar algo específico no que já foi criado: logo, cores, fontes, slogan, site, carrosséis, e-mail, assinatura ou anúncios. Vale também um ajuste visual pontual: cor ou degradê do fundo (background), cor dos botões, caixa alta ou minúsculas, tamanho, negrito, itálico ou cor das letras',
      desfazer:'Pede para voltar a uma versão anterior ou desfazer a última mudança',
      fixar:'Diz que gostou de algo e quer manter como está',
      outra:'Conversa sem relação com a criação, ruído ou pedaço de frase sem sentido',
    },
  },
  alvo:{
    type:'choice',
    instructions:'Qual peça a última fala quer mudar, desfazer ou manter? Se não é sobre uma peça, escolha nenhum.',
    criteria:{
      logo:'O logo: símbolo, ícone, moldura, montagem, estilo ou o nome escrito no logo',
      cores:'A paleta de cores da marca: trocar as cores da marca por outra paleta ("troca as cores", "cores mais escuras"). Pedir uma cor só para o fundo ou para as letras não é trocar a paleta',
      fontes:'As fontes, a tipografia, as letras de tudo: trocar a fonte, caixa alta ou minúsculas, tamanho, negrito, itálico, espaço entre as letras ou a cor das letras',
      slogan:'O slogan ou a frase da marca',
      site:'O site: topo, título, botões, seções, fundo (background) da página, inclusive fundo de uma cor com letras de outra, ou o estilo visual do site',
      posts:'Os carrosséis (posts) do Instagram',
      email:'O e-mail marketing: o template, o assunto ou a assinatura de e-mail',
      anuncios:'Os anúncios de display, os banners',
      tudo:'Tudo ao mesmo tempo: refazer o estilo geral da marca inteira (ex.: "deixa tudo mais moderno"); ajuste de letras é fontes, de fundo é site',
      nenhum:'Não é sobre uma peça específica',
    },
  },
});

export const TARGETS=Object.freeze({
  logo:Object.freeze(['estilo','icone','forma','disp','caixa']),
  cores:Object.freeze(['paleta']),
  fontes:Object.freeze(['fonte']),
  slogan:Object.freeze(['slogan']),
  site:Object.freeze(['hero','titulo','cta','img','btn','cantos','textura']),
  posts:Object.freeze(['car_estilo','p1_fmt','p1_hook','p1_bg','p2_fmt','p2_hook','p2_bg','p3_fmt','p3_hook','p3_bg']),
  email:Object.freeze(['em_tipo','em_assunto','em_cabecalho','em_hero','em_cta','ass_layout','ass_banner']),
  anuncios:Object.freeze(['ad_conceito','ad_titulo','ad_estilo','ad_cta','ad_selo','ad_fundo','ad_anim']),
});

export const TARGET_LABELS=Object.freeze({
  logo:'logo',cores:'cores',fontes:'fontes',slogan:'slogan',site:'site',posts:'carrosséis',email:'e-mail',anuncios:'anúncios',tudo:'tudo',nenhum:'—',
});
export const TARGET_PANEL=Object.freeze({
  logo:'marca',cores:'marca',fontes:'marca',slogan:'marca',site:'site',posts:'posts',email:'email',anuncios:'anuncios',
});

export function routeState(text){
  return {contexto:ROUTE_CONTEXT,ultima_fala:String(text||'').trim().slice(0,400)};
}
export function commandQuestions(target,current={}){
  const out={};
  for(const id of TARGETS[target]||[]){
    const meta=QUESTION_META[id], group=meta?.group, original=group?QUESTION_GROUPS[group]?.[id]:null;
    if(!original||original.type!=='choice')continue;
    out[id]={
      type:'choice',
      instructions:`${original.instructions} Atenda ao COMANDO da pessoa. Se o comando não pede mudança nesta decisão, escolha manter.`,
      criteria:{
        manter:`Manter como está (hoje: ${String(current[id]??'?').slice(0,80)}): o comando não pede mudança nisto`,
        ...original.criteria,
      },
    };
  }
  return out;
}
export function commandState(description,command,current={}){
  const labels={};
  for(const [id,value] of Object.entries(current||{})){
    const meta=QUESTION_META[id];
    if(meta)labels[meta.label||id]=String(value).slice(0,80);
  }
  return {
    descricao_do_negocio:String(description||'(ainda sem descrição)').slice(0,1500),
    comando_da_pessoa:String(command||'').slice(0,400),
    escolhas_de_hoje:labels,
    contexto:'A pessoa já tem uma versão de site, logo, carrosséis, e-mail marketing e anúncios e agora pediu uma mudança por voz. Mude só o que o comando pede.',
  };
}
export function routeResult(answers){
  const tipo=answers?.tipo?.choice||'outra', alvo=answers?.alvo?.choice||'nenhum';
  const p_tipo=Number(answers?.tipo?.probabilities?.[tipo]??0);
  const p_alvo=Number(answers?.alvo?.probabilities?.[alvo]??0);
  return {tipo,alvo,p_tipo,p_alvo};
}
export function commandIsActionable(tipo,p=0){
  return ['comando_de_edicao','desfazer','fixar'].includes(tipo)&&Number(p)>=0.55;
}
