import { Server as CCServer } from '../src/index';
import testComputer from './Computer';
import testColor from './Color';

const port = 3000;
const server = new CCServer();

server.on('connection', (computer) => {
  console.log('Computer has connected!');
  testComputer(computer);
  testColor(computer);
});

server.listen(port);
console.log(`Listening on port ${port}!`);
