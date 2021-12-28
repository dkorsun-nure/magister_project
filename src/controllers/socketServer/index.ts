import { Redis } from 'ioredis';
import { IServerToClientSocketServerEvents, SocketServer } from '../../setup/socketServerSetup';
import { SensorTypes, SensorValue } from '../../config/types';
import { Connection } from 'typeorm';
import SensorsService from '../../services/sensorsService';
import { IxrangeResult, RedisCommands, RedisParser } from '../../utils';
import { Socket } from 'socket.io';
import serverConfig from '../../config/serverConfig';

export interface IInternalSensorStateDate {
  id: string,
  type: SensorTypes,
  value: SensorValue,
  lastRead: number,
}

/**
 * @class SocketServerController
 * @description - controller for socketServer related functionality
 */
export default class SocketServerController {

  /**
   * @member socketServer
   * @description instance of SocketServer
   */
  socketServer: SocketServer;

  /**
   * @member redis
   * @description connected redis-client
   */
  redis: Redis;

  /**
   * @member sensorsService
   * @description created instance of sensors DB service
   */
  sensorsService: SensorsService;

  /**
   * @member sensors
   * @description internal writes for related sensors containing combined info
   */
  sensors: IInternalSensorStateDate[];

  /**
   * @constructor
   * @param {Connection} connection - db connection instance
   * @param {SocketIO} socketServer - connected socketServer instance
   * @param {Redis} redis - connected redis client
   */
  constructor(
    connection: Connection,
    socketServer: SocketServer,
    redis: Redis,
  ) {
    this.socketServer = socketServer;
    this.redis = redis;
    this.sensorsService = new SensorsService(connection);
  }

  /**
   * @function onSocketConnected
   * @description handles connected sockets
   * @description for actual moment doing just logging
   * @param socket
   * @returns undefined
   */
  onSocketConnected(socket: Socket<unknown, IServerToClientSocketServerEvents, unknown, IInternalSensorStateDate[]>): void {
    console.log('socket connected: ', socket.id);
  }

  /**
   * @function initializeSensors async
   * @description initializes sensors by combining in them: sensor state data and last read date
   * @returns Promise<undefined>
   */
  async initializeSensors(): Promise<void> {
    const sensors = await this.sensorsService.getHeatingStationLinkedSensors(serverConfig.HEATING_STATION_ID);

    /**
     * @property singleEntriesWithId
     * @description retrieved last entries from all the streams related to sensors @property
     */
    const singleEntriesWithId = await Promise.all(sensors.map(async (sensor): Promise<{
      id: string,
      entries: IxrangeResult
    }> => {
      const entries = await RedisCommands.getLastStreamsEntriesOnlyAfterSpecificMilliseconds(
        this.redis,
        sensor.id + '',
        new Date().getTime() - 5000,
      );
      return {
        id: sensor.id + '',
        entries,
      };
    }));

    /**
     * @property sensorsLastData
     * @description reformatted entries to internal sensors data
     */
    const sensorsLastData = singleEntriesWithId.map((entryWithId) => {
      const id = entryWithId.id;
      const entryArr = entryWithId.entries;
      const entry = entryArr[0];
      const entryTime = RedisParser.redisStreamEntryIdToMilliseconds(entry[0]);
      const valuesArr = entry[1];
      const values = RedisParser.redisLikeValuesArrayToObject(valuesArr);
      const value = RedisParser.redisStringToSensorValue(values.value);
      return {
        id,
        value,
        lastRead: entryTime,
      };
    });

    /**
     * @description all reads aligned to related internal sensor write
     */
    this.sensors = sensors.map((sensor) => {
      const foundStreamEntry = sensorsLastData.find(entry => +entry.id === sensor.id);
      return {
        ...foundStreamEntry,
        type: sensor.type,
      };
    });
  }

  /**
   * @function startTicking async
   * @description creates JS intervals to read new entries in all redis streams related to sensors @member
   * @returns undefined
   */
  startTicking(): void {
    setInterval((): void => {
      /**
       * @description iterate internal sensors
       */
      this.sensors.forEach(async (sensor) => {
        /**
         * @description get entries of related redis stream which later than related sensor internal last read record
         */
        const entries = await RedisCommands.getLastStreamsEntriesOnlyAfterSpecificMilliseconds(
          this.redis,
          sensor.id,
          sensor.lastRead,
        );
        if (entries.length) {
          /**
           * @description if new entries exists
           */
          const entry = entries[0];
          const entryTime = RedisParser.redisStreamEntryIdToMilliseconds(entry[0]);
          const valuesArr = entry[1];
          const values = RedisParser.redisLikeValuesArrayToObject(valuesArr);
          const value = RedisParser.redisStringToSensorValue(values.value);
          this.onSensorUpdate(sensor.id, value, entryTime);
        }
      });
    }, 1_000);
  }

  /**
   * @function onSensorUpdate
   * @description handling of each found updated sensor
   * @param {string} id
   * @param {SensorValue} value
   * @param {entryTime} entryTime
   * @returns undefined
   */
  onSensorUpdate(id: string, value: SensorValue, entryTime: number): void {
    /**
     * @description which index of internal sensor, that is updating
     */
    const indexToUpdate = this.sensors.findIndex(sensor => sensor.id === id);
    /**
     * @description internal sensor, that is updating
     */
    const sensorToUpdate = this.sensors[indexToUpdate];

    /**
     * @description rewriting internal sensor data by changing with new value and lastRead props
     */
    this.sensors[indexToUpdate] = {
      ...sensorToUpdate,
      value,
      lastRead: entryTime,
    };

    console.log(
      `\nsensor ${id} changed with value '${value}' at ${entryTime}`,
    );
  }
}
