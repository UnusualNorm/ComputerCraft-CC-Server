import { Base } from '../Computers';
import { toParams } from '../lua';

interface Colouors {
  /**
   * @deprecated Use packRGB or unpackRGB directly.
   * @description Either calls colors.packRGB or colors.unpackRGB, depending on how many arguments it receives.
   * @param r number The red channel, as an argument to colors.packRGB.
   * @param g number The green channel, as an argument to colors.packRGB.
   * @param b number The blue channel, as an argument to colors.packRGB.
   * @returns The combined hexadecimal colour, as returned by colors.packRGB.
   * @example await colors.rgb8(0xb23399); // => 0.7, 0.2, 0.6
   * @example await colors.rgb8(0.7, 0.2, 0.6); // => 0xb23399
   */
  rgb8(r: number, g: number, b: number): Promise<number>;

  /**
   * @deprecated Use packRGB or unpackRGB directly.
   * @description Either calls colors.packRGB or colors.unpackRGB, depending on how many arguments it receives.
   * @param rgb The combined hexadecimal color, as an argument to colors.unpackRGB.
   * @returns The red channel, as returned by colors.unpackRGB
   * @returns The green channel, as returned by colors.unpackRGB
   * @returns The blue channel, as returned by colors.unpackRGB
   * @example await colors.rgb8(0xb23399); // => 0.7, 0.2, 0.6
   * @example await colors.rgb8(0.7, 0.2, 0.6); // => 0xb23399
   */
  rgb8(rgb: number): Promise<[number, number, number]>;
}

/**
 * @description
 * The Colors API allows you to manipulate sets of colors.
 *
 * This is useful in conjunction with Bundled Cables from the RedPower mod, RedNet Cables from the MineFactory Reloaded mod, and colors on Advanced Computers and Advanced Monitors.
 *
 * For the non-American English version just replace colors with colours and it will use the other API, colours which is exactly the same, except in British English (e.g. colors.gray is spelt colours.grey).
 *
 * On basic terminals (such as the Computer and Monitor), all the colors are converted to grayscale. This means you can still use all 16 colors on the screen, but they will appear as the nearest tint of gray. You can check if a terminal supports color by using the function term.isColor.
 *
 * Grayscale colors are calculated by taking the average of the three components, i.e. (red + green + blue) / 3.
 * @todo Convert to native Javascript.
 */
class Colouors {
  private computer: Base;

  constructor(Computer: Base) {
    this.computer = Computer;
  }

  /** @description Written as 0 in paint files and term.blit, has a default terminal colour of #F0F0F0. */
  readonly white = 0x1;
  /** @description Written as 1 in paint files and term.blit, has a default terminal colour of #F2B233. */
  readonly orange = 0x2;
  /** @description Written as 2 in paint files and term.blit, has a default terminal colour of #E57FD8. */
  readonly magenta = 0x4;
  /** @description Written as 3 in paint files and term.blit, has a default terminal colour of #99B2F2. */
  readonly lightBlue = 0x8;
  /** @description Written as 4 in paint files and term.blit, has a default terminal colour of #DEDE6C. */
  readonly yellow = 0x10;
  /** @description Written as 5 in paint files and term.blit, has a default terminal colour of #7FCC19. */
  readonly lime = 0x20;
  /** @description Written as 6 in paint files and term.blit, has a default terminal colour of #F2B2CC. */
  readonly pink = 0x40;

  /** @description Written as 9 in paint files and term.blit, has a default terminal colour of #4C99B2. */
  readonly cyan = 0x200;
  /** @description Written as 10 in paint files and term.blit, has a default terminal colour of #B266E5. */
  readonly purple = 0x400;
  /** @description Written as 11 in paint files and term.blit, has a default terminal colour of #3366CC. */
  readonly blue = 0x800;
  /** @description Written as 12 in paint files and term.blit, has a default terminal colour of #7F664C. */
  readonly brown = 0x1000;
  /** @description Written as 13 in paint files and term.blit, has a default terminal colour of #57A64E. */
  readonly green = 0x2000;
  /** @description Written as 14 in paint files and term.blit, has a default terminal colour of #CC4C4C. */
  readonly red = 0x4000;
  /** @description Written as 15 in paint files and term.blit, has a default terminal colour of #111111. */
  readonly black = 0x8000;

