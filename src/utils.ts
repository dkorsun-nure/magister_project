/** Converts Scalar values to a strings */
import { Redis } from 'ioredis';
import { ISensorStateSocketData, SensorValue } from './config/types';

export class SensorsValueToStringParser {

  /**
   * Converts temperature
   * @param {number} temp - represents temperature in Celsius
   * @return {string}
   * */
  static temperature(temp: number): string {
    return `${temp} °C`;
  }


  /**
   * Converts temperature
   * @param {number} press - represents pressure in Bars
   * @return {string}
   * */
  static pressure(press: number): string {
    return `${press} Bar`;
  }

  /**
   * Converts valve's level of opened state in percentage
   * @param {number} state - represents opened state in 0 - 1 floating range
   * @return {string}
   */
  static valve(state: number): string {
    return `${Math.floor(state * 10_000) / 100} %`;
  }
}

/** Converts strings to Scalar values */
export class SensorsStringToValueParser {

  /**
   * Converts temperature
   * @param {string} temp - represents temperature in Celsius
   * @return {number}
   * */
  static temperature(temp: string): number {
    return +temp.split(' °C')[0];
  }


  /**
   * Converts temperature
   * @param {string} press - represents pressure in Bars
   * @return {number}
   * */
  static pressure(press: string): number {
    return +press.split(' Bar')[0];
  }

  /**
   * Converts valve's level of opened state in percentage
   * @param {string} state - represents opened state in 0 - 1 floating range
   * @return {number}
   */
  static valve(state: string): number {
    return +state.split(' %')[0];
  }
}


export type IxrangeResult = Array<[string, string[]]>;
export type IxreadResult = Array<[string, Array<[string, string[]]>]>;
export type IxreadSingleResult = [string, Array<[string, string[]]>];

export class RedisCommands {

  static async xadd(
    redis: Redis,
    streamId: string,
    values: { [any: string]: any },
    params?: { entryId?: string },
  ): Promise<string> {
    const valuesMap: Array<string> = [];
    Object.entries(values).map(pair => {
      pair.forEach(str => valuesMap.push(str + ''));
    });

    return redis.xadd(
      streamId,
      params?.entryId ? params.entryId : '*',
      ...valuesMap,
    );
  }

  static async readEntriesInStreams(
    redis: Redis,
    streamIds: string[],
    params?: {
      count?: number
    },
  ): Promise<IxreadResult> {

    return redis.xread(
      params?.count ? params.count + 'STREAMS'
        : 'STREAMS',
      ...streamIds,
      streamIds.map(() => '0'),
    );
  }
}

export class RedisParser {
  static redisLikeValueArrayToObject(array: string[]): { [any: string]: string } {
    return array.reduce((result, value, i, arr) => {
      // is odd
      if (i % 2) {
        result[arr[i - 1]] = value;
      }
      return result;
    }, {} as { [index: string]: any });
  }

  static redisStringToSensorValue(string: string): SensorValue {
    if (!isNaN(Number(string))) {
      return Number(string);
    } else if (string === 'false'
      || string === 'true') {
      return string === 'true';
    }
  }
}

export class RedisMapper {
  static mapXreadStreamToLastEntry(read: IxreadSingleResult): & Pick<ISensorStateSocketData, 'id' | 'value'> {

    const streamEntries = read[1];
    const streamEntry = streamEntries[streamEntries.length - 1];
    const valueArr = streamEntry[1];
    const valueString = RedisParser.redisLikeValueArrayToObject(valueArr)?.value;
    const value = RedisParser.redisStringToSensorValue(valueString);
    return {
      id: read[0],
      value,
    };
  }
}
