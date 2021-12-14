import 'reflect-metadata';
import { Socket as SocketIO } from 'socket.io-client';
import APIServerSetup from './setup/APIServerSetup';

import serverConfig from './config/serverConfig';
import setupConnection from './setup/typeorm';
import { Connection } from 'typeorm';
import { Server } from 'socket.io';
import socketServerSetup from './setup/socketServerSetup';
import socketClientSetup from './setup/socketClientSetup';

const {
  API,
  // SOCKET_CLIENT, SOCKET_SERVER,
  HOST: host,
} = serverConfig;
const { PORT: API_PORT } = API;
// const { SERVER_URL: SOCKET_CLIENT_SERVER_URL } = SOCKET_CLIENT;
// const { PORT: SOCKET_SERVER_PORT } = SOCKET_SERVER;

class CoreWorker {
  db: Connection;

  socketClient: SocketIO;

  socketServer: Server;

  constructor(
    db: Connection,
    socketClient: SocketIO,
    socketServer: Server,
  ) {
    this.db = db;
    this.socketClient = socketClient;
    this.socketServer = socketServer;
  }

  // place for common behaviour purposes: kill, restore connection and so on
}

(async function () {

  const db = await setupConnection();
  const socketClient = await socketClientSetup();
  const socketServer = await socketServerSetup();

  new CoreWorker(db, socketClient, socketServer);

  const server = await APIServerSetup();
  server.listen(`${API_PORT}`);
  console.log(`API server started on ${host}:${API_PORT}`);
}
)();
