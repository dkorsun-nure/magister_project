import { createConnection } from 'typeorm';
import typeormConfig from '../config/typeormConfig';

function setupConnection() {
  return createConnection(typeormConfig)
    .catch((e) => {
      console.error(e);
      throw e;
    });
}

export default setupConnection;

