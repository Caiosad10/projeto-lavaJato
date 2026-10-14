# Project Memory — LavaJato Online

Última atualização: 2026-10-06

---

## Contexto acadêmico

- Disciplina de faculdade, **2º período**
- Conteúdo atual: HTML e CSS; JavaScript ainda por vir
- Objetivo do momento: validar ideia, debater com a equipe, ter base para protótipos
- Existem **dois protótipos**:
  1. **Alta fidelidade** — React + TypeScript + Vite + Tailwind (apresentação da ideia / fluxo operacional)
  2. **Baixa fidelidade** — HTML + CSS + JS básico (realista para o nível atual da turma)

---

## O que o sistema é

**LavaJato Online (LavaJato Hub)** — plataforma de:

- Agendamento online de lavagem de carros
- Cardápio de serviços
- Gestão para **lava-jatos (lojas)** e **lavadores autônomos**
- Cálculo de tempo total dos serviços
- Notificações ao prestador
- Avaliações pós-serviço

### Papéis

| Papel | O que faz |
|-------|-----------|
| **Cliente / visitante** | Busca prestadores, monta carrinho, agenda, paga (simulado), vê status, avalia |
| **Loja (establishment)** | Agenda, status, cardápio, equipe, notificações |
| **Autônomo** | Mesmo núcleo da loja, com perfil de atendimento móvel/domicílio |

---

## Decisões de produto (consolidadas)

### Alta fidelidade (`lavajato-online/`)

| Tema | Decisão |
|------|---------|
| Navegação anônima | Sim — visitante navega, filtra, abre prestador e monta carrinho |
| Login | **Obrigatório só no checkout** (finalizar/agendar/pagar) |
| Carrinho | **Multi-serviço** — soma preço e duração; reserva bloco na agenda |
| Wizard de booking | Mantido (premium, vários steps) — foco em apresentar a ideia |
| Pagamento | Teatro/simulado (PIX, cartão, dinheiro) — só para demonstrar fluxo |
| Toggle cliente ↔ prestador | **Removido** — não é mais modo teste rápido |
| Áreas após login | **Separadas por tipo de conta** (cliente vê vitrine; prestador vê só o próprio painel) |
| Design / features | Mantidos (visual dark, slots, reviews, notificações, portal) |

### Baixa fidelidade (`lavajato-baixa-fidelidade/`)

| Tema | Decisão |
|------|---------|
| Stack | HTML + CSS + JS puro, sem backend |
| Serviços por agendamento | **1 serviço** (combos = item único cadastrado pelo prestador) |
| Login | Só nome; usuários pré-configurados + novo cadastro (nome + tipo) |
| Horários | Lista fixa (sem cálculo de conflito) |
| Visual | Simples, sem cara de “feito por IA” |
| Objetivo | Explicar lógica e codar no nível da disciplina |

---

## Fluxos operacionais (alta fidelidade)

### Visitante / Cliente

```
Home / Busca (anônimo OK)
  → Detalhe do prestador + cardápio
  → Carrinho (1..N serviços)
  → Finalizar
       → [se não logado como cliente] AuthModal
       → BookingModal (wizard)
       → Appointment + notificação ao prestador
  → Meus agendamentos → (se concluído) Review
```

### Prestador

```
Cadastro como loja/autônomo OU login
  → ProviderPortal (só o próprio negócio)
       → Agenda + status
       → Serviços
       → Notificações
       → Equipe / horários (secundário)
```

---

## Usuários de exemplo

### Alta fidelidade

| Nome | Papel | Vínculo |
|------|-------|---------|
| Sérgio Filho | cliente | — |
| EcoWash | loja | prov-1 (EcoWash Detail Studio) |
| Carlos Autônomo | autonomo | prov-2 (Carlos Lavador Delivery) |

### Baixa fidelidade

| Nome | Tipo |
|------|------|
| Sergio Cliente | cliente |
| EcoWash | loja |
| Carlos Autonomo | autonomo |

---

## Estrutura de pastas

```
artifacts/
├── project_memory.md          ← este arquivo
├── lavajato-online/           ← alta fidelidade (React/TS/Vite)
│   ├── src/
│   │   ├── App.tsx            ← sessão, gate de checkout, shells por papel
│   │   ├── types.ts           ← User, Provider, Appointment, …
│   │   ├── mockData.ts        ← INITIAL_USERS, PROVIDERS, …
│   │   ├── utils/timeUtils.ts ← slots + conflito de agenda
│   │   └── components/
│   │       ├── AuthModal.tsx
│   │       ├── Header.tsx
│   │       ├── BottomNav.tsx
│   │       ├── CartDrawer.tsx
│   │       ├── BookingModal.tsx
│   │       ├── ProviderPortal.tsx
│   │       ├── EstablishmentCard.tsx
│   │       ├── EstablishmentDetailModal.tsx
│   │       ├── AppointmentsView.tsx
│   │       ├── ReviewModal.tsx
│   │       └── NotificationModal.tsx
│   └── package.json
│
└── lavajato-baixa-fidelidade/ ← baixa fidelidade (HTML/CSS/JS)
    ├── index.html
    ├── cliente-home.html
    ├── cliente-detalhe.html
    ├── cliente-agendar.html
    ├── cliente-agendamentos.html
    ├── prestador-painel.html
    ├── prestador-servicos.html
    ├── css/style.css
    ├── js/app.js
    └── README.md
```

