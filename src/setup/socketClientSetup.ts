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

// todo refactor demo/core socket server type parameters
export type SocketClient = SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents>;

export default async (parameters: ISocketClientParameters):
Promise<SocketClient> => {
  try {
    const { redis, connection } = parameters;
    const sensorsService = new SensorsService(connection);

    const socket: SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents> =
      io(serverConfig.SOCKET_CLIENT.SERVER_URL);
    const socketController = new SocketClientController(
      socket,
      redis,
    );

    socket.on('connect', () => {
      socketController.onSocketConnected();
    });

    const sensors = await sensorsService.getHeatingStationLinkedSensors(serverConfig.HEATING_STATION_ID);

    sensors.map((sensor) => {
      socket.on(
        `${SocketEvents.SENSOR_STATE}:${sensor.id}`,
        async (data: ISensorStateSocketData): Promise<void> => {
          await socketController.onSensorStateEvent(data);
        });
    });

    // important blocking socketServer initialization method witch is waiting for event to fullfill socketClientController with initial sensors data
    const isReady = () => new Promise<void>((resolve, reject) => {
      socket.on(SocketEvents.HEATING_STATION_INITIAL_SENSORS_STATE, async (data) => {
        try {
          await socketController.onSensorsInitialState(data);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });


    await isReady();
    return socket;

  } catch (e) {
    console.error(e);
  }
};
