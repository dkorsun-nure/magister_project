// eslint-disable-next-line @typescript-eslint/no-var-requires
// const dotenv = require('dotenv');
import * as dotenv from 'dotenv';
import { IServerConfig } from './serverConfig.map';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : undefined });

const serverConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST,
  HEATING_STATION_ID: process.env.HEATING_STATION_ID,
  API: {
    PORT: +process.env.API_PORT,
  },
  SOCKET_CLIENT: {
    SERVER_URL: process.env.SOCKET_CLIENT_SERVER_URL,
  },
  SOCKET_SERVER: {
    PORT: +process.env.SOCKET_SERVER_PORT,
  },
  POSTGRESQL: {
    URL: process.env.POSTGRESQL__URL,
    USER: process.env.POSTGRESQL__USER,
    PORT: +process.env.POSTGRESQL__PORT,
    PASSWORD: process.env.POSTGRESQL__PASSWORD,
    DB: process.env.POSTGRESQL__DB,
    DIALECT: 'postgres',
  },
} as IServerConfig;

export default Object.freeze(serverConfig);
