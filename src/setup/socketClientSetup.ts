import {io, Socket as SocketIO} from 'socket.io-client';
import serverConfig from '../config/serverConfig';
import {ISensorStateSocketData, SocketEvents} from '../config/types';
import SocketClientController from '../controllers/socketClient';
import {ISocketClientParameters} from '../index';
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

/**
 * @function anonymous - Async function for SocketClient configuration
 * @param parameters - ISocketClientParameters
 * @returns - Promise with rejected socket @property
 */

export default async (parameters: ISocketClientParameters):
  Promise<SocketClient> => {
  try {
    const {redis, connection} = parameters;
    const sensorsService = new SensorsService(connection);

    /**
     * @property socket - creating instance of socket with specific params
     */
    const socket: SocketIO<IServerToClientClientSocketEvents, IClientToServerClientSocketEvents> =
      io(serverConfig.SOCKET_CLIENT.SERVER_URL);
    /**
     * @property socketController - creating handler for scoped complex events
     */
    const socketController = new SocketClientController(
      socket,
      redis,
    );

    /**
     * @listens connect - on socket connection fires controllers related method
     */
    socket.on('connect', () => {
      socketController.onSocketConnected();
    });

    /**
     * @property sensors - retrieved sensors related to exact heating station
     */
    const sensors = await sensorsService.getHeatingStationLinkedSensors(serverConfig.HEATING_STATION_ID);

    /**
     * @function sensors.map
     * @description - iterates sensors @property to create listener
     */
    sensors.map((sensor) => {
      /**
       * @listens socket.on(`SENSOR_STATE:sensor.id`) - Signals in SocketSensorsSever and calls socketController related method
       */
      socket.on(
        `${SocketEvents.SENSOR_STATE}:${sensor.id}`,
        async (data: ISensorStateSocketData): Promise<void> => {
          await socketController.onSensorStateEvent(data);
        });
    });

    // important blocking socketServer initialization method witch is waiting for event to fullfill socketClientController with initial sensors data
    /**
     * @function isReady
     * @description awaits Server signal with initial sensors state to finish setup
     */
    const isReady = () => new Promise<void>((resolve, reject) => {
      /**
       * @listens HEATING_STATION_INITIAL_SENSORS_STATE - on sensors initial state signal passes the data to related socketController method call
       */
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
