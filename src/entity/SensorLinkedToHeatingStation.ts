/* eslint-disable import/no-cycle */

import {
  Entity, ManyToOne, PrimaryColumn,
  JoinColumn } from 'typeorm';
import { DefaultEntity } from './utils';
import Sensor from './Sensor';
import HeatingStation from './HeatingStation';

@Entity()
export default class SensorLinkedToHeatingStation extends DefaultEntity {

  @PrimaryColumn()
    sensorId: number;

  @PrimaryColumn()
    heatingStationId: number;

  @ManyToOne(
    () => Sensor,
    sensor => sensor.linkedHeatingStations,
    { primary: true },
  )
  @JoinColumn({ name: 'sensorId' })
    sensor: Sensor;

  @ManyToOne(
    () => HeatingStation,
    heatingStation => heatingStation.linkedSensors,
    { primary: true },
  )
  @JoinColumn({ name: 'heatingStationId' })
    heatingStation: HeatingStation;
}
