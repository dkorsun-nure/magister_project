import { Server } from 'socket.io';
import { SocketEvents, ISensorStateSocketData } from '../config/types';
import serverConfig from '../config/serverConfig';
import { ISocketServerParameters } from '../index';
// import SocketServerController from '../controllers/socketServer';

export interface IServerToClientSocketServerEvents {
  [SocketEvents.SENSOR_GROUP_STATE]: (arg: ISensorStateSocketData[]) => Promise<void>
}


export default async (parameters: ISocketServerParameters): Promise<Server> => {
  // const { redis } = parameters;

  const server = new Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData[]>(+serverConfig.SOCKET_SERVER.PORT);
  // const socketServerController = new SocketServerController(
  //   server,
  //   redis,
  // );

  // console.log(socketServerController);

  return server;
};
