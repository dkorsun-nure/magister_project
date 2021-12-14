import express, { Application, Router } from 'express';
import apiRouter from '../controllers/api';
import bodyParser from 'body-parser';

export default async (): Promise<Application> => {
  const app = express();

  app.use(bodyParser.json());

  const coreRouter = Router();
  coreRouter.use('/api', apiRouter);

  app.use('/', coreRouter);

  return app;
};
