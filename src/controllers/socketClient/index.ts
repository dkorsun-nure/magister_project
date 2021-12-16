import { Socket as SocketIO } from 'socket.io-client';
import { ISensorStateSocketData, SocketEvents } from '../../config/types';
import { IClientToServerClientSocketEvents, IServerToClientClientSocketEvents } from '../../setup/socketClientSetup';
import { Redis } from 'ioredis';
import serverConfig from '../../config/serverConfig';


export default class SocketClientController {

  socket: SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents>;

  redis: Redis;

  //todo last-read date milliseconds
  //todo update values by setting only changed values after last-read date

  constructor(
    socket: SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents>,
    redis: Redis,
  ) {
    this.socket = socket;
    this.redis = redis;
  }

  onSocketConnected(): void {
    console.log('connected socket: ', this.socket.id);
    this.socket.emit(SocketEvents.HEATING_STATION_INITIAL_SENSORS_STATE, serverConfig.HEATING_STATION_ID + '');
  }

  async onSensorStateEvent(data: ISensorStateSocketData): Promise<void> {
    console.log('\n\nsensor change: ', JSON.stringify(data, null, 2));
    // todo await this.redis.xadd(data.id, data.value + '');
  }

}
