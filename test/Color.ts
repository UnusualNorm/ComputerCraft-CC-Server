import { Computer } from '../src/index';

export default async function testColor(computer: Computer) {
  const { colors } = computer.globals;

  // COMBINE TESTING
  colors
    .combine(colors.white, colors.magenta, colors.lightBlue)
    .then((combineOut) => {
      if (combineOut === 13) console.log('Passed color combine test!');
      else console.error('Failed color combine test...');
    })
    .catch(console.error);

  // SUBTRACT TESTING
  colors
    .subtract(colors.lime, colors.orange, colors.white)
    .then((subtractOut) => {
      if (subtractOut === 32) console.log('Passed color subtract test!');
      else console.error('Failed color subtract test...');
    })
    .catch(console.error);

  // TEST TESTING
  colors
    .test(13, colors.lightBlue)
    .then((testOut) => {
      if (testOut === true) console.log('Passed color test test!');
      else console.error('Failed color test test...');
    })
    .catch(console.error);

  return console.log('Finished color testing!');
}
