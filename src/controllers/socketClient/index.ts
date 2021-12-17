import { Socket as SocketIO } from 'socket.io-client';
import { ISensorStateSocketData, SocketEvents } from '../../config/types';
import { IClientToServerClientSocketEvents, IServerToClientClientSocketEvents } from '../../setup/socketClientSetup';
import { Redis } from 'ioredis';
import serverConfig from '../../config/serverConfig';
import { RedisCommands } from '../../utils';


export default class SocketClientController {

  socket: SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents>;

  redis: Redis;

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

  async onSensorsInitialState(data: ISensorStateSocketData[]): Promise<void> {
    await Promise.all(data.map(async (sensorData) => {
      await RedisCommands.xadd(this.redis, sensorData.id, { value: sensorData.value });
    }));
  }

  async onSensorStateEvent(data: ISensorStateSocketData): Promise<void> {
    await RedisCommands.xadd(this.redis, data.id, { value: data.value });
  }

}
