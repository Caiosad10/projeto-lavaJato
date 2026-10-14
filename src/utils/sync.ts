import type {
  Appointment,
  Provider,
  ProviderNotification,
  Review,
  User,
} from '../types';

/** Estado compartilhado mantido pelo servidor. */
export interface ServerState {
  users: User[];
  providers: Provider[];
  appointments: Appointment[];
  reviews: Review[];
  notifications: ProviderNotification[];
}

const API_BASE = '/api';

/** true enquanto o servidor de tempo real estiver acessível. */
let serverOnline = false;

export function isServerOnline(): boolean {
  return serverOnline;
}

/**
 * Carrega o estado inicial do servidor.
 * Retorna null se o servidor estiver fora do ar (modo offline/local).
 */
export async function fetchServerState(): Promise<ServerState | null> {
  try {
    const res = await fetch(`${API_BASE}/state`, {signal: AbortSignal.timeout(4000)});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const state = (await res.json()) as ServerState;
    serverOnline = true;
    return state;
  } catch {
    serverOnline = false;
    return null;
  }
}

/**
 * Assina o stream SSE. Chama onState a cada mutação feita por QUALQUER
 * dispositivo conectado. Retorna a função de unsubscribe.
 * Reconexão automática: o EventSource do navegador já reconecta sozinho.
 */
export function subscribeServerState(onState: (state: ServerState) => void): () => void {
  const es = new EventSource(`${API_BASE}/events`);

  es.onopen = () => {
    serverOnline = true;
  };
  es.onmessage = (ev) => {
    try {
      const state = JSON.parse(ev.data) as ServerState;
      serverOnline = true;
      onState(state);
    } catch {
      /* payload inválido — ignora */
    }
  };
  es.onerror = () => {
    // EventSource tenta reconectar; se persistir, considera offline
    serverOnline = false;
  };

  return () => es.close();
}

/** POST genérico com fallback silencioso (false = servidor indisponível). */
export async function pushState(
  path: string,
  body: unknown,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST'
): Promise<boolean> {
  if (!serverOnline) return false;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    serverOnline = false;
    return false;
  }
}
