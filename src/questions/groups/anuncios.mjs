// Contrato Jev canônico — grupo anuncios.
export const ANUNCIOS = Object.freeze({
  "ad_conceito": {
    "type": "choice",
    "instructions": "Qual conceito de anúncio de display (banner em sites) funciona melhor para esse negócio agora?",
    "criteria": {
      "oferta": "Oferta ou desconto de primeira compra",
      "produto": "Um produto ou serviço em destaque, com preço",
      "marca": "Lembrança de marca: slogan e personalidade",
      "prova": "Prova social: nota, clientes atendidos, depoimento",
      "urgencia": "Urgência: últimas vagas, só hoje, últimas horas",
      "local": "Negócio local: perto de você, na sua cidade",
      "novidade": "Lançamento ou novidade"
    }
  },
  "ad_titulo": {
    "type": "choice",
    "instructions": "Qual título de anúncio chama mais a atenção do público desse negócio? Combine com o conceito mais adequado.",
    "criteria": {
      "oferta1": "“Na primeira vez: {oferta_curta}” — Oferta clara de primeira compra ou visita",
      "oferta2": "“Ganhe {oferta_curta} hoje” — Oferta com leve urgência",
      "produto1": "“{item0} por {preco0}” — Produto e preço, direto",
      "produto2": "“Deu vontade de {produto}?” — Desejo e impulso",
      "produto3": "“{Ang}.” — O diferencial em uma frase",
      "marca1": "“{slogan}” — O slogan da marca",
      "marca2": "“Não é só {produto}. É experiência.” — Contraste provocativo",
      "prova1": "“{num_v} {num_r}” — Número de conquista como prova",
      "prova2": "“Quem conhece, volta.” — Prova social curta",
      "urg1": "“Últimas vagas da semana” — Escassez de vagas ou horários",
      "urg2": "“Só hoje: {oferta_curta}” — Urgência de um dia",
      "local1": "“{Cat} pertinho de você{em_cidade}” — Proximidade, negócio de bairro",
      "novo1": "“Novidade: {item3}” — Anuncia o lançamento"
    }
  },
  "ad_estilo": {
    "type": "choice",
    "instructions": "Qual estilo visual os banners desse negócio devem ter?",
    "criteria": {
      "produto": "Ilustração grande do produto com sombra, preço em etiqueta: varejo, comida",
      "tipografico": "Só tipografia gigante e cor: moderno, ousado, serviços",
      "split": "Metade cor com o texto, metade ilustração: equilibrado, profissional",
      "cupom": "Cupom recortado com o código e a oferta: promoção",
      "premium": "Fundo profundo, brilho suave e detalhes finos: premium, noturno, luxo",
      "depoimento": "Cartão de depoimento com estrelas e nota: confiança"
    }
  },
  "ad_cta": {
    "type": "choice",
    "instructions": "Qual botão (chamada para ação) os banners desse negócio devem ter?",
    "criteria": {
      "peca": "“Peça agora” — Pedir agora (delivery, compra)",
      "agende": "“Agende já” — Agendar horário ou visita",
      "compre": "“Compre agora” — Comprar online",
      "desconto": "“Quero o desconto” — Resgatar a oferta",
      "saiba": "“Saiba mais” — Conhecer a marca ou o serviço",
      "fale": "“Fale com a gente” — Conversar, pedir orçamento",
      "ver": "“Ver {itens_lower}” — Ver cardápio, catálogo ou serviços"
    }
  },
  "ad_selo": {
    "type": "choice",
    "instructions": "Qual selo de destaque os banners desse negócio devem ter?",
    "criteria": {
      "frete": "Selo de entrega grátis",
      "nota": "Selo com a nota média dos clientes",
      "novo": "Selo de novidade",
      "hoje": "Selo de urgência “só hoje”",
      "garantia": "Selo de garantia ou satisfação",
      "nenhum": "Nenhum selo"
    }
  },
  "ad_fundo": {
    "type": "choice",
    "instructions": "Qual esquema de cores de fundo os banners desse negócio devem ter?",
    "criteria": {
      "solido": "Cor da marca chapada, forte e direta",
      "gradiente": "Degradê entre as cores da marca, vibrante",
      "escuro": "Fundo escuro e dramático, com destaque em cor",
      "claro": "Fundo claro de papel, editorial e limpo",
      "padrao": "Padrão repetido com o ícone da marca, divertido",
      "cena": "Ilustração grande do produto ocupando o post"
    }
  },
  "ad_anim": {
    "type": "choice",
    "instructions": "Qual animação os banners desse negócio devem ter?",
    "criteria": {
      "sequencia": "Três quadros em sequência: gancho, produto ou oferta, chamada",
      "revelar": "O título se revela palavra por palavra e o produto entra em cena",
      "pulso": "Peça estática com o botão pulsando de leve para chamar o clique",
      "estatico": "Peça estática, sem animação: sóbrio"
    }
  }
});
