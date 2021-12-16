import 'reflect-metadata';
import setupConnection from '../../setup/typeorm';
import SensorsServer, { IServerToClientSocketServerEvents } from './serverClass';
import serverConfig from '../../config/serverConfig';
import { parseUrlStringToPort } from './utils';
import { Server } from 'socket.io';
import { ISensorStateSocketData } from '../../config/types';


setupConnection().then(async connection => {

  const port = parseUrlStringToPort(serverConfig.SOCKET_CLIENT.SERVER_URL);
  const socketServer = new Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData>(port ? port : 4445);
  const server = new SensorsServer(
    socketServer,
    connection,
  );

  await server.initializeSensors();
  server.startTick();

  console.log('it\'s fine');
});

