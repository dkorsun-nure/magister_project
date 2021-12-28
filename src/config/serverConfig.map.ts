interface IPostgreSqlConfig {
  readonly URL: string;
  readonly USER: string;
  readonly PORT: number;
  readonly PASSWORD: string;
  readonly DB: string;
  readonly DIALECT: 'postgres';
}

interface ISocketServerConfig {
  readonly PORT: number;
}

interface ISocketClientConfig {
  readonly SERVER_URL: string;
}

interface IAPIServerConfig {
  readonly PORT: number;
}

export interface IServerConfig {
  readonly NODE_ENV: string;
  readonly HOST: string;
  readonly HEATING_STATION_ID: string;
  readonly API: IAPIServerConfig;
  readonly SOCKET_CLIENT: ISocketClientConfig;
  readonly SOCKET_SERVER: ISocketServerConfig;
  readonly POSTGRESQL: IPostgreSqlConfig;
}
