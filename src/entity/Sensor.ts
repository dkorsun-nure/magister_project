/* eslint-disable import/no-cycle */
import {
  Column,
  Entity, OneToMany,
} from 'typeorm';
import { DefaultEntity, IDefaultData } from './utils';
import { SensorTypes } from '../config/types';
import HeatingStation from './HeatingStation';
import SensorLinkedToHeatingStation from './SensorLinkedToHeatingStation';

export interface ISensorData {
  type: SensorTypes
}

export type ISensorShortData =  {
  type: SensorTypes
} & Pick<IDefaultData, 'id'>;

@Entity()
export default abstract class Sensor extends DefaultEntity {
  @Column({ type: 'enum', enum: SensorTypes })
    type: SensorTypes;

  @OneToMany(() =>  SensorLinkedToHeatingStation, linked => linked.sensor)
    linkedHeatingStations: HeatingStation[];

  getSensorData(): ISensorData & IDefaultData {
    return Object.assign({}, {
      id: this.id,
      type: this.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  getSensorShortData(): ISensorShortData {
    return Object.assign({}, {
      id: this.id,
      type: this.type,
    });
  }
}
