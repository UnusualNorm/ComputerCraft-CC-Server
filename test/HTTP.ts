import { Computer, HTTP } from '../src';

export default async function (computer: Computer) {
  const http = new HTTP(computer);
  if (!(await http.isLoaded()))
    return console.warn('HTTP module not found, unable to test...');

  // TODO: Implement tests for HTTP module
}
