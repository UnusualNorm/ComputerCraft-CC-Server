import { Server as CCServer } from '../src';
import testComputer from './Computer';
import testColors from './Colors';
import testFS from './FS';

const port = 3000;
const server = new CCServer();

server.on('connection', (computer) => {
  console.log('Computer has connected!');
  testComputer(computer);
  testColors(computer);
  testFS(computer);
});

server.listen(port);
console.log(`Listening on port ${port}!`);
