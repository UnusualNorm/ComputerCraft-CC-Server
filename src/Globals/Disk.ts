import { Side } from '../ComputerCraft';
import { Global } from './Base';

class Disk extends Global {
  readonly id = 'disk';

  async isPresent(name: Side): Promise<boolean> {
    return this.computer
      .run(`disk.isPresent`, name)
      .then((out: [boolean]) => out[0]);
  }

  async getLabel(name: Side): Promise<string | null> {
    return this.computer
      .run(`disk.getLabel`, name)
      .then((out: [string | null]) => out[0]);
  }

  async setLabel(name: Side, label: string | null): Promise<void> {
    await this.computer.run(`disk.setLabel`, name, label);
    return;
  }

  async hasData(name: Side): Promise<boolean> {
    return this.computer
      .run(`disk.hasData`, name)
      .then((out: [boolean]) => out[0]);
  }

  async getMountPath(name: Side): Promise<string | null> {
    return this.computer
      .run(`disk.getMountPath`, name)
      .then((out: [string | null]) => out[0]);
  }

  async hasAudio(name: Side): Promise<boolean> {
    return this.computer
      .run(`disk.hasAudio`, name)
      .then((out: [boolean]) => out[0]);
  }

  async getAudioTitle(name: Side): Promise<string | boolean | null> {
    return this.computer
      .run(`disk.getAudioTitle`, name)
      .then((out: [string | boolean | null]) => out[0]);
  }

  async playAudio(name: Side): Promise<void> {
    await this.computer.run(`disk.playAudio`, name);
    return;
  }

  async stopAudio(name: Side): Promise<void> {
    await this.computer.run(`disk.stopAudio`, name);
    return;
  }

  async eject(name: Side): Promise<void> {
    await this.computer.run(`disk.eject`, name);
    return;
  }

  async getID(name: Side): Promise<string | null> {
    return this.computer
      .run(`disk.getID`, name)
      .then((out: [string | null]) => out[0]);
  }
}

export { Disk };
