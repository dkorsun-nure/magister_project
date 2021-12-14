import { Server } from 'socket.io';

export default async (): Promise<Server> => {
  const server = new Server();
  return server;
};
