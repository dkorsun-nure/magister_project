import { Server } from 'socket.io';
import { SocketEvents, ISensorStateSocketData } from '../config/types';
import serverConfig from '../config/serverConfig';
import { ISocketServerParameters } from '../index';
import SocketServerController from '../controllers/socketServer';
import { getConnection } from 'typeorm';

export interface IServerToClientSocketServerEvents {
  [SocketEvents.SENSOR_GROUP_STATE]: (arg: ISensorStateSocketData[]) => Promise<void>
}


export type SocketServer = Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData[]>;

export default async (parameters: ISocketServerParameters): Promise<SocketServer> => {
  const { redis } = parameters;

  const server = new Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData[]>(+serverConfig.SOCKET_SERVER.PORT);
  const socketServerController = new SocketServerController(
    getConnection(),
    server,
    redis,
  );

  server.on('connect', (socket) => {
    socketServerController.onSocketConnected(socket);
  });

  await socketServerController.initializeSensors();

  return server;
};
