import { createServer } from 'vite';

process.on('exit', (code) => {
  console.log(`[EXIT] Process exiting with code: ${code}`);
});

process.on('SIGINT', () => {
  console.log('[SIGNAL] SIGINT received');
});

process.on('SIGTERM', () => {
  console.log('[SIGNAL] SIGTERM received');
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandledRejection]', reason);
});

async function start() {
  const server = await createServer({
    server: {
      port: 5173,
      host: true,
    },
  });
  await server.listen();
  server.printUrls();

  setInterval(() => {
    // keep alive
  }, 10000);
}

start().catch((err) => {
  console.error('[startup error]', err);
  process.exit(1);
});
