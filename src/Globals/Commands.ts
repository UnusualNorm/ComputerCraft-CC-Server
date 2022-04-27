import Global from '../Globals';
import Computer from '../Computer';
import { paramify, toParams } from '../Interfaces/CCLua';

class AsyncCommands extends Global {}

class Commands extends Global {
  constructor(Computer: Computer) {
    super(Computer);

    this.async = new AsyncCommands(Computer);
  }

  public native: null;
  public async: AsyncCommands;

  async exec(
    command: string
  ): Promise<{ success: boolean; output: string[]; affected: number }> {
    const out = await this.computer
      .eval(`commands.exec(${paramify(command)})`)
      .then((out: [boolean, string[], number]) => out);

    return { success: out[0], output: out[1], affected: out[2] };
  }

  async execAsync(command: string): Promise<number> {
    const out = await this.computer
      .eval(`commands.execAsync(${paramify(command)})`)
      .then((out: [number]) => out);

    return out[0];
  }

  async list(...commands: string[]): Promise<string[]> {
    const out = await this.computer
      .eval(`commands.list(${toParams(...commands)})`)
      .then((out: [string[]]) => out);

    return out[0];
  }

  async getBlockPosition(): Promise<{ x: number; y: number; z: number }> {
    const out = await this.computer
      .eval('commands.getBlockPosition()')
      .then((out: [number, number, number]) => out);

    return {
      x: out[0],
      y: out[1],
      z: out[2],
    };
  }

  async getBlockInfos(
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
    dimension?: string
  ): Promise<Record<string, unknown>[]> {
    const out = await this.computer
      .eval(
        `commands.getBlockInfos(${minX}, ${minY}, ${minZ}, ${maxX}, ${maxY}, ${maxZ}, ${paramify(
          dimension
        )})`
      )
      .then((out: [Record<string, unknown>[]]) => out);

    return out[0];
  }

  async getBlockInfo(
    x: number,
    y: number,
    z: number,
    dimension?: string
  ): Promise<Record<string, unknown>> {
    const out = await this.computer
      .eval(`commands.getBlockInfos(${x}, ${y}, ${z}, ${paramify(dimension)})`)
      .then((out: [Record<string, unknown>]) => out);

    return out[0];
  }
}

export default Commands;