/**
 * Sobe front (Vite) e servidor de tempo real (tsx server/index.ts)
 * juntos, com prefixo de cor no console. Ctrl+C encerra os dois.
 */
import { spawn } from 'child_process';

const isWin = process.platform === 'win32';

const procs = [];

function run(label, color, cmd, args) {
  const child = spawn(cmd, args, {
    shell: isWin,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const prefix = `\x1b[${color}m[${label}]\x1b[0m `;
  const pipe = (stream, out) => {
    let buf = '';
    stream.on('data', (chunk) => {
      buf += chunk.toString();
      const lines = buf.split(/\r?\n/);
      buf = lines.pop() ?? '';
      for (const line of lines) out.write(prefix + line + '\n');
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on('exit', (code) => {
    console.log(`${prefix}encerrado (code ${code})`);
    shutdown(code ?? 0);
  });

  procs.push(child);
  return child;
}

function shutdown(code) {
  for (const p of procs) {
    if (!p.killed) {
      try {
        p.kill();
      } catch {
        /* já morto */
      }
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Iniciando LavaJato Hub (API + Web)...\n');
run('api', '36', 'npx', ['tsx', 'server/index.ts']);
run('web', '35', 'npx', ['vite', '--port=3000', '--host=0.0.0.0']);

