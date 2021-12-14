import { io, Socket as SocketIO } from 'socket.io-client';
import serverConfig from '../config/serverConfig';
import { ISensorStateSocketData, SocketEvents } from '../config/types';
import SocketClientController from '../controllers/socketClient';


export interface IServerToClientSocketClientEvents {
  [SocketEvents.SENSOR_STATE]: (arg: ISensorStateSocketData) => Promise<void>
}

export default async (): Promise<SocketIO<IServerToClientSocketClientEvents>> => {
  const socket: SocketIO<IServerToClientSocketClientEvents> = io(serverConfig.SOCKET_CLIENT.SERVER_URL);
  const socketController = new SocketClientController(socket);

  socket.on('connect', () => {
    socketController.onSocketConnected();
  });

  socket.on(SocketEvents.SENSOR_STATE, async (data) => {
    await socketController.onSensorStateEvent(data);
  });

  return socket;
};
