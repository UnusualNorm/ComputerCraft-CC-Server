import { Computer, CCLua } from '../src/index';

export default async function testBase(computer: Computer) {
  // INIT TESTING
  computer.init
    .then(() => {
      console.log('_HOST', computer._HOST);
      console.log('_CC_DEFAULT_SETTINGS', computer._CC_DEFAULT_SETTINGS);
    })
    .catch(console.error);

  // TODO: Implement string checks in data
  // EVAL TESTING
  const evalData: CCLua.JsonTypes[] = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    'foo',
    'bar',
    ['foo', 'bar'],
    //{ foo: 'bar' },
    true,
    false,
  ];
  for (let i = 0; i < evalData.length; i++) {
    const data = evalData[i];
    const out = await computer
      .eval(CCLua.paramify(data).toString())
      .catch(console.error);
    if (out && out[0] === data) console.log(`Passed eval test #${i}!`);
    else console.error(`Failed eval test #${i}...`);
  }

  // SLEEP TESTING
  const beforeSleep = Date.now();
  await computer.sleep(3).catch(console.error);
  const afterSleep = Date.now();
  const sleepTime = afterSleep - beforeSleep;
  const sleepSeconds = sleepTime / 1000;

  if (sleepSeconds >= 2.5 && sleepSeconds <= 3.5)
    console.log('Passed sleep test!');
  else console.error('Failed sleep test...');

  // WRITE TESTING
  const writeString = 'Hello\nWorld!';
  const writeLength = writeString.split('\n').length - 1;
  const writeOut = await computer.write(writeString).catch(console.error);

  if (writeOut == writeLength) console.log('Passed write test!');
  else console.error('Failed write test...');

  // PRINT TESTING
  const printString = 'Hello\nWorld!';
  const printLength = printString.split('\n').length;
  const printOut = await computer.print(printString).catch(console.error);

  if (printOut == printLength) console.log('Passed print test!');
  else console.error('Failed print test...');

  // PRINTERROR TESTING
  const printErrorString = 'Hello World!';
  await computer.printError(printErrorString).catch(console.error);
  console.warn(
    'printError() unverifiable, please manually check computer terminal...'
  );

  // READ TESTING
  const readString = 'success';
  console.log(
    'Queued read test... Please enter "success" in the terminal when prompted...'
  );
  const readOut = await computer.read().catch(console.error);
  if (readOut == readString) console.log('Passed read test!');
  else console.error('Failed read test...');

  console.log('Finished base computer testing!');
}
