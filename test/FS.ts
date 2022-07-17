import {
  Computer,
  FS,
  isBinaryHandle,
  isReadHandle,
  isWriteHandle,
} from '../src';

export default async function (computer: Computer) {
  const fs = new FS(computer);
  if (!(await fs.isLoaded()))
    return console.warn('FS module not found, unable to test.');

  // TODO: Implement tests for FS module
}
