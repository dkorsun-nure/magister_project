import { io, Socket as SocketIO } from 'socket.io-client';
import serverConfig from '../config/serverConfig';
import { ISensorStateSocketData, SocketEvents } from '../config/types';
import SocketClientController from '../controllers/socketClient';
import { ISocketClientParameters } from '../index';
import SensorsService from '../services/sensorsService';

type SocketData = `${SocketEvents.SENSOR_STATE}:${string}`;

export interface IServerToClientClientSocketEvents {
  [SocketEvents.HEATING_STATION_INITIAL_SENSORS_STATE]: (sensorsState: ISensorStateSocketData[]) => Promise<void>,

  [any: SocketData]: (arg: ISensorStateSocketData) => Promise<void>,
}

export interface IClientToServerClientSocketEvents {
  [SocketEvents.HEATING_STATION_INITIAL_SENSORS_STATE]: (id: string) => Promise<void>
}

export default async (parameters: ISocketClientParameters):
Promise<SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents>> => {
  try {
    const { redis, connection } = parameters;
    const sensorsService = new SensorsService(connection);

    const socket: SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents> =
      io(serverConfig.SOCKET_CLIENT.SERVER_URL);
    const socketController = new SocketClientController(
      socket,
      redis,
    );

    const sensors = await sensorsService.getHeatingStationLinkedSensors(serverConfig.HEATING_STATION_ID);

    socket.on('connect', () => {
      socketController.onSocketConnected();
    });

    sensors.map((sensor) => {
      socket.on(`${SocketEvents.SENSOR_STATE}:${sensor.id}`, async (data: ISensorStateSocketData) => {
        console.log('\nsocket data: ', data);
      });
    });


    return socket;

  } catch (e) {
    console.error(e);
  }
};
