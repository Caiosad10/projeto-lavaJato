/**
 * Teste de tempo real: cliente A assina o SSE, cliente B muta o estado,
 * e A deve receber o broadcast. Roda contra o proxy do Vite (:3000).
 */
const base = 'http://localhost:3000/api';

async function main() {
  const ctrl = new AbortController();
  const res = await fetch(`${base}/events`, {signal: ctrl.signal});
  console.log('SSE conectado, status:', res.status);

  let received = 0;
  const reader = res.body.getReader();
  const dec = new TextDecoder();

  const readLoop = (async () => {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      const txt = dec.decode(value);
      if (txt.includes('data:')) {
        received++;
        console.log(`Cliente A recebeu broadcast #${received} (${txt.length} bytes)`);
        if (received >= 2) {
          console.log('TESTE SSE OK — broadcast chega em tempo real');
          process.exit(0);
        }
      }
    }
  })();

  setTimeout(async () => {
    const r = await fetch(`${base}/appointments/apt-test-1`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status: 'em_andamento'}),
    });
    console.log('Cliente B alterou status:', r.status);
  }, 1500);

  setTimeout(() => {
    console.log(`TIMEOUT — received=${received}`);
    process.exit(1);
  }, 8000);

  await readLoop;
}

main().catch((e) => {
  console.log('ERRO', e.message);
  process.exit(1);
});
