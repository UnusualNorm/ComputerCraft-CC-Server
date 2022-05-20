import Global from './Base';

class FS extends Global {
  async isDriveRoot(path: string): Promise<boolean> {
    const out = await this.computer
      .run(`fs.isDriveRoot`, path)
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
      .run(`fs.complete`, path, location, include_files, include_dirs)
      .then((out: [string[]]) => out);
    return out[0];
  }

  async list(path: string): Promise<string[]> {
    const out = await this.computer
      .run(`fs.list`, path)
      .then((out: [string[]]) => out);
    return out[0];
  }
}

export default FS;