  /**
   * @description Combines a set of colors (or sets of colors) into a larger set. Useful for Bundled Cables.
   * @param colors The colors to combine.
   * @returns The union of the color sets given in ...
   * @example colors.combine(colors.white, colors.magenta, colours.lightBlue) // => 13
   */
  async combine(...colors: number[]): Promise<number> {
    const out = await this.computer
      .eval(`combine(${toParams(...colors)})`)
      .then((out: [number, null]) => out);
    return out[0];
  }

  /**
   * @description Removes one or more colors (or sets of colors) from an initial set. Useful for Bundled Cables.
   * Each parameter beyond the first may be a single color or may be a set of colors (in the latter case, all colors in the set are removed from the original set).
   * @param color The color from which to subtract.
   * @param colors The colors to subtract.
   * @returns The resulting color.
   * @example colours.subtract(colours.lime, colours.orange, colours.white)
   */
  async subtract(color: number, ...colors: number[]): Promise<number> {
    const out = await this.computer
      .eval(`subtract(${toParams(color, ...colors)})`)
      .then((out: [number, null]) => out);
    return out[0];
  }

  /**
   * @description Tests whether color is contained within colors. Useful for Bundled Cables.
   * @param colors A color, or color set
   * @param color A color or set of colors that colors should contain.
   * @returns If colors contains all colors within color.
   * @example
   * const colorSet = await colors.combine(colors.white, colors.magenta, colours.lightBlue);
   * await colors.test(colorSet, colors.lightBlue); // => true
   */
  async test(colors: number, color: number): Promise<boolean> {
    const out = await this.computer
      .eval(`test(${toParams(colors)}, ${color})`)
      .then((out: [boolean, ...null[]]) => out);
    return out[0];
  }

  /**
   * @description Combine a three-colour RGB value into one hexadecimal representation.
   * @param r The red channel, should be between 0 and 1.
   * @param g The green channel, should be between 0 and 1.
   * @param b The blue channel, should be between 0 and 1.
   * @returns The combined hexadecimal colour.
   * @example await colors.packRGB(0.7, 0.2, 0.6); // => 0xb23399
   */
  async packRGB(r: number, g: number, b: number): Promise<number> {
    const out = await this.computer
      .eval(`combine(${r}, ${g}, ${b})`)
      .then((out: [number, null]) => out);
    return out[0];
  }

  /**
   * @description Separate a hexadecimal RGB colour into its three constituent channels.
   * @param rgb The combined hexadecimal colour.
   * @returns The red channel, will be between 0 and 1.
   * @returns The green channel, will be between 0 and 1.
   * @returns The blue channel, will be between 0 and 1.
   * @example await colors.unpackRGB(0xb23399); // => 0.7, 0.2, 0.6
   */
  async unpackRGB(rgb: number): Promise<number> {
    const out = await this.computer
      .eval(`combine(${rgb})`)
      .then((out: [number]) => out);
    return out[0];
  }

  /**
   * @deprecated Use packRGB or unpackRGB directly.
   * @description Either calls colors.packRGB or colors.unpackRGB, depending on how many arguments it receives.
   * @example await colors.rgb8(0xb23399); // => 0.7, 0.2, 0.6
   * @example await colors.rgb8(0.7, 0.2, 0.6); // => 0xb23399
   */
  async rgb8(
    r: number,
    g?: number,
    b?: number
  ): Promise<number | [number, number, number]> {
    const out = await this.computer
      .eval(`combine(${r}, ${g}, ${b}})`)
      .then((out: [number, number, number]) => out);
    if (b) return out[0];
    else return out;
  }

  /**
   * @description Converts the given color to a paint/blit hex character (0-9a-f).
   *
   * This is equivalent to converting floor(log_2(color)) to hexadecimal.
   * @param color The color to convert.
   * @returns The blit hex code of the color.
   */
  async toBlit(color: number): Promise<string> {
    const out = await this.computer
      .eval(`combine(${color})`)
      .then((out: [string, null]) => out);
    return out[0];
  }
}

export default Colouors;
