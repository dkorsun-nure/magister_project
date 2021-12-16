/** Converts Scalar values to a strings */
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
