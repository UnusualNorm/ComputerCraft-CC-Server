import { Global } from './Base';

export interface ReadHandle {
  readLine(withTrailing?: boolean): Promise<null | string>;
  readAll(): Promise<null | string>;
  read(count: number): Promise<string | null>;
  close(): Promise<void>;
}

interface RawReadHandle {
  readLine(withTrailing?: boolean): Promise<[null | string]>;
  readAll(): Promise<[null | string]>;
  read(count: number): Promise<[string | null]>;
  close(): Promise<[void]>;
}

export interface BinaryReadHandle {
  read(count?: number): Promise<null | number | string>;
  readAll(): Promise<string | null>;
  readLine(withTrailing?: boolean): Promise<string | null>;
  close(): Promise<void>;
  seek(whence?: 'set' | 'cur' | 'end', offset?: number): Promise<number>;
}

interface RawBinaryReadHandle {
  read(count: number): Promise<[null | number | string]>;
  readAll(): Promise<[string | null]>;
  readLine(withTrailing?: boolean): Promise<[string | null]>;
  close(): Promise<[void]>;
  seek(
    whence?: 'set' | 'cur' | 'end',
    offset?: number
  ): Promise<[number] | [null, string]>;
}

export interface WriteHandle {
  write(value: string): Promise<void>;
  writeLine(value: string): Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
}

interface RawWriteHandle {
  write(value: string): Promise<[void]>;
  writeLine(value: string): Promise<[void]>;
  flush(): Promise<[void]>;
  close(): Promise<[void]>;
}

export interface BinaryWriteHandle {
  write(arg: number | string): Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
  seek(whence?: 'set' | 'cur' | 'end', offset?: number): Promise<number>;
}

interface RawBinaryWriteHandle {
  write(arg: number | string): Promise<[void]>;
  flush(): Promise<[void]>;
  close(): Promise<[void]>;
  seek(
    whence?: 'set' | 'cur' | 'end',
    offset?: number
  ): Promise<[number] | [null, string]>;
}

export type FileAttributes = {
  size: number;
  isDir: boolean;
  isReadOnly: boolean;
  created: number;
  modified: number;
};

type AnyFileHandle =
  | RawReadHandle
  | RawWriteHandle
  | RawBinaryReadHandle
  | RawBinaryWriteHandle
  | ReadHandle
  | WriteHandle
  | BinaryReadHandle
  | BinaryWriteHandle;

type AnyReadHandle =
  | RawReadHandle
  | RawBinaryReadHandle
  | ReadHandle
  | BinaryReadHandle;
type AnyWriteHandle =
  | RawWriteHandle
  | RawBinaryWriteHandle
  | WriteHandle
  | BinaryWriteHandle;
type AnyBinaryHandle =
  | RawBinaryReadHandle
  | BinaryReadHandle
  | RawBinaryWriteHandle
  | BinaryWriteHandle;

export function isReadHandle(handle: AnyFileHandle): handle is AnyReadHandle {
  return 'read' in handle;
}

export function isWriteHandle(handle: AnyFileHandle): handle is AnyWriteHandle {
  return 'write' in handle;
}

export function isBinaryHandle(
  handle: AnyFileHandle
): handle is AnyBinaryHandle {
  return 'seek' in handle;
}

export type FSNetworkedType =
  | RawReadHandle
  | RawWriteHandle
  | RawBinaryReadHandle
  | RawBinaryWriteHandle
  | FileAttributes;

class FS extends Global {
  readonly id = 'fs';

  async isDriveRoot(path: string): Promise<boolean> {
    return this.computer
      .run(`fs.isDriveRoot`, path)
      .then((out: [boolean]) => out[0]);
  }

  async complete(
    path: string,
    location: string,
    include_files?: boolean,
    include_dirs?: boolean
  ): Promise<string[]> {
    return this.computer
      .run(`fs.complete`, path, location, include_files, include_dirs)
      .then((out: [string[] | Record<string, never>]) =>
        Array.isArray(out[0]) ? out[0] : []
      );
  }

  async list(path: string): Promise<string[]> {
    return this.computer
      .run(`fs.list`, path)
      .then((out: [string[] | Record<string, never>]) =>
        Array.isArray(out[0]) ? out[0] : []
      );
  }

  async combine(path: string, ...paths: string[]): Promise<string> {
    return this.computer
      .run(`fs.combine`, path, ...paths)
      .then((out: [string]) => out[0]);
  }

  async getName(path: string): Promise<string> {
    return this.computer
      .run(`fs.getName`, path)
      .then((out: [string]) => out[0]);
  }

