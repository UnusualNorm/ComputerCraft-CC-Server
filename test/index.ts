import { Server as CCServer } from '../src/index';
import testBase from './Computer';
import testColor from './Color';

const port = 3000;
const server = new CCServer();

server.on('connection', async (computer) => {
  console.log('Computer has connected!');
  await testBase(computer);
  await testColor(computer);
  await computer.close();
  computer.on('close', () => console.log('Computer has disconnected...'));
});

server.listen(port);
console.log(`Listening on port ${port}!`);
