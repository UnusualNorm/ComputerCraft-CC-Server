import Global from './Base';
import { paramify, toParams } from '../Interfaces/CCLua';

class FS extends Global {
  async isDriveRoot(path: string): Promise<boolean> {
    const out = await this.computer
      .eval(`fs.isDriveRoot("${path}")`)
      .then((out: [boolean]) => out);

    return out[0];
  }

  async complete(
    path: string,
    location: string,
    include_files?: boolean,
    include_dirs?: boolean
  ): Promise<{ [x: string]: string } | string[]> {
    return this.computer
      .eval(
        `fs.complete(${paramify(path)}, ${paramify(
          location
        )}, ${include_files}, ${include_dirs})`
      )
      .then((out: [string[]]) => out[0]);
  }

  async list(path: string): Promise<{ [x: string]: string } | string[]> {
    return this.computer
      .eval(`fs.list(${paramify(path)})`)
      .then((out: [string[]]) => out[0]);
  }

  async combine(path: string, ...paths: string[]): Promise<string> {
    return this.computer
      .eval(`fs.combine(${paramify(path)}, ${toParams(...paths)})`)
      .then((out: [string]) => out[0]);
  }

  async getName(path: string): Promise<string> {
    return this.computer
      .eval(`f.getName(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async getDir(path: string): Promise<string> {
    return this.computer
      .eval(`fs.getDir(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async getSize(path: string): Promise<string | number> {
    return this.computer
      .eval(`fs.getSize(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async exists(path: string): Promise<string | boolean> {
    return this.computer
      .eval(`fs.exists(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async isDir(path: string): Promise<string | boolean> {
    return this.computer
      .eval(`fs.isDir(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async isReadOnly(path: string): Promise<string | boolean> {
    return this.computer
      .eval(`fs.isReadOnly(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async makeDir(path: string): Promise<string | void> {
    return this.computer
      .eval(`fs.makeDir(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async move(path: string, dest: string): Promise<string | void> {
    return this.computer
      .eval(`fs.move(${paramify(path)}, ${paramify(dest)})`)
      .then((out: [string]) => out[0]);
  }

  async copy(path: string, dest: string): Promise<string | void> {
    return this.computer
      .eval(`fs.copy(${paramify(path)}, ${paramify(dest)})`)
      .then((out: [string]) => out[0]);
  }

  async delete(path: string): Promise<string | void> {
    return this.computer
      .eval(`fs.delete(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async open(
    path: string,
    mode: string
  ): Promise<string | Record<string, unknown> | null> {
    return this.computer
      .eval(`fs.open(${paramify(path)}, ${paramify(mode)})`)
      .then((out: [string]) => out[0]);
  }

  async getDrive(path: string): Promise<string> {
    return this.computer
      .eval(`fs.getDrive(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async getFreeSpace(path: string): Promise<string | number | 'unlimited'> {
    return this.computer
      .eval(`fs.getFreeSpace(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async find(path: string): Promise<string | { [x: string]: string }> {
    return this.computer
      .eval(`fs.find(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async getCapacity(path: string): Promise<string | number | null> {
    return this.computer
      .eval(`fs.getCapacity(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  async attributes(path: string): Promise<
    | string
    | {
        size: number;
        isDir: boolean;
        isReadOnly: boolean;
        created: number;
        modified: number;
      }
  > {
    return this.computer
      .eval(`fs.attributes(${paramify(path)})`)
      .then((out: [string]) => out[0]);
  }

  ReadHandle = {
    async readLine(withTrailing?: boolean): Promise<string | null> {
      return this.computer
        .eval(`fs.readLine(${paramify(withTrailing)})`)
        .then((out: [string]) => out[0]);
    },

    async readAll(): Promise<string | null> {
      return this.computer.eval(`fs.readAll()`).then((out: [string]) => out[0]);
    },

    async read(count?: boolean): Promise<string | null> {
      return this.computer
        .eval(`fs.read(${paramify(count)})`)
        .then((out: [string]) => out[0]);
    },

    async close(): Promise<string | void> {
      return this.computer.eval(`fs.close()`).then((out: [string]) => out[0]);
    },
  };

  BinaryReadHandle = {
    async readLine(withTrailing?: boolean): Promise<string | null> {
      return this.computer
        .eval(`fs.readLine(${paramify(withTrailing)})`)
        .then((out: [string]) => out[0]);
    },

    async readAll(): Promise<string | null> {
      return this.computer.eval(`fs.readAll()`).then((out: [string]) => out[0]);
    },

    async read(count?: number): Promise<string | null> {
      return this.computer
        .eval(`fs.read(${paramify(count)})`)
        .then((out: [string]) => out[0]);
    },

    async close(): Promise<string | void> {
      return this.computer.eval(`fs.close()`).then((out: [string]) => out[0]);
    },

    async seek(
      whence?: string,
      offset?: number
    ): Promise<string | number | null> {
      return this.computer
        .eval(`fs.seek(${paramify(whence)}, ${paramify(offset)})`)
        .then((out: [string]) => out[0]);
    },
  };

  WriteHandle = {};
}

export default FS;
