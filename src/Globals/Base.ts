import Computer from '../Computer';

export default class GlobalBase {
  readonly computer: Computer;
  public init: Promise<boolean>;
  constructor(computer: Computer) {
    this.computer = computer;
    this.init = this.check();
  }

  public loaded: boolean;
  async check() {
    this.loaded = true;
    return true;
  }
}

export class VariableGlobalBase extends GlobalBase {
  readonly variableName: string;
  async check() {
    const hasVar = await this.computer
      .eval(`${this.variableName} ~= nil`)
      .then((out: [boolean]) => out);
    this.loaded = hasVar[0];
    return hasVar[0];
  }
}
