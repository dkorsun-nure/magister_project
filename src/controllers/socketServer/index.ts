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

export default class SocketServerController {

  socketServer: SocketServer;

  redis: Redis;

  sensorsService: SensorsService;

  sensors: IInternalSensorStateDate[];

  constructor(
    connection: Connection,
    socketServer: SocketServer,
    redis: Redis,
  ) {
    this.socketServer = socketServer;
    this.redis = redis;
    this.sensorsService = new SensorsService(connection);
  }

  onSocketConnected(socket: Socket<unknown, IServerToClientSocketServerEvents, unknown, IInternalSensorStateDate[]>) {
    console.log('socket connected: ', socket.id);
  }

  async initializeSensors() {
    const sensors = await this.sensorsService.getHeatingStationLinkedSensors(serverConfig.HEATING_STATION_ID);

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
    this.sensors = sensors.map((sensor) => {
      const foundStreamEntry = sensorsLastData.find(entry => +entry.id === sensor.id);
      return {
        ...foundStreamEntry,
        type: sensor.type,
      };
    });
  }

  startTicking(): void {
    setInterval((): void => {
      this.sensors.forEach(async (sensor) => {
        const entries = await RedisCommands.getLastStreamsEntriesOnlyAfterSpecificMilliseconds(
          this.redis,
          sensor.id,
          sensor.lastRead,
        );
        if (entries.length) {
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

  onSensorUpdate(id: string, value: SensorValue, entryTime: number) {
    const indexToUpdate = this.sensors.findIndex(sensor => sensor.id === id);
    const sensorToUpdate = this.sensors[indexToUpdate];
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
