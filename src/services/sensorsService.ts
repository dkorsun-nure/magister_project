import { Connection } from 'typeorm';
import Sensor, { ISensorShortData } from '../entity/Sensor';

export default class SensorsService {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async getAllSensors(): Promise<ISensorShortData[]> {
    return this.connection
      .getRepository(Sensor)
      .createQueryBuilder()
      .getMany();
  }

  async getHeatingStationLinkedSensors(): Promise<void> {
  // todo async getHeatingStationLinkedSensors(): Promise<ISensorShortData[]> {
  }

}
