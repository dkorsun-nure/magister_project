import { Server } from 'socket.io';
import { SocketEvents, ISensorStateSocketData } from '../config/types';
// import SocketServerController from '../controllers/socketServer';

export interface IServerToClientSocketServerEvents {
  [SocketEvents.SENSOR_GROUP_STATE]: (arg: ISensorStateSocketData[]) => Promise<void>
}


export default async (): Promise<Server> => {
  const server = new Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData[]>();
  // const socketServerController = new SocketServerController(server);

  return server;
};
