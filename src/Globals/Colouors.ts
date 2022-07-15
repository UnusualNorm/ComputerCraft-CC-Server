import { Global } from './Base';

type RGB = {
  r: number;
  g: number;
  b: number;
};

class Colouors extends Global {
  readonly white = 0x1;
  readonly orange = 0x2;
  readonly magenta = 0x4;
  readonly lightBlue = 0x8;
  readonly yellow = 0x10;
  readonly lime = 0x20;
  readonly pink = 0x40;

  //-------------------------------------------------------------------
  //---- GRAY/GREY NOT DEFINED HERE, PLEASE SEE COLOR/COLOUR FILES ----
  //-------------------------------------------------------------------

  readonly cyan = 0x200;
  readonly purple = 0x400;
  readonly blue = 0x800;
  readonly brown = 0x1000;
  readonly green = 0x2000;
  readonly red = 0x4000;
  readonly black = 0x8000;

  async combine(...arg: number[]): Promise<number> {
    return this.computer
      .run(`colors.combine`, ...arg)
      .then((out: [number]) => out[0]);
  }

  async subtract(colors: number, ...arg: number[]): Promise<number> {
    return this.computer
      .run(`colors.subtract`, colors, ...arg)
      .then((out: [number]) => out[0]);
  }

  async test(colors: number, color: number): Promise<boolean> {
    return this.computer
      .run(`colors.test`, colors, color)
      .then((out: [boolean]) => out[0]);
  }

  async packRGB(r: number, g: number, b: number): Promise<number> {
    return this.computer
      .run(`colors.packRGB`, r, g, b)
      .then((out: [number]) => out[0]);
  }

  async unpackRGB(rgb: number): Promise<RGB> {
    return this.computer
      .run(`colors.unpackRGB`, rgb)
      .then((out: [number, number, number]) => ({
        r: out[0],
        g: out[1],
        b: out[2],
      }));
  }

  async rgb8(...arg: [number, number?, number?]): Promise<number | RGB> {
    return this.computer
      .run(`colors.rgb8`, ...arg)
      .then((out: [number] | [number, number, number]) => {
        if (out.length == 1) return out[0];
        else return { r: out[0], g: out[1], b: out[2] };
      });
  }

  async toBlit(color: number): Promise<string> {
    return this.computer
      .run(`colors.toBlit`, color)
      .then((out: [string]) => out[0]);
  }
}

export { Colouors };
