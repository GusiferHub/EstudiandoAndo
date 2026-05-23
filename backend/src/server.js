import { config, validateConfig } from './config.js';
import { closeDb, initDb } from './db.js';
import { createApp } from './app.js';

validateConfig();
await initDb();

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`Study PDF backend listening on port ${config.port}`);
});

async function shutdown() {
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

