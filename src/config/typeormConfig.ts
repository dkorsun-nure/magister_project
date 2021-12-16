import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import serverConfig from './serverConfig';

import Sensor from '../entity/Sensor';
import HeatingStation from '../entity/HeatingStation';
import SensorLinkedToHeatingStation from '../entity/SensorLinkedToHeatingStation';

const typeormConfig = (resync = false): PostgresConnectionOptions => {
  return ({
    type: 'postgres',
    host: serverConfig.POSTGRESQL.URL,
    port: serverConfig.POSTGRESQL.PORT,
    username: serverConfig.POSTGRESQL.USER,
    password: serverConfig.POSTGRESQL.PASSWORD,
    database: serverConfig.POSTGRESQL.DB,
    entities: [
      Sensor,
      HeatingStation,
      SensorLinkedToHeatingStation,
    ],
    synchronize: resync,
    dropSchema: resync,
  });
};

export default typeormConfig;
