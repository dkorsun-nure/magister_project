import 'reflect-metadata';
import { Socket as SocketIO } from 'socket.io-client';
import APIServerSetup from './setup/APIServerSetup';

import serverConfig from './config/serverConfig';
import setupConnection from './setup/typeorm';
import { Connection } from 'typeorm';
import { Server } from 'socket.io';
import socketServerSetup from './setup/socketServerSetup';
import socketClientSetup from './setup/socketClientSetup';
import redisClientSetup from './setup/redisClientSetup';
import { Redis } from 'ioredis';

const {
  API,
  HOST: host,
} = serverConfig;
const { PORT: API_PORT } = API;

export interface ISocketClientParameters {
  redis: Redis
  connection: Connection
}

export interface ISocketServerParameters {
  redis: Redis

}

/**
 * Core Worker
 * @description Represents main class with all servers launched inside
 * @constructor
 * @param {Connection} db - TypeORM db connection
 * @param {SocketIO} socletClient - client connected to Socket Sensors Server
 * @param {Server} socketServer - server witch broadcasts precessed data for real-time consumers
 *  */
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
  const redis = await redisClientSetup();
  const socketClient = await socketClientSetup({
    redis,
    connection: db,
  });
  const socketServer = await socketServerSetup({
    redis,
  });

  new CoreWorker(db, socketClient, socketServer);

  const server = await APIServerSetup();
  server.listen(`${API_PORT}`);
  console.log(`API server started on ${host}:${API_PORT}`);
}
)();
