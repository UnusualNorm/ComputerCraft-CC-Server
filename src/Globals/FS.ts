import Global from './Base';

class FS extends Global {
  async isDriveRoot(path: string) {
    return this.computer
      .run(`fs.isDriveRoot`, path)
      .then((out: [boolean]) => out[0]);
  }

  async complete(
    path: string,
    location: string,
    include_files?: boolean,
    include_dirs?: boolean
  ) {
    return this.computer
      .run(`fs.complete`, path, location, include_files, include_dirs)
      .then((out: [string[]]) => out[0]);
  }

  async list(path: string) {
    return this.computer
      .run(`fs.list`, path)
      .then((out: [string[]]) => out[0]);
  }
}

export default FS;
