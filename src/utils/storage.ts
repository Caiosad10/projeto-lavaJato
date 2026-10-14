/**
 * Chaves de persistência do app.
 *
 * `DATA_VERSION` incrementa quando a estrutura/semântica dos dados muda;
 * na primeira carga da versão nova, TODOS os dados antigos são apagados
 * (inclusive sessão), garantindo uma "partida limpa" sem restos de
 * demonstrações anteriores.
 */
const DATA_VERSION = 3;
const VERSION_KEY = 'lavajato_data_version';

const LEGACY_KEYS = [
  'lavajato_session',
  'lavajato_users',
  'lavajato_providers',
  'lavajato_appointments',
  'lavajato_reviews',
  'lavajato_notifications',
];

/** Remove dados de versões anteriores (roda antes do primeiro render). */
export function migrateStorage(): void {
  try {
    const current = localStorage.getItem(VERSION_KEY);
    if (current === String(DATA_VERSION)) return;

    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));

    // Qualquer outra chave lavajato_* também é lixo de versões antigas
    Object.keys(localStorage)
      .filter((key) => key.startsWith('lavajato_') && key !== VERSION_KEY)
      .forEach((key) => localStorage.removeItem(key));

    localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
  } catch {
    /* storage indisponível (modo privado) — ignora */
  }
}

/** Lê JSON do localStorage com fallback seguro. */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

