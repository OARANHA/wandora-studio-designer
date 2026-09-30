// Contrato Jev canônico — grupo posts.
export const POSTS = Object.freeze({
  "car_estilo": {
    "type": "choice",
    "instructions": "Qual estilo visual a série de carrosséis de Instagram desse negócio deve ter, combinando com a marca e com o que a pessoa pediu?",
    "criteria": {
      "editorial": "Editorial de revista: serifa grande, fios finos, numeração elegante e muito respiro",
      "impacto": "Pôster de impacto: tipografia gigante, cor chapada, contraste forte e cortes ousados",
      "minimal": "Minimalista suíço: grade rígida, alinhado à esquerda, sem enfeites, só tipografia e cor",
      "colagem": "Colagem divertida: adesivos, formas recortadas, setas desenhadas à mão e leve rotação",
      "luxo": "Luxo discreto: fundo profundo ou creme, detalhes finos em dourado, letras bem espaçadas",
      "tech": "Dados e precisão: grade técnica, números grandes, gráficos e ícones de linha"
    }
  },
  "p1_fmt": {
    "type": "choice",
    "instructions": "Carrossel 1 de 3 no Instagram desse negócio (carrossel de apresentação, para atrair novos seguidores), com 6 lâminas. Qual formato de carrossel funciona melhor?",
    "criteria": {
      "manifesto": "Manifesto da marca: uma frase forte por lâmina, contando no que a marca acredita",
      "motivos": "Motivos para escolher a marca, um por lâmina, com número grande e prova no fim",
      "apresentacao": "Apresentação completa: quem somos, o que fazemos, como funciona e números",
      "historia": "A história da marca em linha do tempo: como começou, bastidores, equipe e hoje"
    }
  },
  "p1_hook": {
    "type": "choice",
    "instructions": "Carrossel 1 de 3 no Instagram desse negócio (carrossel de apresentação, para atrair novos seguidores), com 6 lâminas. Qual título de capa (gancho) faz o público desse negócio parar e arrastar?",
    "criteria": {
      "chegou": "“{nome} chegou{em_cidade}!” — Anuncia a chegada ou inauguração, com empolgação",
      "prazer": "“Muito prazer: {nome}.” — Apresentação simpática e direta da marca",
      "conheca": "“Conheça {nome} em 6 lâminas” — Convite para conhecer a marca inteira",
      "nao_e_so": "“Não é só {produto}. É experiência.” — Contraste provocativo: vai além do produto",
      "compromisso": "“Nosso compromisso: {ang}.” — Manifesto e compromisso da marca",
      "acreditamos": "“No que a gente acredita” — Manifesto: valores da marca, um por lâmina",
      "segredo": "“O segredo? {Ang}.” — Revela o diferencial e gera curiosidade",
      "motivos": "“3 motivos para escolher {nome}” — Lista de motivos, informativo e direto",
      "por_que": "“Por que tanta gente volta?” — Curiosidade: explica o que faz o cliente voltar",
      "comecou": "“Como tudo começou” — Storytelling: a origem da marca",
      "por_tras": "“Por trás de cada detalhe” — Mostra bastidores e processo",
      "feito_para": "“Feito {para_publico}.” — Fala direto com o público-alvo",
      "diferente": "“Aqui é diferente.” — Posicionamento ousado e curto"
    }
  },
  "p1_ang": {
    "type": "choice",
    "instructions": "Carrossel 1 de 3 no Instagram desse negócio (carrossel de apresentação, para atrair novos seguidores), com 6 lâminas. Qual diferencial esse carrossel deve destacar?",
    "criteria": {
      "qualidade": "Qualidade do produto ou serviço: ingredientes, materiais, capricho",
      "rapidez": "Rapidez: entrega ou atendimento ágil",
      "preco": "Preço justo, promoções, custo-benefício",
      "experiencia": "Experiência: ambiente, clima, vivência marcante",
      "exclusividade": "Exclusividade: sofisticação, algo único e autoral",
      "conveniencia": "Praticidade: fácil de pedir, comprar ou agendar",
      "confianca": "Confiança: credibilidade, avaliações, experiência comprovada",
      "resultado": "Resultado: a transformação ou o benefício que a pessoa sente",
      "comunidade": "Comunidade: relação próxima, pertencimento, bairro"
    }
  },
  "p1_bg": {
    "type": "choice",
    "instructions": "Carrossel 1 de 3 no Instagram desse negócio (carrossel de apresentação, para atrair novos seguidores), com 6 lâminas. Qual esquema de cores de fundo combina com a marca?",
    "criteria": {
      "solido": "Cor da marca chapada, forte e direta",
      "gradiente": "Degradê entre as cores da marca, vibrante",
      "escuro": "Fundo escuro e dramático, com destaque em cor",
      "claro": "Fundo claro de papel, editorial e limpo",
      "padrao": "Padrão repetido com o ícone da marca, divertido",
      "cena": "Ilustração grande do produto ocupando o post"
    }
  },
  "p1_item": {
    "type": "choice",
    "instructions": "Carrossel 1 de 3 no Instagram desse negócio (carrossel de apresentação, para atrair novos seguidores), com 6 lâminas. Qual produto ou serviço destacar?",
    "criteria": {
      "carro_chefe": "O produto ou serviço mais vendido, o carro-chefe",
      "premium": "O produto ou serviço premium, mais sofisticado",
      "entrada": "O produto ou serviço mais acessível, de entrada",
      "novidade": "A novidade, o lançamento"
    }
  },
  "p1_leg": {
    "type": "choice",
    "instructions": "Carrossel 1 de 3 no Instagram desse negócio (carrossel de apresentação, para atrair novos seguidores), com 6 lâminas. Qual estilo de legenda combina?",
    "criteria": {
      "curta": "Curta e direta, uma frase e a chamada",
      "historia": "Conta uma pequena história da marca",
      "lista": "Lista de benefícios com marcadores",
      "pergunta": "Termina com uma pergunta para gerar comentários",
      "urgencia": "Urgência e oferta por tempo limitado",
      "educativa": "Educativa, ensina algo útil"
    }
  },
  "p1_cta": {
    "type": "choice",
    "instructions": "Carrossel 1 de 3 no Instagram desse negócio (carrossel de apresentação, para atrair novos seguidores), com 6 lâminas. Qual chamada usar na última lâmina e no fim da legenda?",
    "criteria": {
      "bio": "“Link na bio” — Link na bio",
      "direct": "“Chama no direct” — Chamar no direct",
      "whats": "“Peça pelo WhatsApp” — Pedir ou falar pelo WhatsApp",
      "comenta": "“Comenta aqui” — Comentar no post",
      "salva": "“Salva pra não esquecer” — Salvar o post",
      "marca": "“Marca quem precisa ver” — Marcar amigos",
      "agenda": "“Agende pelo link da bio” — Agendar pelo link da bio"
    }
  },
  "p2_fmt": {
    "type": "choice",
    "instructions": "Carrossel 2 de 3 no Instagram desse negócio (carrossel de venda, para gerar pedidos, agendamentos ou orçamentos), com 6 lâminas. Qual formato de carrossel funciona melhor?",
    "criteria": {
      "vitrine": "Vitrine de produtos ou serviços: um por lâmina, com descrição e preço",
      "oferta": "Oferta com urgência: a promoção, o que está incluído, como aproveitar e o prazo",
      "passo_a_passo": "Como comprar, pedir ou agendar em 3 passos simples, com a chamada no fim",
      "comparativo": "O jeito comum × o nosso jeito, lado a lado, lâmina por lâmina"
    }
  },
  "p2_hook": {
    "type": "choice",
    "instructions": "Carrossel 2 de 3 no Instagram desse negócio (carrossel de venda, para gerar pedidos, agendamentos ou orçamentos), com 6 lâminas. Qual título de capa (gancho) faz o público desse negócio parar e arrastar?",
    "criteria": {
      "so_hoje": "“Só hoje: {oferta_curta}!” — Urgência: oferta que acaba hoje",
      "primeira": "“Primeira vez? Ganhe {oferta_curta}” — Oferta de boas-vindas para novos clientes",
      "ultima": "“Última chamada: {oferta_curta}” — Urgência forte, fim de promoção",
      "preco": "“{item} por {preco}” — Destaca o preço de um produto",
      "vontade": "“Deu vontade? Arrasta pro lado.” — Desejo e impulso: comida, delivery, produtos",
      "completo": "“Nosso {itens_lower}, lâmina por lâmina” — Mostra o catálogo ou cardápio completo",
      "vale": "“Vale cada centavo: {item}” — Custo-benefício de um item",
      "agenda": "“Agenda aberta para {mes}” — Anuncia horários disponíveis para agendar",
      "vagas": "“Últimas vagas da semana” — Escassez de horários ou vagas",
      "como": "“Como pedir em 3 passos” — Explica o caminho da compra ou do agendamento",
      "orcamento": "“Orçamento grátis em 24 horas” — Convida a pedir orçamento: serviços e empresas",
      "minutos": "“Seu pedido em minutos” — Rapidez na entrega ou no atendimento",
      "comum": "“O comum × o jeito {nome}” — Comparativo lado a lado com o jeito comum",
      "ganha": "“Tudo o que você ganha com {nome}” — Benefícios em comparação, para convencer"
    }
  },
  "p2_ang": {
    "type": "choice",
    "instructions": "Carrossel 2 de 3 no Instagram desse negócio (carrossel de venda, para gerar pedidos, agendamentos ou orçamentos), com 6 lâminas. Qual diferencial esse carrossel deve destacar?",
    "criteria": {
      "qualidade": "Qualidade do produto ou serviço: ingredientes, materiais, capricho",
      "rapidez": "Rapidez: entrega ou atendimento ágil",
      "preco": "Preço justo, promoções, custo-benefício",
      "experiencia": "Experiência: ambiente, clima, vivência marcante",
      "exclusividade": "Exclusividade: sofisticação, algo único e autoral",
      "conveniencia": "Praticidade: fácil de pedir, comprar ou agendar",
      "confianca": "Confiança: credibilidade, avaliações, experiência comprovada",
      "resultado": "Resultado: a transformação ou o benefício que a pessoa sente",
      "comunidade": "Comunidade: relação próxima, pertencimento, bairro"
    }
  },
  "p2_bg": {
    "type": "choice",
    "instructions": "Carrossel 2 de 3 no Instagram desse negócio (carrossel de venda, para gerar pedidos, agendamentos ou orçamentos), com 6 lâminas. Qual esquema de cores de fundo combina com a marca?",
    "criteria": {
      "solido": "Cor da marca chapada, forte e direta",
      "gradiente": "Degradê entre as cores da marca, vibrante",
      "escuro": "Fundo escuro e dramático, com destaque em cor",
      "claro": "Fundo claro de papel, editorial e limpo",
      "padrao": "Padrão repetido com o ícone da marca, divertido",
      "cena": "Ilustração grande do produto ocupando o post"
    }
  },
  "p2_item": {
    "type": "choice",
    "instructions": "Carrossel 2 de 3 no Instagram desse negócio (carrossel de venda, para gerar pedidos, agendamentos ou orçamentos), com 6 lâminas. Qual produto ou serviço destacar?",
    "criteria": {
      "carro_chefe": "O produto ou serviço mais vendido, o carro-chefe",
      "premium": "O produto ou serviço premium, mais sofisticado",
      "entrada": "O produto ou serviço mais acessível, de entrada",
      "novidade": "A novidade, o lançamento"
    }
  },
  "p2_leg": {
    "type": "choice",
    "instructions": "Carrossel 2 de 3 no Instagram desse negócio (carrossel de venda, para gerar pedidos, agendamentos ou orçamentos), com 6 lâminas. Qual estilo de legenda combina?",
    "criteria": {
      "curta": "Curta e direta, uma frase e a chamada",
      "historia": "Conta uma pequena história da marca",
      "lista": "Lista de benefícios com marcadores",
      "pergunta": "Termina com uma pergunta para gerar comentários",
      "urgencia": "Urgência e oferta por tempo limitado",
      "educativa": "Educativa, ensina algo útil"
    }
  },
  "p2_cta": {
    "type": "choice",
    "instructions": "Carrossel 2 de 3 no Instagram desse negócio (carrossel de venda, para gerar pedidos, agendamentos ou orçamentos), com 6 lâminas. Qual chamada usar na última lâmina e no fim da legenda?",
    "criteria": {
      "bio": "“Link na bio” — Link na bio",
      "direct": "“Chama no direct” — Chamar no direct",
      "whats": "“Peça pelo WhatsApp” — Pedir ou falar pelo WhatsApp",
      "comenta": "“Comenta aqui” — Comentar no post",
      "salva": "“Salva pra não esquecer” — Salvar o post",
      "marca": "“Marca quem precisa ver” — Marcar amigos",
      "agenda": "“Agende pelo link da bio” — Agendar pelo link da bio"
    }
  },
  "p3_fmt": {
    "type": "choice",
    "instructions": "Carrossel 3 de 3 no Instagram desse negócio (carrossel de relacionamento, para criar confiança, engajamento e salvamentos), com 6 lâminas. Qual formato de carrossel funciona melhor?",
    "criteria": {
      "perguntas": "Perguntas frequentes respondidas, uma por lâmina: tira dúvidas e objeções",
      "depoimentos": "Depoimentos de clientes com estrelas e nota média: prova social",
      "bastidores": "Bastidores: um dia na rotina, o processo e a equipe que faz acontecer",
      "antes_depois": "Antes e depois da transformação, com o resultado e um depoimento",
      "dica": "Conteúdo educativo para salvar: uma dica explicada em partes"
    }
  },
  "p3_hook": {
    "type": "choice",
    "instructions": "Carrossel 3 de 3 no Instagram desse negócio (carrossel de relacionamento, para criar confiança, engajamento e salvamentos), com 6 lâminas. Qual título de capa (gancho) faz o público desse negócio parar e arrastar?",
    "criteria": {
      "dizem": "“O que dizem sobre nós” — Depoimento de cliente, prova social",
      "volta": "“Quem conhece, volta.” — Prova social curta e confiante",
      "obrigado": "“{num_v} {num_r}. Obrigado!” — Gratidão com um número de conquista",
      "duvidas": "“Suas dúvidas, respondidas” — Perguntas frequentes, tira dúvidas",
      "mito": "“Mito ou verdade?” — Quebra mitos do segmento, educativo",
      "sabia": "“Você sabia?” — Curiosidade educativa",
      "dica": "“Dica rápida: {dica_t}” — Conteúdo útil: uma dica prática",
      "erro": "“O erro que quase todo mundo comete” — Alerta sobre um erro comum, educativo",
      "salve": "“Salve este post para depois” — Conteúdo para salvar, muito útil",
      "rotina": "“Um dia na nossa rotina” — Bastidores do dia a dia",
      "equipe": "“Quem faz acontecer” — Apresenta a equipe e humaniza a marca",
      "antes": "“Antes e depois” — Mostra a transformação",
      "transforma": "“A diferença que um detalhe faz” — Transformação com foco no detalhe"
    }
  },
  "p3_ang": {
    "type": "choice",
    "instructions": "Carrossel 3 de 3 no Instagram desse negócio (carrossel de relacionamento, para criar confiança, engajamento e salvamentos), com 6 lâminas. Qual diferencial esse carrossel deve destacar?",
    "criteria": {
      "qualidade": "Qualidade do produto ou serviço: ingredientes, materiais, capricho",
      "rapidez": "Rapidez: entrega ou atendimento ágil",
      "preco": "Preço justo, promoções, custo-benefício",
      "experiencia": "Experiência: ambiente, clima, vivência marcante",
      "exclusividade": "Exclusividade: sofisticação, algo único e autoral",
      "conveniencia": "Praticidade: fácil de pedir, comprar ou agendar",
      "confianca": "Confiança: credibilidade, avaliações, experiência comprovada",
      "resultado": "Resultado: a transformação ou o benefício que a pessoa sente",
      "comunidade": "Comunidade: relação próxima, pertencimento, bairro"
    }
  },
  "p3_bg": {
    "type": "choice",
    "instructions": "Carrossel 3 de 3 no Instagram desse negócio (carrossel de relacionamento, para criar confiança, engajamento e salvamentos), com 6 lâminas. Qual esquema de cores de fundo combina com a marca?",
    "criteria": {
      "solido": "Cor da marca chapada, forte e direta",
      "gradiente": "Degradê entre as cores da marca, vibrante",
      "escuro": "Fundo escuro e dramático, com destaque em cor",
      "claro": "Fundo claro de papel, editorial e limpo",
      "padrao": "Padrão repetido com o ícone da marca, divertido",
      "cena": "Ilustração grande do produto ocupando o post"
    }
  },
  "p3_item": {
    "type": "choice",
    "instructions": "Carrossel 3 de 3 no Instagram desse negócio (carrossel de relacionamento, para criar confiança, engajamento e salvamentos), com 6 lâminas. Qual produto ou serviço destacar?",
    "criteria": {
      "carro_chefe": "O produto ou serviço mais vendido, o carro-chefe",
      "premium": "O produto ou serviço premium, mais sofisticado",
      "entrada": "O produto ou serviço mais acessível, de entrada",
      "novidade": "A novidade, o lançamento"
    }
  },
  "p3_leg": {
    "type": "choice",
    "instructions": "Carrossel 3 de 3 no Instagram desse negócio (carrossel de relacionamento, para criar confiança, engajamento e salvamentos), com 6 lâminas. Qual estilo de legenda combina?",
    "criteria": {
      "curta": "Curta e direta, uma frase e a chamada",
      "historia": "Conta uma pequena história da marca",
      "lista": "Lista de benefícios com marcadores",
      "pergunta": "Termina com uma pergunta para gerar comentários",
      "urgencia": "Urgência e oferta por tempo limitado",
      "educativa": "Educativa, ensina algo útil"
    }
  },
  "p3_cta": {
    "type": "choice",
    "instructions": "Carrossel 3 de 3 no Instagram desse negócio (carrossel de relacionamento, para criar confiança, engajamento e salvamentos), com 6 lâminas. Qual chamada usar na última lâmina e no fim da legenda?",
    "criteria": {
      "bio": "“Link na bio” — Link na bio",
      "direct": "“Chama no direct” — Chamar no direct",
      "whats": "“Peça pelo WhatsApp” — Pedir ou falar pelo WhatsApp",
      "comenta": "“Comenta aqui” — Comentar no post",
      "salva": "“Salva pra não esquecer” — Salvar o post",
      "marca": "“Marca quem precisa ver” — Marcar amigos",
      "agenda": "“Agende pelo link da bio” — Agendar pelo link da bio"
    }
  }
});
