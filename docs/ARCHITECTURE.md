# Arquitetura — Studio Designer Vigia

## Princípio

O produto separa três responsabilidades:

1. **Jev / TypeSafe** decide direção de arte com saídas tipadas (`choice`, `score`, `noul`).
2. **NVIDIA API Catalog** escreve copy a partir do briefing e das decisões já tomadas.
3. **Studio** transforma decisões em artefatos determinísticos, mantém projetos/versões e exporta materiais.

O navegador nunca recebe `JEV_API_KEY` nem `NVIDIA_API_KEY`.

## Produção

- Host: `designer-vigia.wandora.com.br`
- App: Node 22 ESM
- Reverse proxy/TLS: infraestrutura Wandora existente
- Jev: `POST https://api.typesafe.ai/v1/systemone`
- NVIDIA: `POST https://integrate.api.nvidia.com/v1/chat/completions`

## Guardrails de infraestrutura

O deploy deste repositório **não** pode reinstalar Docker, resetar UFW, substituir Traefik/Caddy global, alterar outros containers ou assumir uma VPS Hostinger limpa. O projeto deve encaixar na infraestrutura Wandora existente.

## Fases

- Gate 1: login + shell + TypeSafe/NVIDIA adapters.
- Gate 2: portar as 89 perguntas exatas e as bibliotecas de decisões.
- Gate 3: SSE com 6 grupos paralelos e renderização das cinco peças.
- Gate 4: comandos/ajustes/travas, Raio-X, outra versão e projetos.
- Gate 5: copy NVIDIA em streaming, exportações e e2e visual.
- Gate 6: deploy, smoke tests, métricas e hardening.
