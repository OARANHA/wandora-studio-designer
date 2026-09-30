// Catálogo das 89 decisões do Jev, preservado da especificação canônica.
import { ENTENDER } from './groups/entender.mjs';
import { SITE } from './groups/site.mjs';
import { MARCA } from './groups/marca.mjs';
import { POSTS } from './groups/posts.mjs';
import { EMAIL } from './groups/email.mjs';
import { ANUNCIOS } from './groups/anuncios.mjs';

export const QUESTION_GROUPS = Object.freeze({ entender: ENTENDER, site: SITE, marca: MARCA, posts: POSTS, email: EMAIL, anuncios: ANUNCIOS });

const GROUP_BASE = {
  "entender": {
    "label": "Entendimento",
    "icon": "🧠",
    "panel": null
  },
  "site": {
    "label": "Site",
    "icon": "🌐",
    "panel": "painel-site"
  },
  "marca": {
    "label": "Identidade visual",
    "icon": "🎨",
    "panel": "painel-marca"
  },
  "posts": {
    "label": "Carrosséis",
    "icon": "📸",
    "panel": "painel-posts"
  },
  "email": {
    "label": "E-mail marketing",
    "icon": "✉️",
    "panel": "painel-email"
  },
  "anuncios": {
    "label": "Anúncios",
    "icon": "📣",
    "panel": "painel-ads"
  }
};
export const GROUP_META = Object.freeze(Object.fromEntries(Object.entries(GROUP_BASE).map(([id, meta]) => [id, Object.freeze({ ...meta, count:Object.keys(QUESTION_GROUPS[id]).length })])));

