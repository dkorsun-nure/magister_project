import dotenv from 'dotenv';
import { IServerConfig } from './serverConfig.map';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : undefined });

const serverConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST,
  PORT: process.env.PORT,
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
