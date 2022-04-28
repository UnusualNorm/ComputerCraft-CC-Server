import { Computer, Globals } from '../src/index';
const { Colors } = Globals;

export default async function testColor(computer: Computer) {
  const colors = new Colors(computer);

  // COMBINE TESTING
  const combineOut = await colors
    .combine(colors.white, colors.magenta, colors.lightBlue)
    .catch(console.error);

  if (combineOut === 13) console.log('Passed color combine test!');
  else console.error('Failed color combine test...');

  // SUBTRACT TESTING
  const subtractOut = await colors
    .subtract(colors.lime, colors.orange, colors.white)
    .catch(console.error);

  if (subtractOut === 32) console.log('Passed color subtract test!');
  else console.error('Failed color subtract test...');

  // TEST TESTING
  if (combineOut === 13) {
    const testOut = await colors
      .test(combineOut, colors.lightBlue)
      .catch(console.error);

    if (testOut === true) console.log('Passed color test test!');
    else console.error('Failed color test test...');
  } else console.warn('Unable to test test due to combine test failing...');
}
