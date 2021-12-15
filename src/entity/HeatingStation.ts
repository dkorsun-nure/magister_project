import {
  Column,
  Entity, OneToMany,
} from 'typeorm';
import { DefaultEntity } from './utils';
import Sensor from './Sensor';
import SensorLinkedToHeatingStation from './SensorLinkedToHeatingStation';



@Entity()
export default class HeatingStation extends DefaultEntity {

  @Column({ type: 'varchar' })
    name: string;

  @OneToMany(() =>  SensorLinkedToHeatingStation, linked => linked.heatingStation)
    linkedSensors: Sensor[];

}
