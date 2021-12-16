import { Connection } from 'typeorm';
import Sensor, { ISensorShortData } from '../entity/Sensor';
// import SensorLinkedToHeatingStation from '../entity/SensorLinkedToHeatingStation';
import HeatingStation from '../entity/HeatingStation';

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

  async getHeatingStationLinkedSensors(heatingStationId: string): Promise<ISensorShortData[]> {
    const links = await this.connection
      .createQueryBuilder()
      .relation(HeatingStation, 'linkedSensors')
      .of(heatingStationId)
      .loadMany();

    const result = await this.connection
      .getRepository(Sensor)
      .createQueryBuilder('sensor')
      .where('sensor.id IN (:...ids)', { ids: links.map(link => link.sensorId) })
      .getMany();

    return result.map(ent => ent.getSensorShortData());
  }

}
