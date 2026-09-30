// Contrato Jev canônico — grupo entender.
export const ENTENDER = Object.freeze({
  "seg": {
    "type": "choice",
    "instructions": "Qual é o segmento do negócio que a pessoa está descrevendo?",
    "criteria": {
      "hamburgueria": "Hamburgueria ou lanchonete: hambúrguer artesanal, smash burger, lanches",
      "pizzaria": "Pizzaria: pizza no forno a lenha, rodízio ou delivery de pizza",
      "restaurante": "Restaurante ou bistrô: almoço, jantar, comida caseira ou cozinha autoral",
      "cafeteria": "Cafeteria ou padaria: café especial, pães, brunch, lanche da tarde",
      "confeitaria": "Confeitaria ou doceria: bolos, doces, brigadeiros, encomendas de festa",
      "saudavel": "Comida saudável: marmitas fitness, vegana, low carb, açaí, sucos naturais",
      "bar": "Bar, boteco ou cervejaria: chope, drinks, petiscos, happy hour, música ao vivo",
      "eventos": "Eventos e festas: buffet, decoração, casamentos, festas infantis, cerimonial",
      "hospedagem": "Pousada, hotel, hostel ou casa de temporada; turismo e passeios",
      "fotografia": "Fotógrafo ou videomaker: ensaios, casamentos, eventos, filmagem",
      "moda": "Loja de roupas, moda, calçados ou acessórios; boutique ou loja online",
      "estetica": "Clínica de estética: tratamentos faciais e corporais, harmonização, laser",
      "salao": "Salão de beleza: cabelo, coloração, escova, unhas, maquiagem, sobrancelha",
      "barbearia": "Barbearia: corte masculino, barba, navalha, visual masculino",
      "odontologia": "Dentista ou clínica odontológica: clareamento, implante, aparelho",
      "saude": "Clínica médica ou fisioterapia: consultas, exames, reabilitação",
      "psicologia": "Psicólogo ou terapeuta: terapia, saúde mental, atendimento online",
      "nutricao": "Nutricionista: dieta, emagrecimento, reeducação alimentar",
      "academia": "Academia, crossfit, personal trainer, treino funcional ou lutas",
      "bemestar": "Yoga, pilates, meditação, massagem ou spa: bem-estar e relaxamento",
      "pet": "Pet shop ou veterinária: banho e tosa, ração, cuidados com cães e gatos",
      "consultoria": "Consultoria para empresas (B2B): gestão, processos, vendas, estratégia",
      "contabilidade": "Contabilidade: impostos, abertura de empresa, MEI, folha de pagamento",
      "advocacia": "Advogado ou escritório de advocacia: trabalhista, família, empresarial",
      "marketing": "Agência de marketing digital, social media, design, tráfego pago",
      "tecnologia": "Tecnologia: software, aplicativos, sistemas, SaaS, suporte de TI",
      "idiomas": "Escola de idiomas: inglês ou espanhol para crianças, jovens e adultos",
      "cursos": "Cursos, mentorias ou infoprodutos; reforço escolar e preparatórios",
      "imobiliaria": "Imobiliária ou corretor: compra, venda e aluguel de imóveis",
      "arquitetura": "Arquitetura e design de interiores: projetos de casas e ambientes",
      "reformas": "Construção e reformas: pedreiro, pintura, elétrica, hidráulica, marcenaria",
      "oficina": "Oficina mecânica, auto center, funilaria ou estética automotiva",
      "outro": "Outro tipo de negócio, que não se encaixa em nenhuma opção acima"
    }
  },
  "pers": {
    "type": "choice",
    "instructions": "Qual personalidade de marca combina com o jeito que a pessoa descreveu o negócio e com o estilo que ela pediu?",
    "criteria": {
      "rebelde": "Rebelde e ousada: atitude, rock, irreverente, sem frescura",
      "sofisticada": "Sofisticada e elegante: premium, refinada, requintada, discreta",
      "acolhedora": "Acolhedora e familiar: calorosa, de bairro, próxima e carinhosa",
      "divertida": "Divertida e alegre: bem-humorada, colorida, leve e jovem",
      "natural": "Natural e consciente: saudável, orgânica, sustentável, calma",
      "especialista": "Especialista e confiável: técnica, séria, precisa, profissional",
      "moderna": "Moderna e minimalista: clean, contemporânea, digital, direta",
      "tradicional": "Tradicional e artesanal: clássica, com história, feita à mão",
      "energetica": "Energética e motivadora: intensa, esportiva, desafiadora",
      "delicada": "Delicada e romântica: suave, afetiva, sensível",
      "ludica": "Lúdica e infantil: fofa, criativa, feita para crianças"
    }
  },
  "pub": {
    "type": "choice",
    "instructions": "Qual é o público principal desse negócio?",
    "criteria": {
      "jovens": "Jovens e universitários, de 18 a 30 anos",
      "familias": "Famílias com filhos",
      "casais": "Casais: programa a dois, datas especiais",
      "mulheres": "Mulheres adultas que cuidam de si",
      "homens": "Homens adultos",
      "empresas": "Empresas, gestores e donos de negócio (B2B)",
      "criancas": "Crianças e os pais que decidem por elas",
      "tutores": "Tutores de cães e gatos",
      "premium": "Clientes de alta renda e exigentes",
      "maduros": "Pessoas maduras, 50+ e terceira idade",
      "geral": "Público geral do bairro, de todas as idades"
    }
  },
  "obj": {
    "type": "choice",
    "instructions": "Qual é o principal objetivo do site e das redes desse negócio?",
    "criteria": {
      "vender_online": "Vender pela internet: loja virtual, compra online",
      "delivery": "Receber pedidos de delivery pelo WhatsApp ou aplicativo",
      "agendar": "Fazer as pessoas agendarem horário, consulta ou aula",
      "orcamento": "Receber pedidos de orçamento",
      "leads": "Captar contatos interessados para vender depois",
      "visitar": "Levar pessoas a visitar a loja ou o espaço físico",
      "redes": "Ganhar seguidores e ficar conhecido nas redes sociais"
    }
  },
  "canal": {
    "type": "choice",
    "instructions": "Por qual canal esse negócio mais vende ou atende os clientes?",
    "criteria": {
      "whatsapp": "WhatsApp",
      "instagram": "Instagram e redes sociais",
      "site": "Site ou loja online",
      "apps": "Aplicativos de delivery",
      "telefone": "Telefone",
      "presencial": "Presencial: balcão, loja, consultório ou escritório",
      "linkedin": "LinkedIn ou e-mail, contato com empresas"
    }
  },
  "preco": {
    "type": "score",
    "instructions": "Qual é a faixa de preço percebida desse negócio?",
    "criteria": [
      "Popular: preço baixo, promoções, o mais barato da região",
      "Acessível: bom custo-benefício",
      "Médio: preço justo por boa qualidade",
      "Alto: premium, acima da média",
      "Luxo: exclusivo, alto padrão, sob medida"
    ]
  },
  "mat": {
    "type": "score",
    "instructions": "Há quanto tempo esse negócio existe?",
    "criteria": [
      "Ainda vai abrir ou está começando agora",
      "Aberto há pouco tempo, menos de um ano",
      "Alguns anos de mercado",
      "Consolidado, com muitos clientes fiéis",
      "Tradicional, com décadas de história"
    ]
  },
  "dif": {
    "type": "choice",
    "instructions": "Qual diferencial esse negócio deve destacar primeiro, pelo que a pessoa falou?",
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
  "oferta": {
    "type": "choice",
    "instructions": "Qual oferta de boas-vindas faz sentido para esse negócio (vale para site, carrosséis, e-mail e anúncios)?",
    "criteria": {
      "cupom10": "10% de desconto na primeira compra",
      "frete": "Entrega grátis no primeiro pedido",
      "avaliacao": "Primeira avaliação ou consulta gratuita",
      "aula": "Aula experimental grátis",
      "diagnostico": "Diagnóstico ou conversa gratuita de 30 minutos",
      "brinde": "Brinde ou mimo na primeira visita",
      "pacote": "Desconto ao fechar um pacote de sessões ou meses",
      "sobremesa": "Sobremesa ou bebida por conta da casa",
      "nenhuma": "Nenhuma oferta, só um bom atendimento"
    }
  },
  "emoji": {
    "type": "score",
    "instructions": "Quantos emojis a marca desse negócio deve usar nas legendas, e-mails e anúncios?",
    "criteria": [
      "Nenhum emoji: sóbrio e formal",
      "Poucos emojis, só um ou dois",
      "Emojis moderados",
      "Muitos emojis, bem descontraído"
    ]
  }
});
