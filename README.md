# Wandora Studio Designer

Studio privado de criação assistida por IA da Wandora.

**Produção planejada:** `https://designer-vigia.wandora.com.br`

## Arquitetura

- **Jev / TypeSafe** decide direção e parâmetros criativos por perguntas tipadas.
- **NVIDIA API Catalog** gera e reescreve copy.
- **Studio** mantém estado, desenha as peças, versiona e exporta.
- O browser **nunca** recebe `JEV_API_KEY` ou `NVIDIA_API_KEY`.

O conceito original do Estúdio por Voz é preservado: cinco peças nascem em conjunto (site, identidade, carrosséis, e-mail e anúncios), com 89 decisões organizadas em 6 grupos. A implementação está sendo portada em gates para a infraestrutura Wandora.

## Docker

O serviço é isolado em Docker e fica publicado apenas no loopback do host. O reverse proxy/TLS já existente na Wandora deve encaminhar `designer-vigia.wandora.com.br` para a porta configurada em `STUDIO_HOST_PORT` (padrão `3210`).

```bash
cp .env.example .env
npm run hash-password -- 'troque-esta-senha'
# coloque o hash e um SESSION_SECRET forte no .env
docker compose up -d --build
```

O compose **não** instala Docker, não cria proxy, não altera firewall e não toca em outros containers.

## Desenvolvimento local

Requer Node.js 22+ e não possui dependências npm de runtime.

```bash
npm test
npm run dev
```

Credenciais locais padrão, somente fora de produção: `admin@wandora.local` / `wandora-dev-only`.

## Variáveis principais

Consulte `.env.example`. Em produção, no mínimo:

- `STUDIO_ADMIN_EMAIL`
- `STUDIO_ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `JEV_API_KEY`
- `NVIDIA_API_KEY`
- `NVIDIA_MODEL`

`NVIDIA_MODEL` é configurável para não acoplar o Studio a um único modelo.

## Estado da implementação

- [x] Gate 1 — login, sessão, shell visual, adaptador Jev, adaptador NVIDIA e Docker.
- [ ] Gate 2 — portar as 89 perguntas exatas e bibliotecas de decisão.
- [ ] Gate 3 — 6 grupos Jev em paralelo via SSE e cinco monitores vivos.
- [ ] Gate 4 — comandos, travas, ajustes livres, Raio-X, outra versão e projetos.
- [ ] Gate 5 — geração NVIDIA em streaming, exportações e E2E visual.
- [ ] Gate 6 — deploy, smoke tests, métricas e hardening.
