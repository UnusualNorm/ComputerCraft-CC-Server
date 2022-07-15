import { Computer, FS } from '../src';

export default async function (computer: Computer) {
  const fs = new FS(computer);
  if (!(await fs.isLoaded()))
    return console.warn('Color module not found, unable to test.');

  fs.open('/test.txt', 'r');
}
