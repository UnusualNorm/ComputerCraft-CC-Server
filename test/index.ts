import ComputerCraft from '../src/index.js';

const port = 3000;
const CCServer = new ComputerCraft.Server();

CCServer.on('connection', async (computer) => {
  computer.on('close', () => console.log('Computer has disconnected... :('));
  await computer.init;
  console.log('--------------------');
  console.log(
    `New computer connected! :)\nHosted on ${computer._HOST}.\nWith ${
      computer._CC_DEFAULT_SETTINGS
        ? `the default settings: ${computer._CC_DEFAULT_SETTINGS}.`
        : 'no default settings.'
    }`
  );
  console.log('--------------------');

  computer.eval('print("Hello World!")');
  computer.print('Hello', '"World"!');

  await computer.eval('read()');
  computer.close();
});

CCServer.listen(port);
console.log(`Listening on port ${port}!`);
