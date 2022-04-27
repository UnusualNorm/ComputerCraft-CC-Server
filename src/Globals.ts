import Computer from './Computer';
import Colors from './Globals/Colors';
import Colours from './Globals/Colours';
import Commands from './Globals/Commands';
import Disk from './Globals/Disk';
import FS from './Globals/FS';

export default class Global {
  readonly computer: Computer;
  public init: Promise<boolean>;
  constructor(Computer: Computer) {
    this.computer = Computer;
    this.init = this.load();
  }

  public loaded: boolean;
  async load(): Promise<boolean> {
    this.loaded = true;
    return true;
  }
}

export { Colors, Colours, Commands, Disk, FS };