  async getDir(path: string): Promise<string> {
    return this.computer.run(`fs.getDir`, path).then((out: [string]) => out[0]);
  }

  async getSize(path: string): Promise<number> {
    return this.computer
      .run(`fs.getSize`, path)
      .then((out: [number]) => out[0]);
  }

  async exists(path: string): Promise<boolean> {
    return this.computer
      .run(`fs.exists`, path)
      .then((out: [boolean]) => out[0]);
  }

  async isDir(path: string): Promise<boolean> {
    return this.computer.run(`fs.isDir`, path).then((out: [boolean]) => out[0]);
  }

  async isReadOnly(path: string): Promise<boolean> {
    return this.computer
      .run(`fs.isReadOnly`, path)
      .then((out: [boolean]) => out[0]);
  }

  async makeDir(path: string): Promise<void> {
    await this.computer.run(`fs.makeDir`, path);
    return;
  }

  async move(path: string, dest: string): Promise<void> {
    await this.computer.run(`fs.move`, path, dest);
    return;
  }

  async copy(path: string, dest: string): Promise<void> {
    await this.computer.run(`fs.copy`, path, dest);
    return;
  }

  async delete(path: string): Promise<void> {
    await this.computer.run(`fs.delete`, path);
    return;
  }

  async open(
    path: string,
    mode: 'r' | 'rb' | 'w' | 'wb' | 'a' | 'ab'
  ): Promise<ReadHandle | WriteHandle | BinaryReadHandle | BinaryWriteHandle> {
    return this.computer
      .run(`fs.open`, path, mode)
      .then(
        (
          out: [
            | RawReadHandle
            | RawWriteHandle
            | RawBinaryReadHandle
            | RawBinaryWriteHandle
          ]
        ) => {
          const rawHandle = out[0];
          if (isReadHandle(rawHandle) && !isBinaryHandle(rawHandle)) {
            const handle: ReadHandle = {
              readLine: async (withTrailing?) =>
                (await rawHandle.readLine(withTrailing))[0],
              readAll: async () => (await rawHandle.readAll())[0],
              read: async (count) => (await rawHandle.read(count))[0],
              close: async () => (await rawHandle.close())[0],
            };

            return handle;
          } else if (isWriteHandle(rawHandle) && !isBinaryHandle(rawHandle)) {
            const handle: WriteHandle = {
              write: async (data) => (await rawHandle.write(data))[0],
              writeLine: async (line) => (await rawHandle.writeLine(line))[0],
              flush: async () => (await rawHandle.flush())[0],
              close: async () => (await rawHandle.close())[0],
            };

            return handle;
          } else if (isReadHandle(rawHandle) && isBinaryHandle(rawHandle)) {
            const handle: BinaryReadHandle = {
              read: async (count?) => (await rawHandle.read(count))[0],
              readAll: async () => (await rawHandle.readAll())[0],
              readLine: async (withTrailing?) =>
                (await rawHandle.readLine(withTrailing))[0],
              close: async () => (await rawHandle.close())[0],
              seek: async (whence, offset) =>
                (await rawHandle.seek(whence, offset))[0],
            };

            return handle;
          } else if (isWriteHandle(rawHandle) && isBinaryHandle(rawHandle)) {
            const handle: BinaryWriteHandle = {
              write: async (data) => (await rawHandle.write(data))[0],
              flush: async () => (await rawHandle.flush())[0],
              close: async () => (await rawHandle.close())[0],
              seek: async (whence, offset) =>
                (await rawHandle.seek(whence, offset))[0],
            };

            return handle;
          }
        }
      );
  }

  async getDrive(path: string): Promise<string> {
    return this.computer
      .run(`fs.getDrive`, path)
      .then((out: [string]) => out[0]);
  }

  async getFreeSpace(path: string): Promise<number | 'unlimited'> {
    return this.computer
      .run(`fs.getFreeSpace`, path)
      .then((out: [number | 'unlimited']) => out[0]);
  }

  async find(path: string): Promise<string[]> {
    return this.computer
      .run(`fs.find`, path)
      .then((out: [string[] | Record<string, never>]) =>
        Array.isArray(out[0]) ? out[0] : []
      );
  }

  async getCapacity(path: string): Promise<number> {
    return this.computer
      .run(`fs.getCapacity`, path)
      .then((out: [number | null]) => out[0]);
  }

  async attributes(path: string): Promise<FileAttributes> {
    return this.computer
      .run(`fs.attributes`, path)
      .then((out: [FileAttributes]) => out[0]);
  }
}

export { FS };
