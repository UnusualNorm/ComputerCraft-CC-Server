import Global from './Base';
import { Side } from '../Types/ComputerCraft';

class Disk extends Global {
  async isPresent(name: Side) {
    return this.computer
      .run(`disk.isPresent`, name)
      .then((out: [boolean]) => out[0]);
  }

  async getLabel(name: Side) {
    return this.computer
      .run(`disk.getLabel`, name)
      .then((out: [string]) => out[0]);
  }

  async setLabel(name: Side, label: string) {
    await this.computer.run(`disk.setLabel`, name, label);
    return;
  }

  async hasData(name: Side) {
    return this.computer
      .run(`disk.hasData`, name)
      .then((out: [boolean]) => out[0]);
  }

  async getMountPath(name: Side) {
    return this.computer
      .run(`disk.getMountPath`, name)
      .then((out: [string]) => out[0]);
  }

  async hasAudio(name: Side) {
    return this.computer
      .run(`disk.hasAudio`, name)
      .then((out: [boolean]) => out[0]);
  }

  async getAudioTitle(name: Side) {
    return this.computer
      .run(`disk.getAudioTitle`, name)
      .then((out: [string | boolean]) => out[0]);
  }

  async playAudio(name: Side) {
    await this.computer.run(`disk.playAudio`, name);
    return;
  }

  async stopAudio(name: Side) {
    await this.computer.run(`disk.stopAudio`, name);
    return;
  }

  async eject(name: Side) {
    await this.computer.run(`disk.eject`, name);
    return;
  }

  async getID(name: Side) {
    return this.computer
      .run(`disk.getID`, name)
      .then((out: [string]) => out[0]);
  }
}

export default Disk;
