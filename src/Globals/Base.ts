import Computer from '../Computer';

export default class GlobalBase {
  readonly computer: Computer;
  readonly id: string;

  constructor(computer: Computer) {
    this.computer = computer;
  }

  async exists() {
    return this.computer
      .eval(`if ${this.id} then return true else return false end`)
      .then((out: [boolean]) => out[0]);
  }
}
