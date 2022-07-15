import { Computer, Colors } from '../src';

export default async function (computer: Computer) {
  const colors = new Colors(computer);
  if (!(await colors.isLoaded()))
    return console.warn('Color module not found, unable to test.');

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

  // PACKRGB TESTING
  colors
    .packRGB(0.7, 0.2, 0.6)
    .then((packRGBOut) => {
      if (packRGBOut === 0xb23399) console.log('Passed color packRGB test!');
      else console.error('Failed color packRGB test...');
    })
    .catch(console.error);

  // UNPACKRGB TESTING
  colors
    .unpackRGB(0xb23399)
    .then((unpackRGBOut) => {
      if (
        // WTF is this?
        unpackRGBOut.r === 0.69803921568627 &&
        unpackRGBOut.g === 0.2 &&
        unpackRGBOut.b === 0.6
      )
        console.log('Passed color unpackRGB test!');
      else console.error('Failed color unpackRGB test...');
    })
    .catch(console.error);

  // RGB8 TESTING
  colors
    .rgb8(0xb23399)
    .then((rgb8Out) => {
      if (typeof rgb8Out == 'number')
        return console.error('Failed color rgb8 hex->rgb test type check...');

      if (rgb8Out.r === 0.69803921568627 && rgb8Out.g === 0.2 && rgb8Out.b === 0.6)
        console.log('Passed color rgb8 hex->rgb test!');
      else console.error('Failed color rgb8 hex->rgb test...');
    })
    .catch(console.error);

  colors
    .rgb8(0.7, 0.2, 0.6)
    .then((rgb8Out) => {
      if (typeof rgb8Out == 'object')
        return console.error('Failed color rgb8 rgb->hex test type check...');

      if (rgb8Out === 0xb23399) console.log('Passed color rgb8 rgb->hex test!');
      else console.error('Failed color rgb8 rgb->hex test...');
    })
    .catch(console.error);

  // TOBLIT TESTING
  colors
    .toBlit(0xb23399)
    .then((toBlitOut) => {
      if (toBlitOut == '17') console.log('Passed color toBlit test!');
      else console.error('Failed color toBlit test...');
    })
    .catch(console.error);
}
