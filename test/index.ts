import { Server as CCServer } from '../src/index';
import testBase from './Computer';
import testColor from './Color';

const port = 3000;
const server = new CCServer();

server.on('connection', async (computer) => {
  console.log('Computer has connected!');
  computer.on('alarm', (id) => {
    id;
  });
  testBase(computer);
  testColor(computer);
});

server.listen(port);
console.log(`Listening on port ${port}!`);
