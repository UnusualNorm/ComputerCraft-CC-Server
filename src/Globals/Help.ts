import { Global } from './Base';

export class Help extends Global {
  readonly id = 'help';

  async path(): Promise<string> {
    return this.computer.get(`help.path`).then((out: [string]) => out[0]);
  }

  async setPath(newPath: string): Promise<void> {
    await this.computer.run(`help.setPath`, newPath);
    return;
  }

  async lookup(topic: string): Promise<string | null> {
    return this.computer
      .run(`help.lookup`, topic)
      .then((out: [string | null]) => out[0]);
  }

  async topics(): Promise<string[]> {
    return this.computer
      .run(`help.topics`)
      .then((out: [string[] | Record<string, never>]) =>
        Array.isArray(out[0]) ? out[0] : []
      );
  }

  async completeTopic(topic: string): Promise<string[]> {
    return this.computer
      .run(`help.completeTopic`, topic)
      .then((out: [string[] | Record<string, never>]) =>
        Array.isArray(out[0]) ? out[0] : []
      );
  }
}
