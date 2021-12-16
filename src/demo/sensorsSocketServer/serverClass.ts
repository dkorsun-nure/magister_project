import { Server } from 'socket.io';
import { ISensorStateSocketData, SensorTypes, SocketEvents } from '../../config/types';
import { Connection } from 'typeorm';
import SensorsService from '../../services/sensorsService';
import { RandomizerForSensorValues } from './utils';
import { SensorsValueToStringParser } from '../../utils';


type SensorValue = number | boolean;

export interface IInternalSensorStateDate {
  id: string,
  type: SensorTypes,
  value: SensorValue
}

export interface IServerToClientSocketServerEvents {
  [SocketEvents.SENSOR_GROUP_STATE]: (arg: ISensorStateSocketData[]) => Promise<void>
}


export default class SensorsServer {
  server: Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData>;

  sensorsService: SensorsService;

  sensors: IInternalSensorStateDate[];


  constructor(
    server: Server<unknown, IServerToClientSocketServerEvents, unknown, ISensorStateSocketData>,
    connection: Connection,
  ) {
    this.server = server;
    this.sensorsService = new SensorsService(connection);
  }

  async initializeSensors(): Promise<void> {
    const sensors = await this.sensorsService.getAllSensors();
    this.sensors = sensors.map((sensor): IInternalSensorStateDate => {
      let value;
      switch (sensor.type) {
        case SensorTypes.MAINLINE__TEMPERATURE_IN_SENSOR:
        case SensorTypes.MAINLINE__TEMPERATURE_OUT_SENSOR:
          value = RandomizerForSensorValues.temperature({
            max: 180,
            min: 150,
          });
          break;
        case SensorTypes.MAINLINE__PRESSURE_IN_SENSOR:
        case SensorTypes.MAINLINE__PRESSURE_OUT_SENSOR:
          value = RandomizerForSensorValues.pressure({
            max: 26,
            min: 23,
          });
          break;
        case SensorTypes.HEATING_STATION__VALVE_IN_SENSOR:
        case SensorTypes.HEATING_STATION__VALVE_OUT_SENSOR:
          value = RandomizerForSensorValues.valve({
            max: .4,
            min: 0,
          });
          break;
        case SensorTypes.HEATING_STATION__PUMP_IN_SENSOR:
        case SensorTypes.HEATING_STATION__PUMP_OUT_SENSOR:
          value = RandomizerForSensorValues.pump(0);
          break;
        default:
          throw new Error('unknown sensor type');
      }

      return Object.assign({}, {
        id: sensor.id + '',
        type: sensor.type,
        value,
      });
    });
  }

  startTick() {
    setInterval(() => {
      this.tick();
    }, 5_000);
  }

  tick() {
    const clonedSensors = [...this.sensors];
    const amountOfSensorsToChange = Math.floor(Math.random() * this.sensors.length / 10);

    console.log(`\n\nTick amount of changes: ${amountOfSensorsToChange}`);

    for (let i = 0; i < amountOfSensorsToChange; i++) {
      const rndIndex = Math.floor(Math.random() * clonedSensors.length);
      const sensor = clonedSensors.splice(rndIndex, 1)[0];
      const originValue = sensor.value;
      const changedValue = this.naturalSensorChange(sensor);
      const originIndex = this.sensors.findIndex(origSensor => sensor.id === origSensor.id);
      this.sensors[originIndex].value = changedValue;

      let valueString;
      let originValueString;
      switch (sensor.type) {
        case SensorTypes.MAINLINE__TEMPERATURE_IN_SENSOR:
        case SensorTypes.MAINLINE__TEMPERATURE_OUT_SENSOR:
          valueString = SensorsValueToStringParser.temperature(sensor.value as number);
          originValueString = SensorsValueToStringParser.temperature(originValue as number);
          break;
        case SensorTypes.MAINLINE__PRESSURE_IN_SENSOR:
        case SensorTypes.MAINLINE__PRESSURE_OUT_SENSOR:
          valueString = SensorsValueToStringParser.pressure(sensor.value as number);
          originValueString = SensorsValueToStringParser.pressure(originValue as number);
          break;
        case SensorTypes.HEATING_STATION__VALVE_IN_SENSOR:
        case SensorTypes.HEATING_STATION__VALVE_OUT_SENSOR:
          valueString = SensorsValueToStringParser.valve(sensor.value as number);
          originValueString = SensorsValueToStringParser.valve(originValue as number);
          break;
        case SensorTypes.HEATING_STATION__PUMP_IN_SENSOR:
        case SensorTypes.HEATING_STATION__PUMP_OUT_SENSOR:
          valueString = sensor.value;
          originValueString = originValue;
          break;
      }
      console.log(`${sensor.type} sensor ${sensor.id} changed from ${originValueString} to ${valueString}`);
      // todo this.emitChange();
    }

  }

  naturalSensorChange(sensor: IInternalSensorStateDate): SensorValue {
    const value = sensor.value;

    switch (sensor.type) {
      case SensorTypes.MAINLINE__TEMPERATURE_IN_SENSOR:
      case SensorTypes.MAINLINE__TEMPERATURE_OUT_SENSOR:
        return this.temperatureNaturalChange(value);
        break;
      case SensorTypes.MAINLINE__PRESSURE_IN_SENSOR:
      case SensorTypes.MAINLINE__PRESSURE_OUT_SENSOR:
        return this.pressureNaturalChange(value);
        break;
      case SensorTypes.HEATING_STATION__VALVE_IN_SENSOR:
      case SensorTypes.HEATING_STATION__VALVE_OUT_SENSOR:
        return this.valveNaturalChange(value);
        break;
      case SensorTypes.HEATING_STATION__PUMP_IN_SENSOR:
      case SensorTypes.HEATING_STATION__PUMP_OUT_SENSOR:
        return this.pumpNaturalChange(value);
        break;
      default:
        throw new Error('unknown sensor type');
    }
  }

  temperatureNaturalChange(value: SensorValue): number {
    const max  = 2;
    const min  = -1;
    const diff = Math.floor((Math.random() * (max - min) + min) * 10) / 10;
    const result = Math.floor((+value + diff) * 100) / 100;
    return result;
  }

  pressureNaturalChange(value: SensorValue): number {
    const max  = 1;
    const min  = Math.floor((0 - +value) * 100) / 100;
    const diff = Math.floor((Math.random() * (max - min) + min) * 100) / 100;
    const result = Math.floor((+value + diff) * 100) / 100;

    return result;
  }

  valveNaturalChange(value: SensorValue): number {
    const max  = Math.floor((1 - +value) * 1000) / 1000;
    const min  = Math.floor((0 - +value) * 1000) / 1000;

    const diff = Math.floor((Math.random() * (max - min) + min) * 1000) / 1000;
    const result = Math.floor((+value + diff) * 1000) / 1000;
    return result;

  }

  pumpNaturalChange(value: SensorValue): boolean {
    return !value
  }

}


