/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
} from 'typeorm';
import { DefaultEntity, IDefaultData } from './utils';
import { SensorTypes } from '../config/types';

export interface ISensorData {
  type: SensorTypes
}

@Entity()
export default abstract class Sensor extends DefaultEntity {
  @Column({ type: 'enum', enum: SensorTypes })
    type: SensorTypes;

  getSensorData(): ISensorData & IDefaultData {
    return Object.assign({}, {
      id: this.id,
      type: this.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
