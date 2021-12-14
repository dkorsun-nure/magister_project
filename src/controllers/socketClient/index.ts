import { Socket as SocketIO } from 'socket.io-client';
import { ISensorStateSocketData, IServerToClientSocketClientEvents } from '../../setup/socketClientSetup';
import redis from '../../setup/redisClientSetup';
import Redis from 'ioredis';


export default class SocketClientController {

  socket: SocketIO<IServerToClientSocketClientEvents>;

  redis: Redis.Redis;

  constructor(socket: SocketIO<IServerToClientSocketClientEvents>) {
    this.socket = socket;
    this.redis = redis();
  }

  onSocketConnected(): void {
    console.log('connected socket: ', this.socket.id);
  }

  async onSensorStateEvent(data: ISensorStateSocketData): Promise<void> {
    await this.redis.xadd(data.id, data.parameter);
  }

}
