import Computer from '../Computer';
import { JsonTypes } from '../Interfaces/CCLua';

export default class GlobalBase {
  readonly computer: Computer;
  public init: Promise<boolean>;
  constructor(Computer: Computer) {
    this.computer = Computer;
    this.init = this.load();
  }

  public loaded: boolean;
  async load() {
    this.loaded = true;
    return true;
  }
}

export class VariableGlobalBase extends GlobalBase {
  readonly variableName: string;
  async load() {
    const hasVar = await this.computer
      .eval(`${this.variableName} ~= nil`)
      .then((out: [boolean]) => out);
    this.loaded = hasVar[0];
    return hasVar[0];
  }
}
