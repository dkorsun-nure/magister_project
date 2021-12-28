import { Socket as SocketIO } from 'socket.io-client';
import { ISensorStateSocketData, SocketEvents } from '../../config/types';
import { IClientToServerClientSocketEvents, IServerToClientClientSocketEvents } from '../../setup/socketClientSetup';
import { Redis } from 'ioredis';
import serverConfig from '../../config/serverConfig';
import { RedisCommands } from '../../utils';

/**
 * @class SocketClientController
 * @description controller for specific socket client purposes
 */
export default class SocketClientController {

  /**
   * @property socket
   * @description connected socket instance
   */
  socket: SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents>;

  /**
   * @property redis
   * @description connected redis-client
   */
  redis: Redis;

  /**
   * @constructor
   * @param {SocketIO} socket - connected socket instance
   * @param {Redis} redis - connected redis client
   */
  constructor(
    socket: SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents>,
    redis: Redis,
  ) {
    this.socket = socket;
    this.redis = redis;
  }

  /**
   * @function onSocketConnected
   * @description when socket connected emits his signal for retrieving of heating station sensors initial state data
   * @returns undefined
   */
  onSocketConnected(): void {
    console.log('connected socket: ', this.socket.id);
    this.socket.emit(SocketEvents.HEATING_STATION_INITIAL_SENSORS_STATE, serverConfig.HEATING_STATION_ID + '');
  }

  /**
   * @function onSensorsInitialState async
   * @param data - Array of sensors initial state
   * @returns Promise<undefined>
   * @description each retrieved sensor data, adds to related redis stream
   */
  async onSensorsInitialState(data: ISensorStateSocketData[]): Promise<void> {
    await Promise.all(data.map(async (sensorData) => {
      await RedisCommands.xadd(this.redis, sensorData.id, { value: sensorData.value });
    }));
  }

  /**
   * @function onSensorStateEvent async
   * @param data - sensor state
   * @returns Promise<undefined>
   * @description retrieved sensor data, adds to related redis stream
   */
  async onSensorStateEvent(data: ISensorStateSocketData): Promise<void> {
    await RedisCommands.xadd(this.redis, data.id, { value: data.value });
  }

}
