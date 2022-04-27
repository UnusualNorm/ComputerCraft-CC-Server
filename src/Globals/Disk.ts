import Global from '../Globals';
import { paramify, Side } from '../Interfaces/CCLua';

class Disk extends Global {
  async isPresent(name: Side): Promise<boolean> {
    const out = await this.computer
      .eval(`disk.isPresent("${name}")`)
      .then((out: [boolean]) => out);

    return out[0];
  }

  async getLabel(name: Side): Promise<string> {
    const out = await this.computer
      .eval(`disk.getLabel("${name}")`)
      .then((out: [string]) => out);

    return out[0];
  }

  async setLabel(name: Side, label: string): Promise<void> {
    await this.computer.eval(
      `disk.setLabel("${name}", ${paramify(label)})`,
      true
    );
    return;
  }

  async hasData(name: Side): Promise<boolean> {
    const out = await this.computer
      .eval(`disk.hasData("${name}")`)
      .then((out: [boolean]) => out);

    return out[0];
  }

  async getMountPath(name: Side): Promise<string> {
    const out = await this.computer
      .eval(`disk.getMountPath("${name}")`)
      .then((out: [string]) => out);

    return out[0];
  }

  async hasAudio(name: Side): Promise<boolean> {
    const out = await this.computer
      .eval(`disk.hasAudio("${name}")`)
      .then((out: [boolean]) => out);

    return out[0];
  }

  async getAudioTitle(name: Side): Promise<string | boolean> {
    const out = await this.computer
      .eval(`disk.getAudioTitle("${name}")`)
      .then((out: [string | boolean]) => out);

    return out[0];
  }

  async playAudio(name: Side): Promise<void> {
    await this.computer.eval(`disk.playAudio("${name}")`, true);
    return;
  }

  async stopAudio(name: Side): Promise<void> {
    await this.computer.eval(`disk.stopAudio("${name}")`, true);
    return;
  }

  async eject(name: Side): Promise<void> {
    await this.computer.eval(`disk.eject("${name}")`, true);
    return;
  }

  async getID(name: Side): Promise<string> {
    const out = await this.computer
      .eval(`disk.getID("${name}")`)
      .then((out: [string]) => out);

    return out[0];
  }
}

export default Disk;
