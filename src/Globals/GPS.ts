import { Coordinate } from '../ComputerCraft';
import { Global } from './Base';

export class GPS extends Global {
  readonly id = 'gps';

  async CHANNEL_GPS(): Promise<number> {
    return this.computer.get(`gps.CHANNEL_GPS`).then((out: [number]) => out[0]);
  }

  async locate(timeout = 2, debug = false): Promise<Coordinate | null> {
    return this.computer
      .run(`gps.locate`, timeout, debug)
      .then((out: [number, number, number] | [null]) =>
        out[0] != null
          ? {
              x: out[0],
              y: out[1],
              z: out[2],
            }
          : null
      );
  }
}
