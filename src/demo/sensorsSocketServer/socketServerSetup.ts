import { Server } from 'socket.io';
import { ISensorStateSocketData } from '../../config/types';
import { IClientToServerClientSocketEvents, IServerToClientClientSocketEvents } from '../../setup/socketClientSetup';

export default function socketServerSetup(port: number) {

  const server = new Server<IClientToServerClientSocketEvents, IServerToClientClientSocketEvents, unknown, ISensorStateSocketData>(port);


  return server;
}
