interface INumberRange {
  max: number;
  min: number
}

export function parseUrlStringToPort(url: string): number | null {
  const splitted = url.split(':');
  return isNaN(+splitted[splitted.length - 1]) ? null : +splitted[splitted.length - 1];
}

export class RandomizerForSensorValues {
  static temperature(range?: INumberRange): number {
    let max: number;
    let min: number;

    if (range) {
      max = range.max;
      min = range.min;
    } else {
      max = 200;
      min = -40;
    }

    return Math.floor((Math.random() * (max - min) + min) * 10) / 10;
  }

  static pressure(range?: INumberRange): number {
    let max: number;
    let min: number;

    if (range) {
      max = range.max;
      min = range.min;
    } else {
      max = 40;
      min = 0;
    }
    return Math.floor((Math.random() * (max - min + 1) + min) * 100) / 100;
  }

  static valve(range?: INumberRange): number {
    if (range) {
      return Math.floor((Math.random() * (range.max - range.min) + range.min) * 1000) / 1000;
    } else {
      return Math.floor(Math.random() * 1000) / 1000;
    }
  }

  static pump(criteria?: number): boolean {
    if (!isNaN(criteria)) {
      return Math.floor(Math.random() * 100) / 100 < criteria;
    } else {
      return Math.floor(Math.random() * 100) / 100 < 0.5;
    }
  }
}
