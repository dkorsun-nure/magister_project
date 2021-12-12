interface IPostgreSqlConfig {
  readonly URL: string;
  readonly USER: string;
  readonly PORT: number;
  readonly PASSWORD: string;
  readonly DB: string;
  readonly DIALECT: 'postgres';
}

export interface IServerConfig {
  readonly NODE_ENV: string;
  readonly HOST: string;
  readonly PORT: string | number;
  readonly POSTGRESQL: IPostgreSqlConfig;
}
