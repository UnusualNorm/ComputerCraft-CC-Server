import { Computer, CCLua } from '../src/index';

export default async function testBase(computer: Computer) {
  // INIT TESTING
  computer.init
    .then(() => {
      console.log('Computer _HOST:', computer._HOST);
      console.log(
        'Computer _CC_DEFAULT_SETTINGS:',
        computer._CC_DEFAULT_SETTINGS
      );
    })
    .catch(console.error);

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
    if (out && out[0] === data) console.log(`Passed computer eval test #${i}!`);
    else console.error(`Failed computer eval test #${i}...`);
  }

  // CALLBACK TESTING
  const cb = () => ['Hello World!'];
  const cbId = await computer.callback(cb);
  const cbRId = await computer.eval(`RemoteCallbacks[${CCLua.paramify(cbId)}]`);
  const cbOut = await computer.runCallback(String(cbRId));
  console.log(cbOut);

  // SLEEP TESTING
  const beforeSleep = Date.now();
  await computer.sleep(3).catch(console.error);
  const afterSleep = Date.now();
  const sleepTime = afterSleep - beforeSleep;
  const sleepSeconds = sleepTime / 1000;

  if (sleepSeconds >= 2.5 && sleepSeconds <= 3.5)
    console.log('Passed computer sleep test!');
  else console.error('Failed computer sleep test...');

  // WRITE TESTING
  const writeString = 'Hello\nWorld!';
  const writeLength = writeString.split('\n').length - 1;
  const writeOut = await computer.write(writeString).catch(console.error);

  if (writeOut == writeLength) console.log('Passed computer write test!');
  else console.error('Failed computer write test...');

  // PRINT TESTING
  const printString = 'Hello\nWorld!';
  const printLength = printString.split('\n').length;
  const printOut = await computer.print(printString).catch(console.error);

  if (printOut == printLength) console.log('Passed computer print test!');
  else console.error('Failed computer print test...');

  // PRINTERROR TESTING
  const printErrorString = 'Hello World!';
  await computer.printError(printErrorString).catch(console.error);
  console.warn(
    'Computer error printing unverifiable, please manually check computer terminal...'
  );

  // READ TESTING
  const readString = 'success';
  console.log(
    'Queued computer read test... Please enter "success" in the terminal when prompted...'
  );
  const readOut = await computer
    .read(
      undefined,
      ['success', 'failure'],
      async (partial) => {
        console.log(`Computer read requested auto-fill for "${partial}"!`);
        const autoFill = ['success', 'failure'];
        const prompt = autoFill.filter((s) => s.startsWith(partial));

        if (prompt)
          for (let i = 0; i < prompt.length; i++) {
            const fill = prompt[i];
            prompt[i] = fill.substring(partial.length);
          }
        //else if (partial == '') prompt = autoFill;

        return prompt;
      },
      'failure'
    )
    .catch(console.error);
  if (readOut == readString) console.log('Passed computer read test!');
  else console.error('Failed computer read test...');

  return console.log('Finished computer testing!');
}
