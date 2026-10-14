/**
 * LavaJato Hub — servidor de tempo real (REST + SSE).
 *
 * Fonte de verdade dos dados compartilhados (agendamentos, notificações,
 * avaliações, usuários e prestadores). Os clientes (notebook/celular)
 * assinam /api/events e recebem o estado completo a cada mutação.
 *
 * Persistência: server/data.json (versionada — versão divergente => reseed,
 * garantindo partida limpa na apresentação).
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {INITIAL_PROVIDERS, INITIAL_REVIEWS, INITIAL_USERS} from '../src/mockData';
import type {
  Appointment,
  Provider,
  ProviderNotification,
  Review,
  User,
} from '../src/types';

const SERVER_DATA_VERSION = 1;
const PORT = Number(process.env.PORT || 3010);

interface AppState {
  users: User[];
  providers: Provider[];
  appointments: Appointment[];
  reviews: Review[];
  notifications: ProviderNotification[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

function seedState(): AppState {
  return {
    users: [...INITIAL_USERS],
    providers: [...INITIAL_PROVIDERS],
    appointments: [],
    reviews: [...INITIAL_REVIEWS],
    notifications: [
      {
        id: 'notif-welcome',
        providerId: 'prov-1',
        title: 'Sistema Conectado',
        message:
          'Bem-vindo ao LavaJato Hub. Notificações de novos agendamentos aparecerão aqui.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'new_booking',
      },
    ],
  };
}

function loadState(): AppState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as {
        version?: number;
        state?: AppState;
      };
      if (raw.version === SERVER_DATA_VERSION && raw.state) return raw.state;
    }
  } catch {
    /* arquivo corrompido → reseed */
  }
  return seedState();
}

let state: AppState = loadState();

function saveState(): void {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({version: SERVER_DATA_VERSION, state}, null, 2)
    );
  } catch (err) {
    console.error('[server] falha ao gravar data.json:', err);
  }
}

// ---------- SSE ----------
const sseClients = new Set<express.Response>();

function broadcast(): void {
  const payload = `data: ${JSON.stringify(state)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

/** Aplica mutação → persiste → broadcast para todos os conectados. */
function commit(mutate: (s: AppState) => void): void {
  mutate(state);
  saveState();
  broadcast();
}

// ---------- App Express ----------
const app = express();
app.use(express.json({limit: '1mb'}));

app.get('/api/state', (_req, res) => {
  res.json(state);
});

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.write(`data: ${JSON.stringify(state)}\n\n`);
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// Heartbeat para manter as conexões vivas
setInterval(() => {
  for (const res of sseClients) {
    try {
      res.write(': ping\n\n');
    } catch {
      sseClients.delete(res);
    }
  }
}, 25000);

// ----- Mutações -----

// Cliente cria agendamento + notificação do prestador
app.post('/api/appointments', (req, res) => {
  const {appointment, notification} = req.body as {
    appointment?: Appointment;
    notification?: ProviderNotification;
  };
  if (!appointment?.id) {
    res.status(400).json({error: 'appointment.id obrigatório'});
    return;
  }
  commit((s) => {
    if (!s.appointments.some((a) => a.id === appointment.id)) {
      s.appointments.unshift(appointment);
    }
    if (notification && !s.notifications.some((n) => n.id === notification.id)) {
      s.notifications.unshift(notification);
    }
  });
  res.json({ok: true});
});

// Prestador muda status (+ notificação dirigida ao cliente)
app.patch('/api/appointments/:id', (req, res) => {
  const {status, notification} = req.body as {
    status?: Appointment['status'];
    notification?: ProviderNotification;
  };
  if (!status || !state.appointments.some((a) => a.id === req.params.id)) {
    res.status(404).json({error: 'agendamento não encontrado'});
    return;
  }
  commit((s) => {
    const target = s.appointments.find((a) => a.id === req.params.id);
    if (target) target.status = status;
    if (notification && !s.notifications.some((n) => n.id === notification.id)) {
      s.notifications.unshift(notification);
    }
  });
  res.json({ok: true});
});

// Avaliação: review + hasReview + rating do prestador + notificação
app.post('/api/reviews', (req, res) => {
  const {review, appointmentId, providerId, notification} = req.body as {
    review?: Review;
    appointmentId?: string;
    providerId?: string;
    notification?: ProviderNotification;
  };
  if (!review?.id) {
    res.status(400).json({error: 'review.id obrigatório'});
    return;
  }
  commit((s) => {
    if (!s.reviews.some((r) => r.id === review.id)) s.reviews.unshift(review);
    if (appointmentId) {
      const apt = s.appointments.find((a) => a.id === appointmentId);
      if (apt) apt.hasReview = true;
    }
    if (providerId) {
      const prov = s.providers.find((p) => p.id === providerId);
      if (prov) {
        const all = s.reviews.filter((r) => r.providerId === providerId);
        const avg = all.reduce((sum, r) => sum + r.rating, 0) / (all.length || 1);
        prov.rating = Number(avg.toFixed(1));
        prov.totalReviews = all.length;
      }
    }
    if (notification && !s.notifications.some((n) => n.id === notification.id)) {
      s.notifications.unshift(notification);
    }
  });
  res.json({ok: true});
});

// Cadastro de usuário
app.post('/api/users', (req, res) => {
  const {user} = req.body as {user?: User};
  if (!user?.id) {
    res.status(400).json({error: 'user.id obrigatório'});
    return;
  }
  commit((s) => {
    if (!s.users.some((u) => u.id === user.id)) s.users.push(user);
  });
  res.json({ok: true});
});

// Cadastro / edição de prestador
app.post('/api/providers', (req, res) => {
  const {provider} = req.body as {provider?: Provider};
  if (!provider?.id) {
    res.status(400).json({error: 'provider.id obrigatório'});
    return;
  }
  commit((s) => {
    if (!s.providers.some((p) => p.id === provider.id)) s.providers.push(provider);
  });
  res.json({ok: true});
});

app.put('/api/providers/:id', (req, res) => {
  const {provider} = req.body as {provider?: Provider};
  if (!provider) {
    res.status(400).json({error: 'provider obrigatório'});
    return;
  }
  commit((s) => {
    const idx = s.providers.findIndex((p) => p.id === req.params.id);
    if (idx >= 0) s.providers[idx] = provider;
    else s.providers.push(provider);
  });
  res.json({ok: true});
});

// Leitura de notificações (ids pontuais ou escopo inteiro)
app.post('/api/notifications/read', (req, res) => {
  const {ids, all, providerId, clientUserId} = req.body as {
    ids?: string[];
    all?: boolean;
    providerId?: string;
    clientUserId?: string;
  };
  commit((s) => {
    for (const n of s.notifications) {
      if (ids && ids.includes(n.id)) n.read = true;
      else if (all && providerId && n.providerId === providerId && !n.clientUserId)
        n.read = true;
      else if (all && clientUserId && n.clientUserId === clientUserId) n.read = true;
    }
  });
  res.json({ok: true});
});

app.listen(PORT, () => {
  console.log(`[server] LavaJato Hub API em http://localhost:${PORT}`);
  console.log(`[server] dados: ${DATA_FILE}`);
});

