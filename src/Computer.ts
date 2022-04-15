import EventEmitter from 'events';
import ws from 'ws';

type jsonTypes = string | number | object | jsonTypes[] | boolean | null;
const toParams = (...data: jsonTypes[]) => {
  let params = '';
  for (let i = 0; i < data.length; i++) {
    let element = data[i];
    if (typeof element == 'string') element = JSON.stringify(element);
    params += `${element}${i != data.length - 1 ? ', ' : ''}`;
  }

  return params;
};

interface Computer {
  on: (event: 'close', listener: () => unknown) => this;
}
class Computer extends EventEmitter {
  socket: ws.WebSocket;

  /**
   * @description The ComputerCraft and Minecraft version of the current computer environment.
   */
  _HOST: string;

  /**
   * @description The default computer settings as defined in the ComputerCraft configuration.
   */
  _CC_DEFAULT_SETTINGS: string;

  init: Promise<void>;
  constructor(socket: ws.WebSocket) {
    super();
    this.socket = socket;

    this.init = (async function (self) {
      // Get results
      const _HOST = (await self.eval('_HOST'))[0];
      const _CC_DEFAULT_SETTINGS = (await self.eval('_CC_DEFAULT_SETTINGS'))[0];

      // Assign variables
      self._HOST = String(_HOST);
      self._CC_DEFAULT_SETTINGS = String(_CC_DEFAULT_SETTINGS);
      return;
    })(this);

    socket.on('message', (rawMessage) => {
      // Parse the packet
      const message = rawMessage.toString();
      const [nonce, success, out] = JSON.parse(message);

      // Run and delete the callback
      if (!this.#nonces.has(nonce)) return;
      this.#nonces.get(nonce)(success, out);
      this.#nonces.delete(nonce);
    });

    socket.once('close', () => this.emit('close'));
  }

  #nonceLength = 5;
  #nonces = new Map<
    string,
    (success: jsonTypes, output: jsonTypes) => unknown
  >();
  // TODO: Dynamically set the nonce length
  #generateNonce(): string {
    // Declare all characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Pick characers randomly
    let nonce = '';
    for (let i = 0; i < this.#nonceLength; i++)
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));

    // Loop if the nonce already exists
    if (this.#nonces.has(nonce)) return this.#generateNonce();
    else return nonce;
  }

  eval(
    commandString: string,
    multiLine = false
  ): Promise<[jsonTypes, jsonTypes]> {
    return new Promise((resolve, reject) => {
      // Create nonce callback before execution
      const nonce = this.#generateNonce();
      this.#nonces.set(nonce, (success, data) => {
        if (success != null) resolve([success, data]);
        else reject([success, data]);
      });

      // Execute command
      this.socket.send(
        JSON.stringify([nonce, `${multiLine ? '' : 'return '}${commandString}`])
      );
    });
  }

  /**
   * @description Pauses execution for the specified number of seconds.
   */
  sleep(time: number) {
    return this.eval(`sleep(${time})`);
  }

  /**
   * @description Writes a line of text to the screen without a newline at the end, wrapping text if necessary.
   */
  write(text: string) {
    return this.eval(`write("${text}")`);
  }

  /**
   * @description Prints the specified values to the screen separated by spaces, wrapping if necessary.
   */
  print(...data: jsonTypes[]) {
    return this.eval(`print(${toParams(...data)})`);
  }

  /**
   * @description Prints the specified values to the screen in red, separated by spaces, wrapping if necessary.
   */
  printError(...data: jsonTypes[]) {
    return this.eval(`printError(${toParams(...data)})`);
  }

  /*
  ///**
  // * @description Reads user input from the terminal, automatically handling arrow keys, pasting, character replacement, history scrollback, auto-completion, and default values.
  // * @ignore
  // * /
  async read(
    replaceChar?: string,
    history?: any[],
    completeFn?: string, //(partial: string) => string[],
    defaultText?: string
  ): Promise<string> {
    // FIXME: Everything...
    const out = await this.eval(
      `read(${replaceChar}, ${history}, ${completeFn}, ${defaultText})`
    );
    return String(out[0]);
  }
  */

  close(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.once('close', () => resolve());
      // 'close()' should trigger it to disconnect
      this.socket.send(JSON.stringify([null, `os.shutdown()`]));
    });
  }
}

export default Computer;
