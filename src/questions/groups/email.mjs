// Contrato Jev canônico — grupo email.
export const EMAIL = Object.freeze({
  "em_tipo": {
    "type": "choice",
    "instructions": "Qual e-mail marketing esse negócio deve mandar primeiro para a lista de clientes?",
    "criteria": {
      "boas_vindas": "Boas-vindas para quem acabou de entrar na lista, com a oferta de primeira compra",
      "newsletter": "Newsletter mensal com novidades, destaques, dica e bastidores",
      "promocao": "E-mail de promoção: a oferta, os itens e o prazo, com urgência",
      "lancamento": "Lançamento de um produto ou serviço novo, em primeira mão",
      "reengajamento": "Reengajamento: “sentimos sua falta”, para clientes que sumiram"
    }
  },
  "em_assunto": {
    "type": "choice",
    "instructions": "Qual linha de assunto faz o cliente desse negócio abrir o e-mail? Combine com o tipo de e-mail mais adequado.",
    "criteria": {
      "presente": "“{nome}: seu presente de boas-vindas {e1:🎁}” — Boas-vindas com presente, caloroso",
      "primeiro": "“Na primeira vez, você ganha {oferta_curta}” — Oferta direta de primeira compra ou visita",
      "feliz": "“Que bom ter você por aqui {e1:💛}” — Boas-vindas afetuosa, sem oferta",
      "mes": "“O que rolou em {mes} por aqui {e1:✨}” — Newsletter leve e próxima",
      "bastidores": "“Bastidores, dica e novidades de {mes}” — Newsletter completa e informativa",
      "dica": "“{dica_t} (e mais novidades)” — Newsletter puxada por conteúdo útil",
      "so_hoje": "“Só hoje: {oferta_curta} {e1:⏰}” — Promoção com urgência de um dia",
      "ultimas": "“Últimas horas para garantir {oferta_curta}” — Urgência forte, fim de promoção",
      "item": "“{item0} por {preco0}. Só esta semana.” — Promoção de um item com preço",
      "chegou": "“Chegou: {item3} {e1:🚀}” — Lançamento direto e empolgado",
      "primeira_mao": "“Em primeira mão para você: {item3}” — Lançamento exclusivo para a lista",
      "saudade": "“Faz tempo que você não aparece {e1:🥺}” — Reengajamento carinhoso",
      "volta": "“Volta pra gente? Tem {oferta_curta} te esperando” — Reengajamento com oferta"
    }
  },
  "em_cabecalho": {
    "type": "choice",
    "instructions": "Qual cabeçalho de e-mail combina com a marca desse negócio?",
    "criteria": {
      "faixa": "Logo centralizado numa faixa com a cor da marca: forte e reconhecível",
      "menu": "Logo à esquerda e links à direita, como um site: organizado, varejo",
      "central": "Logo grande centralizado sobre fundo claro: elegante, editorial",
      "fino": "Barra fina e discreta com o símbolo e o nome: minimalista, pessoal"
    }
  },
  "em_hero": {
    "type": "choice",
    "instructions": "Qual bloco de destaque (topo) o e-mail desse negócio deve ter?",
    "criteria": {
      "ilustracao": "Ilustração grande do produto com título e botão: vitrine calorosa",
      "tipografico": "Só tipografia: um título enorme, uma frase e o botão: moderno e direto",
      "cupom": "Cupom recortado com o código e a oferta em destaque: promoção",
      "produto": "Um produto em cartão, com descrição e preço: lançamento ou vitrine",
      "carta": "Carta curta assinada por uma pessoa da equipe: próximo e humano"
    }
  },
  "em_cta": {
    "type": "choice",
    "instructions": "Qual botão principal o e-mail desse negócio deve ter?",
    "criteria": {
      "pedido": "“Fazer meu pedido” — Fazer um pedido ou compra",
      "agendar": "“Agendar meu horário” — Agendar horário, consulta, aula ou visita",
      "desconto": "“Quero meu desconto” — Resgatar a oferta ou o cupom",
      "catalogo": "“Ver {itens_lower}” — Ver o cardápio, catálogo ou serviços",
      "conversar": "“Falar com a equipe” — Conversar com a equipe, tirar dúvidas ou pedir orçamento",
      "conhecer": "“Conhecer as novidades” — Conhecer as novidades ou o lançamento"
    }
  },
  "em_b_produtos": {
    "type": "noul",
    "instructions": "O e-mail desse negócio deve ter uma grade com produtos ou serviços e preços?"
  },
  "em_b_depoimento": {
    "type": "noul",
    "instructions": "O e-mail desse negócio deve ter um depoimento de cliente com estrelas?"
  },
  "em_b_passos": {
    "type": "noul",
    "instructions": "O e-mail desse negócio deve ter uma faixa com os 3 passos de como comprar, pedir ou agendar?"
  },
  "em_b_dica": {
    "type": "noul",
    "instructions": "O e-mail desse negócio deve ter um bloco de conteúdo com uma dica útil?"
  },
  "em_b_numeros": {
    "type": "noul",
    "instructions": "O e-mail desse negócio deve ter uma faixa com números de prova (clientes, nota, prazo)?"
  },
  "em_b_prazo": {
    "type": "noul",
    "instructions": "O e-mail desse negócio deve ter um aviso de prazo da oferta, com contagem regressiva?"
  },
  "ass_layout": {
    "type": "choice",
    "instructions": "Qual layout de assinatura de e-mail (para os e-mails pessoais do dono e da equipe) combina com a marca desse negócio?",
    "criteria": {
      "classica": "Clássica: símbolo à esquerda, fio vertical e os dados à direita: profissional, versátil",
      "empilhada": "Empilhada: logo em cima, nome e contatos embaixo, centralizados: marca em destaque",
      "banner": "Dados à esquerda e um banner promocional embaixo: varejo, promoções, eventos",
      "minimal": "Minimalista: só texto, nome na cor da marca e contatos numa linha: discreta, premium",
      "cartao": "Cartão com fundo suave, borda e o monograma: acolhedora, criativa"
    }
  },
  "ass_banner": {
    "type": "choice",
    "instructions": "O que o pequeno banner da assinatura de e-mail desse negócio deve mostrar?",
    "criteria": {
      "oferta": "Banner da assinatura com a oferta de boas-vindas",
      "slogan": "Banner da assinatura com o slogan da marca",
      "avaliacao": "Banner da assinatura com a nota e o número de clientes (prova social)",
      "agenda": "Banner da assinatura com um convite para agendar ou pedir",
      "nenhum": "Banner da assinatura com nenhum banner: só os dados"
    }
  },
  "ass_pessoa": {
    "type": "choice",
    "instructions": "Quem assina os e-mails pessoais desse negócio?",
    "criteria": {
      "lider": "Quem lidera o negócio: dono, fundador, responsável técnico ou chef",
      "atendimento": "A pessoa do atendimento ou do comercial, que fala com os clientes",
      "equipe": "A equipe como um todo, sem o nome de uma pessoa"
    }
  }
});
