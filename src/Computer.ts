import { JsonTypes, paramify, toParams } from './Interfaces/CCLua';
import EventEmitter from 'events';
import ComputerEvents from './Interfaces/ComputerEvents';
import * as Globals from './Globals';
import ws from 'ws';

type ValueOf<T> = T[keyof T];
type ComputerEventValues = Parameters<ValueOf<ComputerEvents>>;
interface Computer {
  on<U extends keyof ComputerEvents>(
    event: U,
    listener: ComputerEvents[U]
  ): this;

  emit<U extends keyof ComputerEvents>(
    event: U,
    ...args: Parameters<ComputerEvents[U]>
  ): boolean;
}

class Computer extends EventEmitter {
  socket: ws.WebSocket;

  /**
   * @description The ComputerCraft and Minecraft version of the current computer environment.
   */
  async _HOST(): Promise<string> {
    const out = await this.get('_CC_DEFAULT_SETTINGS').then(
      (out: [string]) => out
    );
    return out[0];
  }

  /**
   * @description The default computer settings as defined in the ComputerCraft configuration.
   */
  async _CC_DEFAULT_SETTINGS(): Promise<string> {
    const out = await this.get(`_HOST`).then((out: [string]) => out);
    return out[0];
  }

  init: Promise<void>;
  constructor(socket: ws.WebSocket) {
    super();
    this.socket = socket;

    socket.on('message', (rawMessage) => {
      // Parse the packet
      const message = rawMessage.toString();
      const [nonce, ...data]: [string, ...JsonTypes[]] = JSON.parse(message);

      // Run the callback
      if (!this.#nonces.has(nonce)) return;
      this.#nonces.get(nonce)(...data);

      // Delete the callback if it is not reserved
      if (!nonce.startsWith('!')) this.#nonces.delete(nonce);
    });

    // Event handler
    this.#nonces.set(
      '!event',
      async (
        eventName: keyof ComputerEvents,
        data: ComputerEventValues | Record<string, never>
      ) => {
        if (!Array.isArray(data)) data = [];

        // Peripheral handler
        if (eventName == 'peripheral') {
          // Detect and wrap peripheral
        }

        this.emit(eventName, ...data);
      }
    );

    // Callback handler
    this.#nonces.set(
      '!callback',
      async (
        action: string,
        cbNonce: string,
        cbId: string,
        arg: JsonTypes[] | Record<string, never>
      ) => {
        if (!Array.isArray(arg)) arg = new Array<JsonTypes>();

        if (action == 'req' && this.#callbacks.has(cbId)) {
          const out = await this.#callbacks.get(cbId)(...arg);
          this.socket.send(JSON.stringify(['!callback', 'res', cbNonce, out]));
        }
      }
    );
  }

  #callbacks = new Map<
    string,
    (...data: JsonTypes[]) => JsonTypes[] | Promise<JsonTypes[]>
  >();
  #nonces = new Map<string, (...data: JsonTypes[]) => unknown>();
  #generateNonce(map: Map<string, unknown>, length = 1): string {
    // Declare all characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Trim map down for length detection
    const lengthArray = Array.from(map).filter((a) => a[0].length == length);

    // Detect if the length is enough
    const maxCount = Math.pow(chars.length, length);
    if (lengthArray.length >= maxCount)
      return this.#generateNonce(map, length + 1);

    // Pick characers randomly
    let nonce = '';
    for (let i = 0; i < length; i++)
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));

    // Loop if the nonce already exists
    if (this.#nonces.has(nonce)) return this.#generateNonce(map, length);
    else return nonce;
  }

  eval(code: string, ...arg: JsonTypes[]) {
    return new Promise<JsonTypes[]>((resolve, reject) => {
      // Create nonce callback before execution
      const nonce = this.#generateNonce(this.#nonces);
      this.#nonces.set(nonce, (success: boolean, data: JsonTypes[]) => {
        // Usually the first output determines success
        if (success) resolve(data);
        else reject(data[0]);
      });

      // Execute command
      this.socket.send(
        JSON.stringify([
          nonce,
          `return function(...)\nreturn function()\n${code}\nend\nend`,
          arg,
        ])
      );
    });
  }

  run(func: string, ...arg: JsonTypes[]) {
    return this.eval(`return ${func}(table.unpack(arg))`, ...arg);
  }
  get(val: string, ...arg: JsonTypes[]) {
    return this.eval(`return ${val}`, ...arg);
  }

  runCallback(cbId: string, ...arg: JsonTypes[]) {
    return this.run(`_G.Callbacks["${cbId}"]`, ...arg);
  }

  callback(
    cb: (...arg: JsonTypes[]) => JsonTypes[] | Promise<JsonTypes[]>
  ): Promise<{ id: string; pointer: string; delete: () => void }> {
    return new Promise((resolve) => {
      const cbNonce = this.#generateNonce(this.#nonces);
      const cbId = this.#generateNonce(this.#callbacks);

      this.#nonces.set(cbNonce, () =>
        resolve({
          id: cbId,
          pointer: `_G.RemoteCallbacks["${cbId}"]`,
          delete: () => this.#callbacks.delete(cbId),
        })
      );
      this.socket.send(JSON.stringify(['!callback', 'create', cbNonce, cbId]));
      this.#callbacks.set(cbId, cb);
    });
  }

  /**
   * @description Pauses execution for the specified number of seconds.
   *
   * As it waits for a fixed amount of world ticks, time will automatically be rounded up to the nearest multiple of 0.05 seconds.
   * If you are using coroutines or the parallel API, it will only pause execution of the current thread, not the whole program.
   *
   * TIP:
   * Because sleep internally uses timers, it is a function that yields.
   * This means that you can use it to prevent "Too long without yielding" errors, however, as the minimum sleep time is 0.05 seconds, it will slow your program down.
   *
   * CAUTION:
   * Internally, this function queues and waits for a timer event (using os.startTimer), however it does not listen for any other events.
   * This means that any event that occurs while sleeping will be entirely discarded. If you need to receive events while sleeping, consider using timers, or the parallel API.
   *
   * @param time The number of seconds to sleep for, rounded up to the nearest multiple of 0.05.
   * @example
   * // Sleep for 3 seconds
   * await computer.print("Sleeping for three seconds");
   * await computer.sleep(3);
   * await computer.print("Done!");
   *
   * @see OS.startTimer
   */
  async sleep(time: number): Promise<void> {
    await this.run(`sleep`, time);
    return null;
  }

  /**
   * @description Writes a line of text to the screen without a newline at the end, wrapping text if necessary.
   * @param text The text to write to the string
   * @returns The number of lines written
   * @example computer.write("Hello, world")
   * @see Base.print A wrapper around write that adds a newline and accepts multiple arguments
   */
  async write(text: string): Promise<number> {
    const out = await this.run(`write`, text).then((out: [number]) => out);
    return out[0];
  }

  /**
   * @description Prints the specified values to the screen separated by spaces, wrapping if necessary.
   * @param data The values to print on the screen
   * @returns The number of lines written
   * @example computer.print("Hello, world!")
   */
  async print(...data: JsonTypes[]): Promise<number> {
    const out = await this.run(`print`, ...data).then((out: [number]) => out);
    return out[0];
  }

  /**
   * @description Prints the specified values to the screen in red, separated by spaces, wrapping if necessary.
   * @param data The values to print on the screen
   * @example computer.printError("Something went wrong!")
   */
  async printError(...data: JsonTypes[]): Promise<void> {
    await this.run(`printError`, ...data);
    return null;
  }

  /**
   * @description Reads user input from the terminal, automatically handling arrow keys, pasting, character replacement, history scrollback, auto-completion, and default values.
   * @param replaceChar A character to replace each typed character with. This can be used for hiding passwords, for example.
   * @param history A table holding history items that can be scrolled back to with the up/down arrow keys. The oldest item is at index 1, while the newest item is at the highest index.
   * @param completeFn A function to be used for completion. This function should take the partial text typed so far, and returns a list of possible completion options.
   * @param defaultText Default text which should already be entered into the prompt.
   * @returns The text typed in.
   * @example
   * // Read a string and echo it back to the user
   * await computer.write("> ");
   * const msg = await computer.read();
   * await computer.print(msg);
   *
   * // Prompt a user for a password.
   * while (true) {
   *   await computer.write('Password> ');
   *   const pwd = await computer.read('*');
   *   if (pwd == 'let me in') break;
   *   await computer.print('Incorrect password, try again.');
   * }
   * await computer.print('Logged in!');
   *
   * // A complete example with completion, history and a default value.
   * const {completion} = computer.globals;
   * const history = [ "potato", "orange", "apple" ]
   * const choices = [ "apple", "orange", "banana", "strawberry" ]
   * await computer.write("> ")
   * const msg = await computer.read(null, history, (partial) => completion, "app")
   * await computer.print(msg)
   */
  async read(
    replaceChar?: string,
    history?: JsonTypes[],
    completeFn?: (partial: string) => string[] | Promise<string[]>,
    defaultText?: string
  ) {
    let callback;
    if (completeFn)
      callback = await this.callback(
        // Auto-format the output into an array
        async (partial: string) => [await completeFn(partial)]
      );

    const out = await this.eval(
      `return read(arg[1], arg[2], ${
        callback ? callback.pointer : 'nil'
      }, arg[3])`,
      replaceChar,
      history,
      defaultText
    ).then((out: [string]) => out[0]);

    callback.delete();
    return out;
  }
}

export default Computer;
