import setupConnection from '../setup/typeorm';
import HeatingStation from '../entity/HeatingStation';
import { Connection } from 'typeorm';
import { colors, Config, uniqueNamesGenerator } from 'unique-names-generator';
import Sensor from '../entity/Sensor';
import { SensorTypes } from '../config/types';
import SensorLinkedToHeatingStation from '../entity/SensorLinkedToHeatingStation';

setupConnection().then(async (connection: Connection) => {
  const stationsAmount = 4;

  await (async function execHeatingStationsSeed() {

    const heatingStationsArray = [];

    const nameGenerator = () => {
      const customConfig: Config = {
        dictionaries: [colors],
        length: 1,
      };

      return uniqueNamesGenerator(customConfig);
    };

    for (let i = 0; i < stationsAmount; i++) {
      const uniqueName = nameGenerator()
        .split('')
        .map((c, index) => {
          if (index === 0) {
            return c.toUpperCase();
          }
          return c;
        })
        .join('');
      heatingStationsArray.push({
        name: `${uniqueName} HeatingStation`,
      });
    }

    await connection
      .createQueryBuilder()
      .insert()
      .into(HeatingStation)
      .values(heatingStationsArray)
      .execute();
  })();

  await (async function seedSensorsAndDoLinkingToStation() {

    const sensorsArray: { type: SensorTypes }[] = [];
    const sensorTypeMap = (type: SensorTypes, amount: number) => {
      for (let i = 0; i < amount; i++) {
        sensorsArray.push({
          type,
        });
      }
    };

    // fill the sensorsArray with specific each sensor amounts
    Object.keys(SensorTypes).map(sensorType => {
      let sensorsAmount;
      switch (sensorType) {
        case SensorTypes.MAINLINE__PRESSURE_IN_SENSOR:
          sensorsAmount = 7;
          sensorTypeMap(sensorType, sensorsAmount);
          break;
        case SensorTypes.MAINLINE__PRESSURE_OUT_SENSOR:
          sensorsAmount = 7;
          sensorTypeMap(sensorType, sensorsAmount);
          break;
        case SensorTypes.MAINLINE__TEMPERATURE_IN_SENSOR:
          sensorsAmount = 7;
          sensorTypeMap(sensorType, sensorsAmount);
          break;
        case SensorTypes.MAINLINE__TEMPERATURE_OUT_SENSOR:
          sensorsAmount = 7;
          sensorTypeMap(sensorType, sensorsAmount);
          break;


        case SensorTypes.HEATING_STATION__VALVE_IN_SENSOR:
          sensorsAmount = 4;
          sensorTypeMap(sensorType, sensorsAmount);
          break;
        case SensorTypes.HEATING_STATION__VALVE_OUT_SENSOR:
          sensorsAmount = 4;
          sensorTypeMap(sensorType, sensorsAmount);
          break;
        case SensorTypes.HEATING_STATION__PUMP_IN_SENSOR:
          sensorsAmount = 4;
          sensorTypeMap(sensorType, sensorsAmount);
          break;
        case SensorTypes.HEATING_STATION__PUMP_OUT_SENSOR:
          sensorsAmount = 4;
          sensorTypeMap(sensorType, sensorsAmount);
          break;
      }
    });

    // inserting sensors
    await connection
      .createQueryBuilder()
      .insert()
      .into(Sensor)
      .values(sensorsArray)
      .execute();

    // getting heatingStations
    const heatingStations = await connection
      .getRepository(HeatingStation)
      .createQueryBuilder('heating_station')
      .getMany();
    // getting stored sensors
    const sensors = await connection
      .getRepository(Sensor)
      .createQueryBuilder('sensor')
      .getMany();

    const clonedSensors = [...sensors];


    async function stationWithMainlineSensorsMapper(
      heatingStation: HeatingStation,
      initialSensor: Sensor,
      secondLayerSensor: Sensor,
      thirdLayerSensor: Sensor,
    ) {
      const initialLinkedSensor = new SensorLinkedToHeatingStation();
      initialLinkedSensor.sensor = initialSensor;
      initialLinkedSensor.heatingStation = heatingStation;
      await connection.manager.save(initialLinkedSensor);

      const secondLayerLinkedSensor = new SensorLinkedToHeatingStation();
      secondLayerLinkedSensor.sensor = secondLayerSensor;
      secondLayerLinkedSensor.heatingStation = heatingStation;
      await connection.manager.save(secondLayerLinkedSensor);

      const thirdLayerLinkedSensor = new SensorLinkedToHeatingStation();
      thirdLayerLinkedSensor.sensor = thirdLayerSensor;
      thirdLayerLinkedSensor.heatingStation = heatingStation;
      await connection.manager.save(thirdLayerLinkedSensor);
    }

    // tree-based MAINLINE sensor to heatingStation linking process
    {
      const mainLineSensorsTypes = [
        SensorTypes.MAINLINE__TEMPERATURE_IN_SENSOR,
        SensorTypes.MAINLINE__TEMPERATURE_OUT_SENSOR,
        SensorTypes.MAINLINE__PRESSURE_IN_SENSOR,
        SensorTypes.MAINLINE__PRESSURE_OUT_SENSOR,
      ];

      // do tree-based whole process for each separate sensor type
      await Promise.all(mainLineSensorsTypes.map(async sensorType => {
        const sensorsTreeMatrix: Array<Array<Sensor>> = [];

        for (let i = 0; i < 3; i++) {

          let amountOfPickedSensors: number;
          switch (i) {
            case 0:
              amountOfPickedSensors = 1;
              break;
            case 1:
              amountOfPickedSensors = 2;
              break;
            case 2:
              amountOfPickedSensors = 4;
              break;
          }
          const interimArray = [];
          for (let y = 0; y < amountOfPickedSensors; y++){
            const sensorIndex = clonedSensors.findIndex(sensor => sensor.type === sensorType);
            const splicedSensor = clonedSensors.splice(sensorIndex, 1)[0];
            interimArray.push(splicedSensor);
          }
          sensorsTreeMatrix[i] = interimArray;
        }

        await Promise.all(heatingStations.map(async (heatingStation, i) => {
          const initialSensor = sensorsTreeMatrix[0][0] as Sensor;
          const secondLayerSensor = i > 1 ? sensorsTreeMatrix[1][1] as Sensor : sensorsTreeMatrix[1][0] as Sensor;
          const thirdLayerSensor = sensorsTreeMatrix[2][i];
          await stationWithMainlineSensorsMapper(
            heatingStation,
            initialSensor,
            secondLayerSensor,
            thirdLayerSensor,
          );
        }));
      }));
    }

    //  HeatingStation sensors to each heatingStation linking process
    {
      const heatingStationsSensorTypes = [
        SensorTypes.HEATING_STATION__PUMP_IN_SENSOR,
        SensorTypes.HEATING_STATION__PUMP_OUT_SENSOR,
        SensorTypes.HEATING_STATION__VALVE_IN_SENSOR,
        SensorTypes.HEATING_STATION__VALVE_OUT_SENSOR,
      ];

      await Promise.all(heatingStations.map(async heatingStation => {
        const arrayToInsert: Array<Sensor> = [];

        heatingStationsSensorTypes.forEach( sensorType => {
          const sensorIndex = clonedSensors.findIndex(sensor => sensor.type === sensorType);
          const splicedSensor = clonedSensors.splice(sensorIndex, 1)[0];
          arrayToInsert.push(splicedSensor);
        });


        await Promise.all(arrayToInsert.map(async sensor => {

          const linkedSensor = new SensorLinkedToHeatingStation();
          linkedSensor.sensor = sensor;
          linkedSensor.heatingStation = heatingStation;
          await connection.manager.save(linkedSensor);

        }));
      }));
    }
  })();


  const heatingStation = await connection
    .getRepository(HeatingStation)
    .createQueryBuilder('heating_station')
    .getOne();

  const sensorsLinkedToHeatingStation = await connection
    .getRepository(SensorLinkedToHeatingStation)
    .createQueryBuilder('sensor_linked_to_heating_station')
    .leftJoinAndSelect('sensor_linked_to_heating_station.sensor', 'sensors')
    .leftJoinAndSelect('sensor_linked_to_heating_station.heatingStation', 'heatingStation')
    .where('sensor_linked_to_heating_station.heatingStationId = :stationId', { stationId: heatingStation.id })
    .getMany();

  console.log('sensorsLinkedToHeatingStation: ', sensorsLinkedToHeatingStation);
  console.log('heatingStation: ', heatingStation);
  process.exit();
});
