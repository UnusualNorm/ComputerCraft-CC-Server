import { BlockInfo, Coordinate } from '../ComputerCraft';
import { Global } from './Base';

export class Commands extends Global {
  readonly id = 'commands';

  async exec(command: string): Promise<{
    success: boolean;
    output: string[];
    affected: number | null;
  }> {
    return this.computer
      .run(`commands.exec`, command)
      .then((out: [boolean, string[], number | null]) => ({
        success: out[0],
        output: out[1],
        affected: out[2],
      }));
  }

  async execAsync(command: string): Promise<number> {
    return this.computer
      .run(`commands.execAsync`, command)
      .then((out: [number]) => out[0]);
  }

  async list(...arg: string[]): Promise<string[]> {
    return this.computer
      .eval(`commands.list`, ...arg)
      .then((out: [string[] | Record<string, never>]) =>
        Array.isArray(out[0]) ? out[0] : []
      );
  }

  async getBlockPosition(): Promise<Coordinate> {
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
  ): Promise<BlockInfo[]> {
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
      .then((out: [BlockInfo[] | Record<string, never>]) =>
        Array.isArray(out[0]) ? out[0] : []
      );
  }

  async getBlockInfo(
    x: number,
    y: number,
    z: number,
    dimension?: string
  ): Promise<BlockInfo> {
    return this.computer
      .run(`commands.getBlockInfos`, x, y, z, dimension)
      .then((out: [BlockInfo]) => out[0]);
  }
}
