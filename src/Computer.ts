import { JsonTypes, paramify, toParams } from './Interfaces/CCLua';
import EventEmitter from 'events';
import ComputerEvents from './Interfaces/ComputerEvents';
import Global, * as Globals from './Globals';
import ws from 'ws';

const GlobalsList = Object.keys(Globals);

class Base extends EventEmitter implements ComputerEvents {
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

  // Globals
  globals = new Array<Global>();

  constructor(socket: ws.WebSocket) {
    super();
    this.socket = socket;

    this.init = (async function (self) {
      // Request global variables
      const _HOST = self.eval('_HOST').then((out: [string]) => out);
      const _CC_DEFAULT_SETTINGS = self
        .eval('_CC_DEFAULT_SETTINGS')
        .then((out: [string]) => out);

      // Request globals
      const GlobalEvaluations: Promise<boolean>[] = [];

      // Assign global variables
      self._HOST = (await _HOST)[0];
      self._CC_DEFAULT_SETTINGS = (await _CC_DEFAULT_SETTINGS)[0];

      // Create global variables
      await Promise.all(GlobalEvaluations).then().catch();
      return;
    })(this);

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
      async (eventName: string, ...data: JsonTypes[]) => {
        if (!eventName) {
          // No event name... Either "redstone" "term_resize" or "turtle_inventory"
          return;
        }

        this.emit(eventName, ...data);
      }
    );

    socket.once('close', () => this.emit('close'));
  }

  #nonceLength = 5;
  #nonces = new Map<string, (...data: JsonTypes[]) => unknown>();
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
    expectNull = false,
    multiLine = false
  ): Promise<JsonTypes[]> {
    return new Promise((resolve, reject) => {
      // Create nonce callback before execution
      const nonce = this.#generateNonce();
      this.#nonces.set(nonce, (...data) => {
        // Usually the first output determines success
        if (data[0] != null || expectNull) resolve(data);
        else reject(data);
      });

      // Execute command
      this.socket.send(
        JSON.stringify([nonce, `${multiLine ? '' : 'return '}${commandString}`])
      );
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
    await this.eval(`sleep(${time})`, true);
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
    const out = await this.eval(`write(${paramify(text)})`).then(
      (out: [number]) => out
    );
    return out[0];
  }

  /**
   * @description Prints the specified values to the screen separated by spaces, wrapping if necessary.
   * @param data The values to print on the screen
   * @returns The number of lines written
   * @example computer.print("Hello, world!")
   */
  async print(...data: JsonTypes[]): Promise<number> {
    const out = await this.eval(`print(${toParams(...data)})`).then(
      (out: [number]) => out
    );
    return out[0];
  }

  /**
   * @description Prints the specified values to the screen in red, separated by spaces, wrapping if necessary.
   * @param data The values to print on the screen
   * @example computer.printError("Something went wrong!")
   */
  async printError(...data: JsonTypes[]): Promise<void> {
    await this.eval(`printError(${toParams(...data)})`, true);
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
   * computer.write("> ");
   * const msg = computer.read();
   * computer.print(msg);
   *
   * // Prompt a user for a password.
   * const promptPassword = async () => {
   *   await computer.write("Password> ");
   *   const pwd = await computer.read("*");
   *   if (pwd == "let me in") {
   *     await computer.print("Logged in!");
   *     return;
   *   } else {
   *     await computer.print("Incorrect password, try again.");
   *     return (await promptPassword());
   *   }
   * }
   * promptPassword();
   *
   * @todo Add third example
   */
  async read(
    replaceChar?: string,
    history?: JsonTypes[],
    completeFn?: (partial: string) => string[],
    defaultText?: string
  ): Promise<string> {
    const out = await this.eval(
      `read(${replaceChar}, ${history}, ${completeFn}, ${defaultText})`
    );
    return String(out[0]);
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      // Triger socket.close()
      this.socket.once('close', () => resolve());
      this.socket.send(JSON.stringify([null, `Socket.close()`]));
    });
  }
}

export default Base;