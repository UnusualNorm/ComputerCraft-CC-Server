export interface ReadHandle {
  readLine(withTrailing?: boolean): Promise<null | string>;
  readAll(): Promise<null | string>;
  read(count: number): Promise<string | null>;
  close(): Promise<void>;
}

export interface RawReadHandle {
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

export interface RawBinaryReadHandle {
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

export interface RawWriteHandle {
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

export interface RawBinaryWriteHandle {
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

export interface FSInterface {
  isDriveRoot(path: string): Promise<boolean>;
  complete(
    path: string,
    location: string,
    include_files?: boolean,
    include_dirs?: boolean
  ): Promise<string[]>;
  list(path: string): Promise<string[]>;
  combine(path: string, ...paths: string[]): Promise<string>;
  getName(path: string): Promise<string>;
  getDir(path: string): Promise<string>;
  getSize(path: string): Promise<number>;
  exists(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;
  isReadOnly(path: string): Promise<boolean>;
  makeDir(path: string): Promise<void>;
  move(path: string, dest: string): Promise<void>;
  copy(path: string, dest: string): Promise<void>;
  delete(path: string): Promise<void>;
  open(
    path: string,
    mode: 'r' | 'rb' | 'w' | 'wb' | 'a' | 'ab'
  ): Promise<ReadHandle | WriteHandle | BinaryReadHandle | BinaryWriteHandle>;
  getDrive(path: string): Promise<string>;
  getFreeSpace(path: string): Promise<number | 'unlimited'>;
  find(path: string): Promise<string[]>;
  getCapacity(path: string): Promise<number | null>;
  attributes(path: string): Promise<FileAttributes>;
}

type AllFileHandles =
  | RawReadHandle
  | RawWriteHandle
  | RawBinaryReadHandle
  | RawBinaryWriteHandle
  | ReadHandle
  | WriteHandle
  | BinaryReadHandle
  | BinaryWriteHandle;

type AllReadHandles =
  | RawReadHandle
  | RawBinaryReadHandle
  | ReadHandle
  | BinaryReadHandle;
type AllWriteHandles =
  | RawWriteHandle
  | RawBinaryWriteHandle
  | WriteHandle
  | BinaryWriteHandle;
type AllBinaryHandles =
  | RawBinaryReadHandle
  | BinaryReadHandle
  | RawBinaryWriteHandle
  | BinaryWriteHandle;

export function isReadHandle(handle: AllFileHandles): handle is AllReadHandles {
  return Object.keys(handle).includes('read');
}

export function isWriteHandle(
  handle: AllFileHandles
): handle is AllWriteHandles {
  return Object.keys(handle).includes('write');
}

export function isBinaryHandle(
  handle: AllFileHandles
): handle is AllBinaryHandles {
  return Object.keys(handle).includes('seek');
}

export type FSGlobalNewtworkedTypes =
  | RawReadHandle
  | RawWriteHandle
  | RawBinaryReadHandle
  | RawBinaryWriteHandle
  | FileAttributes;
