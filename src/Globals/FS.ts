import Global from '../Globals';
import { paramify, toParams } from '../Interfaces/CCLua';

class FS extends Global {
  async isDriveRoot(path: string): Promise<boolean> {
    const out = await this.computer
      .eval(`disk.isDriveRoot("${path}")`)
      .then((out: [boolean]) => out);

    return out[0];
  }

  async complete(
    path: string,
    location: string,
    include_files?: boolean,
    include_dirs?: boolean
  ): Promise<string[]> {
    const out = await this.computer
      .eval(
        `disk.complete(${paramify(path)}, ${paramify(
          location
        )}, ${include_files}, ${include_dirs})`
      )
      .then((out: [string[]]) => out);

    return out[0];
  }

  async list(path: string): Promise<string[]> {
    const out = await this.computer
      .eval(`disk.list(${paramify(path)})`)
      .then((out: [string[]]) => out);

    return out[0];
  }

  async combine(path: string, ...paths: string[]): Promise<string> {
    const out = await this.computer
      .eval(`disk.combine(${paramify(path)}, ${toParams(...paths)})`)
      .then((out: [string]) => out);

    return out[0];
  }
}

export default FS;
