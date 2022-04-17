import { Server as CCServer } from '../src/index.js';
import testBase from './Base.js';

const port = 3000;
const server = new CCServer();

server.on('connection', async (computer) => {
  console.log('Computer has connected!');
  testBase(computer);
  computer.on('close', () => console.log('Computer has disconnected...'));
});

server.listen(port);
console.log(`Listening on port ${port}!`);
