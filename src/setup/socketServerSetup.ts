import { Server } from 'socket.io';
import { SocketEvents, ISensorStateSocketData } from '../config/types';
import serverConfig from '../config/serverConfig';
import { ISocketServerParameters } from '../index';
import SocketServerController, { IInternalSensorStateDate } from '../controllers/socketServer';
import { getConnection } from 'typeorm';

export interface IServerToClientSocketServerEvents {
  [SocketEvents.SENSOR_GROUP_STATE]: (arg: ISensorStateSocketData[]) => Promise<void>
}


export type SocketServer = Server<unknown, IServerToClientSocketServerEvents, unknown, IInternalSensorStateDate[]>;

/**
 * @function anonymous - Async function for SocketServer configuration
 * @param parameters - ISocketServerParameters
 * @returns - Promise with resolved server @property
 */
export default async (parameters: ISocketServerParameters): Promise<SocketServer> => {
  const { redis } = parameters;

  /**
   * @property server - creating instance of socket Server
   */
  const server = new Server<unknown, IServerToClientSocketServerEvents, unknown, IInternalSensorStateDate[]>(+serverConfig.SOCKET_SERVER.PORT);
  /**
   * @property socketServerController - creating handler for scoped complex events
   */
  const socketServerController = new SocketServerController(
    getConnection(),
    server,
    redis,
  );

  /**
   * @listens connect - on socket connection fires controllers related method
   */
  server.on('connect', (socket) => {
    socketServerController.onSocketConnected(socket);
  });

  /**
   * @event initializeSensors() - controllers awaited call for sensors initialization
   */
  await socketServerController.initializeSensors();

  /**
   * @event startTicking() - controllers call to start ticking processes
   */
  socketServerController.startTicking();

  return server;
};
