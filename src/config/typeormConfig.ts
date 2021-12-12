import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import serverConfig from './serverConfig';

import Sensor from '../entity/Sensor';

const typeormConfig = {
  type: 'postgres',
  host: serverConfig.POSTGRESQL.URL,
  port: serverConfig.POSTGRESQL.PORT,
  username: serverConfig.POSTGRESQL.USER,
  password: serverConfig.POSTGRESQL.PASSWORD,
  database: serverConfig.POSTGRESQL.DB,
  entities: [
    Sensor,
  ],
  synchronize: true,
} as PostgresConnectionOptions;

export default typeormConfig;
