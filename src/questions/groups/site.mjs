// Contrato Jev canônico — grupo site.
export const SITE = Object.freeze({
  "hero": {
    "type": "choice",
    "instructions": "Qual layout de topo (hero) da landing page combina com esse negócio e com o estilo que a pessoa pediu?",
    "criteria": {
      "split": "Texto à esquerda e ilustração grande à direita: clássico, claro, mostra o produto",
      "central": "Título enorme centralizado sobre fundo de cor forte: impacto, atitude, promoção",
      "cinema": "Tela cheia escura com arte dramática e texto por cima: noturno, rock, marcante",
      "editorial": "Estilo revista: título serifado grande, muito respiro, linhas finas: elegante e premium",
      "cartoes": "Título com cartões flutuantes de destaque (nota, prazo, preço): dinâmico e moderno",
      "minimal": "Minimalista: muito espaço vazio, título curto e um botão: clean, técnico, sério",
      "ludico": "Formas coloridas, bolhas e adesivos, cantos redondos: alegre, infantil, divertido",
      "formulario": "Título à esquerda e formulário de contato à direita: B2B, orçamentos, captar contatos",
      "mosaico": "Mosaico de blocos coloridos com produtos e selos: vitrine, loja, cardápio visual"
    }
  },
  "titulo": {
    "type": "choice",
    "instructions": "Qual título principal do site combina com o tom e a personalidade desse negócio?",
    "criteria": {
      "atitude": "“Sem frescura. Com muita atitude.” — Ousado, irreverente, rock, sem frescura",
      "volume": "“Aumenta o volume: chegou o que faltava.” — Barulhento e festivo, rock, noite, energia",
      "regras": "“Quebrando regras desde o primeiro dia.” — Rebelde e disruptivo, jovem",
      "detalhes": "“Os detalhes fazem toda a diferença.” — Elegante, premium, refinado",
      "lembrada": "“Uma experiência feita para ser lembrada.” — Sofisticado, ocasiões especiais, casais",
      "raro": "“Para quem aprecia o que é raro.” — Luxo, exclusividade, alto padrão",
      "casa": "“Feito com carinho, como em casa.” — Acolhedor, caseiro, familiar",
      "bairro": "“O cantinho favorito do bairro.” — De bairro, próximo, comunidade",
      "cuidado": "“Cuidado de verdade, do jeito que você merece.” — Atencioso e humano: saúde, beleza, serviços",
      "feliz": "“Bora deixar o seu dia mais feliz?” — Divertido, alegre, leve",
      "sorrir": "“Dá vontade de sorrir só de olhar.” — Fofo e colorido: doces, pets, crianças",
      "natureza": "“Do jeito que a natureza fez.” — Natural, orgânico, saudável",
      "leveza": "“Mais leveza para o seu dia a dia.” — Bem-estar, calma, equilíbrio",
      "confiar": "“Resultados em que você pode confiar.” — Técnico, sério, confiável, especialista",
      "especialistas": "“Especialistas no que realmente importa.” — Autoridade e experiência: B2B, saúde, serviços",
      "solucao": "“A solução certa, sem complicação.” — Direto e prático: serviços e empresas",
      "simples": "“Simples. Rápido. Do seu jeito.” — Moderno, prático, digital",
      "futuro": "“O futuro do seu negócio começa agora.” — Inovação, tecnologia, crescimento de empresas",
      "tradicao": "“Tradição que atravessa gerações.” — Tradicional, clássico, com história",
      "artesanal": "“Feito à mão, do jeito certo.” — Artesanal, capricho, feito à mão",
      "nivel": "“O seu próximo nível começa aqui.” — Motivador, esportivo, superação",
      "energia": "“Mais energia para o que importa.” — Energético, vitalidade, disposição",
      "delicadeza": "“Delicadeza em cada detalhe.” — Delicado, romântico, afetivo",
      "versao": "“A sua melhor versão, todos os dias.” — Autoestima, beleza, transformação pessoal",
      "brincando": "“Aprender brincando é muito mais divertido.” — Infantil e educativo, lúdico",
      "aventuras": "“Grandes aventuras para pequenos exploradores.” — Infantil, criativo, aventura",
      "transformacao": "“A transformação que você procurava.” — Resultado visível, antes e depois",
      "tempo": "“Ganhe tempo para o que realmente importa.” — Praticidade, economia de tempo",
      "vontade": "“Deu vontade? A gente resolve.” — Desejo e impulso: comida, delivery, compras",
      "saudade": "“Sabor que dá saudade.” — Comida memorável, gastronomia afetiva"
    }
  },
  "cta": {
    "type": "choice",
    "instructions": "Qual deve ser o botão principal (chamada para ação) do site desse negócio?",
    "criteria": {
      "pedir_whats": "“Pedir pelo WhatsApp” — Pedido direto pelo WhatsApp",
      "pedir_delivery": "“Pedir delivery” — Pedido por delivery ou aplicativo",
      "comprar": "“Comprar agora” — Compra imediata numa loja online",
      "agendar": "“Agendar horário” — Agendar um horário ou serviço",
      "avaliacao": "“Agendar avaliação gratuita” — Primeira consulta ou avaliação gratuita",
      "orcamento": "“Solicitar orçamento” — Pedido de orçamento: serviços, obras, projetos",
      "especialista": "“Falar com um especialista” — Conversa consultiva: empresas e serviços complexos",
      "reservar": "“Reservar mesa” — Reserva de mesa em restaurante ou bar",
      "aula": "“Agendar aula experimental” — Aula experimental grátis: escolas, academias, estúdios",
      "visitar": "“Como chegar” — Visita à loja ou ao espaço físico",
      "seguir": "“Seguir no Instagram” — Seguir a marca nas redes sociais",
      "material": "“Baixar material gratuito” — Material gratuito em troca do contato",
      "cardapio": "“Ver o cardápio” — Ver o cardápio ou o catálogo completo"
    }
  },
  "img": {
    "type": "choice",
    "instructions": "Qual estilo de ilustração combina com a marca e com o clima que a pessoa descreveu?",
    "criteria": {
      "flat": "Ilustração flat colorida, formas simples e sólidas",
      "linha": "Traço fino e elegante (line art), minimalista e sofisticado",
      "vidro": "Gradientes, brilho e vidro fosco: tecnológico e moderno",
      "geometrico": "Blocos geométricos de cor, estilo Bauhaus: marcante e organizado",
      "retro": "Retrô: raios de sol, retícula de pontos e selos vintage, rock e nostalgia",
      "organico": "Orgânico: folhas, curvas suaves e manchas, natural e calmo",
      "adesivo": "Adesivos e rabiscos divertidos espalhados: lúdico e jovem"
    }
  },
  "dens": {
    "type": "score",
    "instructions": "Quanta informação o site desse negócio deve mostrar?",
    "criteria": [
      "Muito respiro, pouquíssima informação, minimalista",
      "Arejado, só o essencial",
      "Equilibrado",
      "Bastante informação e seções",
      "Denso, cheio de ofertas e detalhes, estilo varejo"
    ]
  },
  "btn": {
    "type": "choice",
    "instructions": "Qual estilo de botão combina com a marca?",
    "criteria": {
      "pilula": "Pílula totalmente arredondada: amigável e moderno",
      "suave": "Cantos levemente arredondados: profissional e neutro",
      "reto": "Cantos retos: sério, editorial, sofisticado",
      "contorno": "Só o contorno, discreto e elegante",
      "bloco": "Bloco com sombra dura deslocada: retrô, brutalista, ousado",
      "gradiente": "Degradê brilhante: tecnológico e chamativo"
    }
  },
  "cantos": {
    "type": "choice",
    "instructions": "Quão arredondados devem ser os cartões e blocos do site?",
    "criteria": {
      "retos": "Cantos retos, blocos quadrados: sério, editorial, arquitetônico",
      "suaves": "Cantos levemente arredondados: equilibrado e profissional",
      "redondos": "Cantos bem arredondados: amigável, fofo, divertido"
    }
  },
  "textura": {
    "type": "choice",
    "instructions": "Qual textura de fundo combina com a marca?",
    "criteria": {
      "nenhuma": "Fundo liso, limpo",
      "grao": "Granulado de papel ou filme: artesanal, vintage, autoral",
      "pontos": "Pontilhado sutil: moderno, gráfico",
      "linhas": "Linhas finas de grade: técnico, arquitetônico, organizado"
    }
  },
  "sec_cardapio": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter um cardápio ou catálogo de produtos com preços (comida, loja, produtos)?"
  },
  "sec_servicos": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter uma lista de serviços ou tratamentos oferecidos?"
  },
  "sec_planos": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter planos, pacotes ou mensalidades com preços lado a lado?"
  },
  "sec_como_funciona": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter um passo a passo de como funciona o atendimento, em 3 etapas?"
  },
  "sec_agendamento": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter uma agenda online com horários disponíveis para marcar?"
  },
  "sec_delivery": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter uma seção de delivery: área de entrega, tempo e formas de pedir?"
  },
  "sec_depoimentos": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter depoimentos de clientes?"
  },
  "sec_antes_depois": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter um antes e depois de transformação visível (estética, cabelo, reforma, carro)?"
  },
  "sec_equipe": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter a apresentação da equipe ou dos profissionais?"
  },
  "sec_sobre": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter a história da marca / sobre nós?"
  },
  "sec_galeria": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter uma galeria de fotos do ambiente, dos produtos ou de trabalhos feitos?"
  },
  "sec_numeros": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter números e conquistas (clientes atendidos, anos, avaliação)?"
  },
  "sec_clientes": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter logos de empresas clientes (prova social B2B)?"
  },
  "sec_faq": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter perguntas frequentes?"
  },
  "sec_localizacao": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter endereço, mapa e horário de funcionamento de um local físico?"
  },
  "sec_lead": {
    "type": "noul",
    "instructions": "O site desse negócio deve ter um formulário para deixar o contato em troca de cupom ou material gratuito?"
  },
  "selo_nota": {
    "type": "noul",
    "instructions": "O topo do site desse negócio deve destacar a nota de avaliação dos clientes (estrelas)?"
  },
  "selo_prazo": {
    "type": "noul",
    "instructions": "O topo do site desse negócio deve destacar a rapidez: tempo de entrega ou de atendimento?"
  },
  "selo_tradicao": {
    "type": "noul",
    "instructions": "O topo do site desse negócio deve destacar há quanto tempo o negócio existe (“desde…”)?"
  },
  "selo_garantia": {
    "type": "noul",
    "instructions": "O topo do site desse negócio deve destacar uma garantia ou selo de segurança?"
  }
});
