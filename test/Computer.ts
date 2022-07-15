import { CommonTypes, Computer } from '../src';
import _ from 'underscore';
import { NetworkedCallback } from '../src/Types/Computer';

export default async function (computer: Computer) {
  // _HOST TESTING
  computer._HOST
    .then((host) => console.log('Computer _HOST:', host))
    .catch(console.error);

  // _CC_DEFAULT_SETTINGS
  computer._CC_DEFAULT_SETTINGS
    .then((settings) => console.log('Computer _CC_DEFAULT_SETTINGS:', settings))
    .catch(console.error);

  // EVAL TESTING
  const evalData: CommonTypes[] = [
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
    { foo: 'bar' },
    true,
    false,
  ];

  for (let i = 0; i < evalData.length; i++) {
    const data = evalData[i];
    computer
      .eval('return arg[1]', data)
      .then((out) => {
        if (_.isEqual(out[0], data))
          console.log(`Passed computer eval test #${i}!`);
        else console.error(`Failed computer eval test #${i}... `, out);
      })
      .catch(console.error);
  }

  // CALLBACK TESTING
  const cb: NetworkedCallback = () => ['Hello World!'];
  computer
    .eval('return arg[1]', cb)
    .then((out) => {
      const fn = out[0];
      if (typeof fn == 'function') return fn();
      else return '';
    })
    .then((cbOut) => {
      if (_.isEqual(cbOut, cb())) console.log('Passed computer callback test!');
      else console.error('Failed computer callback test...');
    });

  // SLEEP TESTING
  const beforeSleep = Date.now();
  computer
    .sleep(3)
    .then(() => {
      // Calculate ammount of time
      const afterSleep = Date.now();
      const sleepTime = afterSleep - beforeSleep;

      // Account for latency
      if (sleepTime >= 2500 && sleepTime <= 3500)
        console.log('Passed computer sleep test!');
      else console.error('Failed computer sleep test...');
    })
    .catch(console.error);

  // WRITE TESTING
  const writeString = 'Hello\nWorld!';
  const writeLength = writeString.split('\n').length - 1;
  computer
    .write(writeString)
    .then((writeOut) => {
      if (writeOut == writeLength) console.log('Passed computer write test!');
      else console.error('Failed computer write test...');
    })
    .catch(console.error);

  // PRINT TESTING
  const printString = 'Hello\nWorld!';
  const printLength = printString.split('\n').length;
  computer
    .print(printString)
    .then((printOut) => {
      if (printOut == printLength) console.log('Passed computer print test!');
      else console.error('Failed computer print test...');
    })
    .catch(console.error);

  // PRINTERROR TESTING
  const printErrorString = 'Hello World!';
  computer
    .printError(printErrorString)
    .then(() =>
      console.warn(
        'Computer error printing unverifiable, please manually check computer terminal...'
      )
    )
    .catch(console.error);

  // READ TESTING
  const readString = 'success';
  console.log(
    'Queued computer read test... Please enter "success" in the terminal when prompted...'
  );

  computer
    .read(
      undefined,
      ['success', 'failure'],
      (partial) => {
        console.log(`Computer read requested auto-fill for "${partial}"!`);
        const autoFill = ['success', 'failure'];
        const prompt = autoFill.filter((s) => s.startsWith(partial));

        for (let i = 0; i < prompt.length; i++) {
          const fill = prompt[i];
          prompt[i] = fill.substring(partial.length);
        }

        return prompt;
      },
      'failure'
    )
    .then((readOut) => {
      if (readOut == readString) console.log('Passed computer read test!');
      else console.error('Failed computer read test...');
    })
    .catch(console.error);
}