export const QUESTION_META = Object.freeze({
  "seg": {
    "group": "entender",
    "label": "Segmento",
    "type": "choice"
  },
  "pers": {
    "group": "entender",
    "label": "Personalidade da marca",
    "type": "choice"
  },
  "pub": {
    "group": "entender",
    "label": "Público principal",
    "type": "choice"
  },
  "obj": {
    "group": "entender",
    "label": "Objetivo principal",
    "type": "choice"
  },
  "canal": {
    "group": "entender",
    "label": "Canal principal",
    "type": "choice"
  },
  "preco": {
    "group": "entender",
    "label": "Faixa de preço",
    "type": "score"
  },
  "mat": {
    "group": "entender",
    "label": "Tempo de mercado",
    "type": "score"
  },
  "dif": {
    "group": "entender",
    "label": "Diferencial em destaque",
    "type": "choice"
  },
  "oferta": {
    "group": "entender",
    "label": "Oferta de boas-vindas",
    "type": "choice"
  },
  "emoji": {
    "group": "entender",
    "label": "Emojis",
    "type": "score"
  },
  "hero": {
    "group": "site",
    "label": "Layout do topo",
    "type": "choice"
  },
  "titulo": {
    "group": "site",
    "label": "Título do site",
    "type": "choice"
  },
  "cta": {
    "group": "site",
    "label": "Botão principal",
    "type": "choice"
  },
  "img": {
    "group": "site",
    "label": "Estilo de ilustração",
    "type": "choice"
  },
  "dens": {
    "group": "site",
    "label": "Densidade",
    "type": "score"
  },
  "btn": {
    "group": "site",
    "label": "Estilo dos botões",
    "type": "choice"
  },
  "cantos": {
    "group": "site",
    "label": "Cantos dos blocos",
    "type": "choice"
  },
  "textura": {
    "group": "site",
    "label": "Textura de fundo",
    "type": "choice"
  },
  "paleta": {
    "group": "marca",
    "label": "Paleta de cores",
    "type": "choice"
  },
  "fonte": {
    "group": "marca",
    "label": "Par de fontes",
    "type": "choice"
  },
  "icone": {
    "group": "marca",
    "label": "Ícone do logo",
    "type": "choice"
  },
  "forma": {
    "group": "marca",
    "label": "Moldura do símbolo",
    "type": "choice"
  },
  "disp": {
    "group": "marca",
    "label": "Montagem do logo",
    "type": "choice"
  },
  "caixa": {
    "group": "marca",
    "label": "Caixa do nome",
    "type": "choice"
  },
  "estilo": {
    "group": "marca",
    "label": "Estilo do logo",
    "type": "choice"
  },
  "slogan": {
    "group": "marca",
    "label": "Slogan",
    "type": "choice"
  },
  "car_estilo": {
    "group": "posts",
    "label": "Estilo dos carrosséis",
    "type": "choice"
  },
  "p1_fmt": {
    "group": "posts",
    "label": "Carrossel 1 · formato",
    "type": "choice"
  },
  "p2_fmt": {
    "group": "posts",
    "label": "Carrossel 2 · formato",
    "type": "choice"
  },
  "p3_fmt": {
    "group": "posts",
    "label": "Carrossel 3 · formato",
    "type": "choice"
  },
  "p1_hook": {
    "group": "posts",
    "label": "Carrossel 1 · capa",
    "type": "choice"
  },
  "p2_hook": {
    "group": "posts",
    "label": "Carrossel 2 · capa",
    "type": "choice"
  },
  "p3_hook": {
    "group": "posts",
    "label": "Carrossel 3 · capa",
    "type": "choice"
  },
  "p1_bg": {
    "group": "posts",
    "label": "Carrossel 1 · cores",
    "type": "choice"
  },
  "p1_item": {
    "group": "posts",
    "label": "Carrossel 1 · item em destaque",
    "type": "choice"
  },
  "p1_leg": {
    "group": "posts",
    "label": "Carrossel 1 · legenda",
    "type": "choice"
  },
  "p1_cta": {
    "group": "posts",
    "label": "Carrossel 1 · chamada",
    "type": "choice"
  },
  "em_tipo": {
    "group": "email",
    "label": "E-mail · tipo",
    "type": "choice"
  },
  "em_assunto": {
    "group": "email",
    "label": "E-mail · assunto",
    "type": "choice"
  },
  "em_cabecalho": {
    "group": "email",
    "label": "E-mail · cabeçalho",
    "type": "choice"
  },
  "em_hero": {
    "group": "email",
    "label": "E-mail · destaque",
    "type": "choice"
  },
  "em_cta": {
    "group": "email",
    "label": "E-mail · botão",
    "type": "choice"
  },
  "ass_layout": {
    "group": "email",
    "label": "Assinatura · layout",
    "type": "choice"
  },
  "ass_banner": {
    "group": "email",
    "label": "Assinatura · banner",
    "type": "choice"
  },
  "ass_pessoa": {
    "group": "email",
    "label": "Assinatura · quem assina",
    "type": "choice"
  },
  "ad_conceito": {
    "group": "anuncios",
    "label": "Anúncio · conceito",
    "type": "choice"
  },
  "ad_titulo": {
    "group": "anuncios",
    "label": "Anúncio · título",
    "type": "choice"
  },
  "ad_estilo": {
    "group": "anuncios",
    "label": "Anúncio · estilo",
    "type": "choice"
  },
  "ad_cta": {
    "group": "anuncios",
    "label": "Anúncio · botão",
    "type": "choice"
  },
  "ad_selo": {
    "group": "anuncios",
    "label": "Anúncio · selo",
    "type": "choice"
  },
  "ad_anim": {
    "group": "anuncios",
    "label": "Anúncio · animação",
    "type": "choice"
  },
  "sec_cardapio": {
    "group": "site",
    "label": "Seção: Cardápio / catálogo",
    "type": "noul"
  },
  "sec_servicos": {
    "group": "site",
    "label": "Seção: Serviços",
    "type": "noul"
  },
  "sec_planos": {
    "group": "site",
    "label": "Seção: Planos e pacotes",
    "type": "noul"
  },
  "sec_como_funciona": {
    "group": "site",
    "label": "Seção: Como funciona",
    "type": "noul"
  },
  "sec_agendamento": {
    "group": "site",
    "label": "Seção: Agenda online",
    "type": "noul"
  },
  "sec_delivery": {
    "group": "site",
    "label": "Seção: Delivery",
    "type": "noul"
  },
  "sec_depoimentos": {
    "group": "site",
    "label": "Seção: Depoimentos",
    "type": "noul"
  },
  "sec_antes_depois": {
    "group": "site",
    "label": "Seção: Antes e depois",
    "type": "noul"
  },
  "sec_equipe": {
    "group": "site",
    "label": "Seção: Equipe",
    "type": "noul"
  },
  "sec_sobre": {
    "group": "site",
    "label": "Seção: Nossa história",
    "type": "noul"
  },
  "sec_galeria": {
    "group": "site",
    "label": "Seção: Galeria",
    "type": "noul"
  },
  "sec_numeros": {
    "group": "site",
    "label": "Seção: Números",
    "type": "noul"
  },
  "sec_clientes": {
    "group": "site",
    "label": "Seção: Logos de clientes",
    "type": "noul"
  },
  "sec_faq": {
    "group": "site",
    "label": "Seção: Perguntas frequentes",
    "type": "noul"
  },
  "sec_localizacao": {
    "group": "site",
    "label": "Seção: Endereço e mapa",
    "type": "noul"
  },
  "sec_lead": {
    "group": "site",
    "label": "Seção: Captura de contato",
    "type": "noul"
  },
  "selo_nota": {
    "group": "site",
    "label": "Selo no topo: Nota ⭐",
    "type": "noul"
  },
  "selo_prazo": {
    "group": "site",
    "label": "Selo no topo: Prazo",
    "type": "noul"
  },
  "selo_tradicao": {
    "group": "site",
    "label": "Selo no topo: Tempo de casa",
    "type": "noul"
  },
  "selo_garantia": {
    "group": "site",
    "label": "Selo no topo: Garantia",
    "type": "noul"
  },
  "em_b_produtos": {
    "group": "email",
    "label": "E-mail · bloco: Grade de produtos",
    "type": "noul"
  },
  "em_b_depoimento": {
    "group": "email",
    "label": "E-mail · bloco: Depoimento",
    "type": "noul"
  },
  "em_b_passos": {
    "group": "email",
    "label": "E-mail · bloco: Como funciona",
    "type": "noul"
  },
  "em_b_dica": {
    "group": "email",
    "label": "E-mail · bloco: Dica útil",
    "type": "noul"
  },
  "em_b_numeros": {
    "group": "email",
    "label": "E-mail · bloco: Números",
    "type": "noul"
  },
  "em_b_prazo": {
    "group": "email",
    "label": "E-mail · bloco: Prazo da oferta",
    "type": "noul"
  },
  "p1_ang": {
    "group": "posts",
    "label": "Carrossel 1 · diferencial",
    "type": "choice"
  },
  "p2_ang": {
    "group": "posts",
    "label": "Carrossel 2 · diferencial",
    "type": "choice"
  },
  "p3_ang": {
    "group": "posts",
    "label": "Carrossel 3 · diferencial",
    "type": "choice"
  },
  "p2_bg": {
    "group": "posts",
    "label": "Carrossel 2 · cores",
    "type": "choice"
  },
  "p3_bg": {
    "group": "posts",
    "label": "Carrossel 3 · cores",
    "type": "choice"
  },
  "p2_item": {
    "group": "posts",
    "label": "Carrossel 2 · item em destaque",
    "type": "choice"
  },
  "p3_item": {
    "group": "posts",
    "label": "Carrossel 3 · item em destaque",
    "type": "choice"
  },
  "p2_leg": {
    "group": "posts",
    "label": "Carrossel 2 · legenda",
    "type": "choice"
  },
  "p3_leg": {
    "group": "posts",
    "label": "Carrossel 3 · legenda",
    "type": "choice"
  },
  "p2_cta": {
    "group": "posts",
    "label": "Carrossel 2 · chamada",
    "type": "choice"
  },
  "p3_cta": {
    "group": "posts",
    "label": "Carrossel 3 · chamada",
    "type": "choice"
  },
  "ad_fundo": {
    "group": "anuncios",
    "label": "Anúncio · cores",
    "type": "choice"
  }
});
export const FREE_VARIATION_IDS = Object.freeze(Object.entries(QUESTION_GROUPS).flatMap(([group, questions]) => group === 'entender' ? [] : Object.entries(questions).filter(([,q]) => q.type === 'choice').map(([id]) => id)));
export const QUESTION_TOTAL = Object.values(QUESTION_GROUPS).reduce((n, group) => n + Object.keys(group).length, 0);

export function questionContract() {
  const groups = Object.fromEntries(Object.entries(QUESTION_GROUPS).map(([id, questions]) => [id, Object.keys(questions).length]));
  const types = { choice:0, score:0, noul:0 };
  for (const questions of Object.values(QUESTION_GROUPS)) for (const q of Object.values(questions)) types[q.type] += 1;
  return { groups, types, total:QUESTION_TOTAL, free:FREE_VARIATION_IDS.length };
}
