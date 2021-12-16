import 'reflect-metadata';
import setupConnection from '../../setup/typeorm';
import SensorsServer from './serverClass';
import serverConfig from '../../config/serverConfig';
import { parseUrlStringToPort } from './utils';
import socketServerSetup from './socketServerSetup';


setupConnection().then(async connection => {

  const port = parseUrlStringToPort(serverConfig.SOCKET_CLIENT.SERVER_URL);
  const socketServer = socketServerSetup(port ? port : 4445);
  const server = new SensorsServer(
    socketServer,
    connection,
  );

  await server.initializeSensors();
  server.startTick();

  console.log('it\'s fine');
});