---

## Modelo de dados (núcleo)

- **User**: id, name, phone?, role (`cliente` | `loja` | `autonomo`), providerId?
- **Provider**: id, name, type (`establishment` | `autonomous`), services[], professionals[], horários, userId?
- **ServiceItem**: id, name, price, durationMinutes, category
- **CartItem**: providerId + service (alta fidelidade: vários itens do mesmo prestador)
- **Appointment**: prestador, cliente, serviços[], duração total, preço total, data/hora, status, pagamento
- **Status**: `agendado` → `em_andamento` → `concluido` | `cancelado`
- **Review** / **ProviderNotification**

Persistência: `localStorage` (sem backend).

---

## O que foi propositalmente deixado de fora / para depois

- Backend real e autenticação com senha
- Gateway de pagamento de verdade
- Cálculo de capacidade paralela (vários boxes ao mesmo tempo)
- Buffer entre serviços
- Notificações push reais / WhatsApp
- Na baixa fidelidade: carrinho multi-serviço, slots dinâmicos, reviews, visual premium

---

## Como rodar

### Alta fidelidade

```bash
cd lavajato-online
npm install
npm run dev        # sobe API (3010) + web (3000) juntos
```

- Web: `http://localhost:3000/` — na rede: `http://<IP-da-máquina>:3000/`
- API tempo real: `http://localhost:3010` (SSE em `/api/events`)
- Só o front (sem tempo real): `npm run dev:web`
- Só a API: `npm run server`
- Para zerar tudo: pare o `npm run dev`, apague `server/data.json` e
  limpe o `localStorage` no navegador (`localStorage.clear()`)

### Baixa fidelidade

Abrir `lavajato-baixa-fidelidade/index.html` no navegador (ou Live Server).

Para zerar dados em qualquer um dos dois:

```js
localStorage.clear()
```

---

## Tempo real (mudança 2026-10-06)

- **Servidor**: `server/index.ts` (Express + SSE, porta 3010, dados em
  `server/data.json` versionado — versão divergente ⇒ reseed automático).
- **Proxy**: `vite.config.ts` encaminha `/api` → `localhost:3010`; o celular
  acessa o Vite pela rede e o proxy resolve o restante (mesmo Wi-Fi).
- **Cliente**: `src/utils/sync.ts` faz fetch do estado + assina SSE;
  `App.tsx` aplica o estado recebido e toca o chime quando chega notificação
  nova relevante para a sessão do aparelho (prestador: novo agendamento /
  avaliação; cliente: mudança de status — `type: 'status_update'` com
  `clientUserId`).
- **Fallback offline**: se a API não responder, o app continua funcionando
  só com `localStorage` (sem sync entre aparelhos).
- Mutações locais são otimistas (estado local atualiza na hora) e enviadas
  em seguida (`pushState`); o eco via SSE reaplica o estado do servidor.

### Cenário de demonstração (2 aparelhos, mesmo Wi-Fi)

1. Notebook: `npm run dev`; abrir `http://<IP>:3000/` → login "EcoWash" (loja).
2. Celular: abrir `http://<IP>:3000/` → login "Sérgio Filho" (cliente).
3. Celular: agendar serviço → **chime + sino no notebook**.
4. Notebook: iniciar/concluir lavagem → **chime + sino no celular**.
5. Histórico do celular acompanha o status ao vivo; avaliação atualiza nota
   do prestador em tempo real.

---

## Ajustes de UI mobile (mudança 2026-10-06)

- **Sem scroll horizontal**: todo `overflow-x-auto` foi removido
  (abas do detalhe, pills de categoria, filtros do histórico, sub-nav do
  portal) — agora usam `flex-wrap` e colunas `flex-1 min-w-0` que quebram
  linha em vez de rolar.
- **Wizard (BookingModal)**: barra de etapas redesenhada como números +
  conector flexível + label "Passo X de 4 · Nome" (cabe em 360px);
  rodapé com `flex-wrap`; overlays com `overflow-x-hidden`.
- **Pós-confirmação**: botão "Voltar ao Início" (`onSuccessClose`) fecha os
  modais e volta ao hub (`setActiveTab('home')`).

## Dados por usuário (mudança 2026-10-06)

- `src/utils/storage.ts` → `migrateStorage()` roda antes do render: na
  primeira carga da `DATA_VERSION` atual (3), apaga todas as chaves
  `lavajato_*` (sessão incluída) — partida limpa garantida.
- Agendamentos nascem vazios (`INITIAL_APPOINTMENTS` não é semeado).
- Histórico do cliente filtra **estritamente** por `clientUserId === session.id`;
  sem sessão de cliente → estado vazio com CTA "Entrar".
- `BookingModal` pré-preenche nome/telefone da sessão (sem "Sérgio Filho" fixo).
- Notificações do cliente = apenas as com `clientUserId === session.id`.

---

## Princípios para evoluções futuras

1. Alta fidelidade = **apresentar a ideia e o fluxo operacional completo**; não precisa ser implementável no 2º período.
2. Baixa fidelidade = **código e lógica explicáveis** pela equipe no nível atual.
3. Não misturar de novo “modo teste” (toggle livre de papel) na alta fidelidade.
4. Login continua opcional na navegação; obrigatório só para fechar pedido (cliente) ou operar painel (prestador).
5. Combos/promoções = serviço único no cardápio do prestador (especialmente na baixa fidelidade).
