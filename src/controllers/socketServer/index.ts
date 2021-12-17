import { Redis } from 'ioredis';
import { IServerToClientSocketServerEvents, SocketServer } from '../../setup/socketServerSetup';
import { SensorTypes, SensorValue } from '../../config/types';
import { Connection } from 'typeorm';
import SensorsService from '../../services/sensorsService';
import { RedisCommands, RedisMapper } from '../../utils';
import { Socket } from 'socket.io';
import serverConfig from '../../config/serverConfig';

export interface IInternalSensorStateDate {
  id: string,
  type: SensorTypes,
  value: SensorValue
}

export default class SocketServerController {

  socketServer: SocketServer;

  redis: Redis;

  sensorsService: SensorsService;

  sensors: IInternalSensorStateDate[];

  // todo read every tick all values and broadcast
  // todo OR provide redis streams sub

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

    const sensorsStreams = await RedisCommands.readEntriesInStreams(
      this.redis,
      sensors.map(sensor => sensor.id + ''),
    );
    const lastSensorStreamsEntries = sensorsStreams.map(stream => (
      RedisMapper.mapXreadStreamToLastEntry(stream)
    ));

    this.sensors = sensors.map((sensor) => {
      const foundStreamEntry = lastSensorStreamsEntries.find(entry => +entry.id === sensor.id);
      return {
        ...foundStreamEntry,
        type: sensor.type,
      };
    });
  }
}
