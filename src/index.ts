import 'reflect-metadata';
import serverSetup from './setup/serverSetup';

import serverConfig from './config/serverConfig';
import setupConnection from './setup/typeorm';

const { PORT: port, HOST: host } = serverConfig;

(async () => {
  await setupConnection();

  const server = await serverSetup();
  server.listen(`${port}`);
  console.log(`Server started on ${host}:${port}`);
}
)();
