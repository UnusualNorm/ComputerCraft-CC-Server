import { Computer } from '../Computer';

export class Global {
  readonly computer: Computer;
  readonly id: string;

  constructor(computer: Computer) {
    this.computer = computer;
  }

  async isLoaded() {
    return this.computer
      .eval(`if ${this.id} then return true else return false end`)
      .then((out: [boolean]) => out[0]);
  }
}
