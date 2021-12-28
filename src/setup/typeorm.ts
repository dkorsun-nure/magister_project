import { createConnection } from 'typeorm';
import typeormConfig from '../config/typeormConfig';

function setupConnection() {
  return createConnection(typeormConfig(process.env.NODE_ENV === 'DEBUG_DB'))
    .catch((e) => {
      console.error(e);
      throw e;
    });
}

export default setupConnection;

