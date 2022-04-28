import Global from './Base';
import { paramify, Side } from '../Interfaces/CCLua';

class Disk extends Global {
  async isPresent(name: Side) {
    return this.computer
      .eval(`disk.isPresent("${name}")`)
      .then((out: [boolean]) => out[0]);
  }

  async getLabel(name: Side) {
    return this.computer
      .eval(`disk.getLabel("${name}")`)
      .then((out: [string]) => out[0]);
  }

  async setLabel(name: Side, label: string) {
    return this.computer
      .eval(`disk.setLabel("${name}", ${paramify(label)})`, true)
      .then(() => null);
  }

  async hasData(name: Side) {
    return this.computer
      .eval(`disk.hasData("${name}")`)
      .then((out: [boolean]) => out[0]);
  }

  async getMountPath(name: Side) {
    return this.computer
      .eval(`disk.getMountPath("${name}")`)
      .then((out: [string]) => out[0]);
  }

  async hasAudio(name: Side) {
    return this.computer
      .eval(`disk.hasAudio("${name}")`)
      .then((out: [boolean]) => out[0]);
  }

  async getAudioTitle(name: Side) {
    const out = await this.computer
      .eval(`disk.getAudioTitle("${name}")`)
      .then((out: [string | boolean]) => out[0]);
  }

  async playAudio(name: Side): Promise<void> {
    return this.computer
      .eval(`disk.playAudio("${name}")`, true)
      .then(() => null);
  }

  async stopAudio(name: Side): Promise<void> {
    return this.computer
      .eval(`disk.stopAudio("${name}")`, true)
      .then(() => null);
  }

  async eject(name: Side): Promise<void> {
    return this.computer.eval(`disk.eject("${name}")`, true).then(() => null);
  }

  async getID(name: Side) {
    return this.computer
      .eval(`disk.getID("${name}")`)
      .then((out: [string]) => out[0]);
  }
}

export default Disk;
