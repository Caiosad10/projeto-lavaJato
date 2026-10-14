<div align="center">

# 🚿 LavaJato Online — LavaJato Hub

**Protótipo de plataforma de agendamento de lavagem de carro para lava-jatos e lavadores autônomos**

*Projeto acadêmico — 2º período — protótipo de alta fidelidade*

</div>

---

## O que é o sistema

O **LavaJato Hub** é uma plataforma de agendamento online de lavagem de veículos que atende dois perfis:

- **Cliente**: busca estabelecimentos, monta um carrinho multi-serviço (o sistema soma preço e duração), agenda com um wizard de 4 etapas, "paga" (simulado), acompanha o status ao vivo e avalia após o serviço.
- **Prestador (loja ou autônomo)**: gerencia agenda, cardápio de serviços, equipe, notificações e atualiza o status de cada atendimento.

O protótipo roda **100% sem banco de dados real**: os dados compartilhados ficam num servidor leve em memória/arquivo local (`server/data.json`), a sessão fica no `localStorage` do navegador e o pagamento é simulado (teatro de demonstração).

## Arquitetura em 30 segundos

| Camada | Tecnologia | Papel |
|---|---|---|
| Front-end | React 19 + TypeScript + Vite + Tailwind 4 | Interface (visual dark, wizard, portal) |
| Tempo real | Express + **SSE** (`server/index.ts`, porta 3010) | Estado compartilhado entre aparelhos |
| Conexão | Proxy do Vite (`/api` → 3010) + `src/utils/sync.ts` | O celular acessa pelo mesmo endereço do notebook |
| Persistência | `localStorage` (sessão) + `server/data.json` (dados) | Sem banco externo |

> **Importante:** se a API não estiver no ar, o app funciona **mesmo assim**, 100% em modo local (`localStorage`) — só perde a sincronização entre aparelhos. Isso permite até publicar o `dist/` num Netlify estático sem quebrar.

## Pré-requisitos

- **Node.js 18+** (testado na v24) e npm
- Git

## Como rodar

```bash
# 1. Clonar
git clone https://github.com/Caiosad10/projeto-lavaJato.git
cd projeto-lavaJato

# 2. Instalar dependências
npm install

# 3. Subir API + web juntos
npm run dev
```

- **Web:** http://localhost:3000/
- **API de tempo real:** http://localhost:3010 (SSE em `/api/events`)

### Testar o tempo real (2 aparelhos, mesmo Wi-Fi)

1. Notebook: `npm run dev` → abra `http://<IP-da-máquina>:3000/` → entre como **EcoWash** (loja).
2. Celular: abra `http://<IP-da-máquina>:3000/` → entre como **Sérgio Filho** (cliente).
3. Celular agenda → **sino + notificação tocam no notebook**.
4. Notebook muda o status → **sino + notificação tocam no celular**, e o histórico do cliente atualiza ao vivo.

> Não é preciso configurar chave nenhuma (não existe `GEMINI_API_KEY` nem `.env`).

### Usuários de exemplo (login por nome, sem senha)

| Nome | Papel |
|---|---|
| Sérgio Filho | cliente |
| EcoWash | loja |
| Carlos Autônomo | autônomo |

Ou crie uma conta nova pelo próprio app (cadastro de cliente ou prestador).

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe **API (3010) + web (3000)** juntos |
| `npm run dev:web` | Só o front (sem tempo real) |
| `npm run server` | Só a API |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` localmente |
| `npm run lint` | Type-check (`tsc --noEmit`) |

## Estrutura de pastas

```
├── index.html
├── server/
│   ├── index.ts          # API Express + SSE (tempo real)
│   └── data.json         # Estado do servidor (gerado, não versionado)
├── scripts/
│   ├── dev.mjs           # Sobe API + web simultaneamente
│   └── test-sse.mjs      # Smoke test do broadcast SSE
└── src/
    ├── App.tsx           # Sessão, shells por papel, sync em tempo real
    ├── types.ts          # User, Provider, Appointment, Review...
    ├── mockData.ts       # Usuários/prestadores/avaliações de exemplo
    ├── utils/
    │   ├── sync.ts       # Fetch do estado + assinatura SSE + push
    │   ├── storage.ts    # Migração/zeragem do localStorage
    │   └── timeUtils.ts  # Slots de horário + conflito de agenda
    └── components/       # Header, wizard, portal, modais, etc.
```

## Zerar os dados

- **Navegador:** `localStorage.clear()` no console (F12).
- **Servidor:** pare o `npm run dev`, apague `server/data.json` (no próximo start ele é recriado do zero).

## Deploy estático (Netlify)

Para publicar sem backend (modo local, dados por navegador):

```bash
npm run build   # gera dist/ limpa a cada execução
```

Arraste a pasta `dist/` em [app.netlify.com/drop](https://app.netlify.com/drop), ou conecte o repositório com build command `npm run build` e publish directory `dist`. O tempo real (SSE) não roda no Netlify — o app cai automaticamente no modo local.

## Documentação do projeto

- [`project_memory.md`](project_memory.md) — contexto, decisões de produto e fluxos
- [`new_implement.md`](new_implement.md) — backlog de melhorias e pontos observados

## Contribuindo

1. Crie uma branch: `git checkout -b minha-feature`
2. Altere, rode `npm run lint` e `npm run build`
3. Commit: `git commit -m "feat: descrição"`
4. `git push` e abra um Pull Request

