import { Global } from './Base';
import { Computer } from '../Computer';
import { BlockInfo } from '../Types';

class AsyncCommands extends Global {
  readonly id = 'commands.async';
}

class Commands extends Global {
  readonly id = 'commands';

  constructor(Computer: Computer) {
    super(Computer);
    this.async = new AsyncCommands(Computer);
  }

  public native: null;
  public async: AsyncCommands;

  async exec(
    command: string
  ): Promise<{ success: boolean; output: string[]; affected: number }> {
    return this.computer
      .run(`commands.exec`, command)
      .then((out: [boolean, string[], number | null]) => ({
        success: out[0],
        output: out[1],
        affected: out[2],
      }));
  }

  async execAsync(command: string) {
    return this.computer
      .run(`commands.execAsync`, command)
      .then((out: [number]) => out[0]);
  }

  async list(...commands: string[]): Promise<string[]> {
    return this.computer
      .eval(`commands.list`, ...commands)
      .then((out: [string[]]) => out[0]);
  }

  async getBlockPosition() {
    return this.computer
      .run('commands.getBlockPosition')
      .then((out: [number, number, number]) => ({
        x: out[0],
        y: out[1],
        z: out[2],
      }));
  }

  async getBlockInfos(
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
    dimension?: string
  ) {
    return this.computer
      .run(
        `commands.getBlockInfos`,
        minX,
        minY,
        minZ,
        maxX,
        maxY,
        maxZ,
        dimension
      )
      .then((out: [BlockInfo[]]) => out[0]);
  }

  async getBlockInfo(x: number, y: number, z: number, dimension?: string) {
    return this.computer
      .run(`commands.getBlockInfos`, x, y, z, dimension)
      .then((out: [BlockInfo]) => out[0]);
  }
}

export { Commands };
