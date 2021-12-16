import { Redis } from 'ioredis';
import { Server } from 'socket.io';
import { IServerToClientSocketServerEvents } from '../../setup/socketServerSetup';
import { ISensorStateSocketData } from '../../config/types';


export default class SocketServerController {

  socketServer: Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData[]>;

  redis: Redis;

  // todo read every tick all values and broadcast

  constructor(
    socketServer: Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData[]>,
    redis: Redis,
  ) {
    this.socketServer = socketServer;
    this.redis = redis;
  }

}
