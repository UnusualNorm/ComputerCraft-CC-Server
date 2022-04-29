import { JsonTypes, paramify, toParams } from './Interfaces/CCLua';
import EventEmitter from 'events';
import ComputerEvents from './Interfaces/ComputerEvents';
import * as Globals from './Globals';
import ws from 'ws';

class Computer extends EventEmitter implements ComputerEvents {
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
      // Request global variables
      const _HOST = self.eval('_HOST').then((out: [string]) => out);
      const _CC_DEFAULT_SETTINGS = self
        .eval('_CC_DEFAULT_SETTINGS')
        .then((out: [string]) => out);

      // Create globals

      // Assign global variables
      self._HOST = (await _HOST)[0];
      self._CC_DEFAULT_SETTINGS = (await _CC_DEFAULT_SETTINGS)[0];
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
    this.#nonces.set('!event', async (eventName: string, data: JsonTypes[]) => {
      if (!eventName) {
        // No event name... Either "redstone" "term_resize" or "turtle_inventory"
        return;
      }

      this.emit(eventName, ...data);
    });

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
        } else if (action == 'create') this.#remoteCallbacks.push(cbId);
      }
    );
  }

  #callbacks = new Map<
    string,
    (...data: JsonTypes[]) => JsonTypes[] | Promise<JsonTypes[]>
  >();
  #remoteCallbacks = new Array<string>();
  #nonces = new Map<string, (...data: JsonTypes[]) => unknown>();
  #generateNonce(map: Map<string, unknown>, minLength = 1): string {
    // Declare all characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Detect if the minLength is enough
    const maxCount = Math.pow(chars.length, minLength);
    if (map.size >= maxCount) return this.#generateNonce(map, minLength + 1);

    // Pick characers randomly
    let nonce = '';
    for (let i = 0; i < minLength; i++)
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));

    // Loop if the nonce already exists
    if (this.#nonces.has(nonce)) return this.#generateNonce(map, minLength);
    else return nonce;
  }

  eval(commandString: string, multiLine = false) {
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
        JSON.stringify([nonce, `${multiLine ? '' : 'return '}${commandString}`])
      );
    });
  }

  runCallback(cbId: string, ...arg: JsonTypes[]) {
    return new Promise<JsonTypes[]>((resolve) => {
      // Create nonce callback before calling
      const nonce = this.#generateNonce(this.#nonces);
      this.#nonces.set(nonce, (data: JsonTypes[]) => resolve(data));

      // Execute callback
      this.socket.send(JSON.stringify(['!callback', 'req', nonce, cbId, arg]));
    });
  }

  callback(
    cb: (...arg: JsonTypes[]) => JsonTypes[] | Promise<JsonTypes[]>
  ): Promise<string> {
    return new Promise((resolve) => {
      const cbNonce = this.#generateNonce(this.#nonces);
      const cbId = this.#generateNonce(this.#callbacks);

      this.#nonces.set(cbNonce, () => resolve(cbId));
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
    await this.eval(`sleep(${time})`);
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
    completeFn?: string | ((partial: string) => string[] | Promise<string[]>),
    defaultText?: string
  ) {
    return this.eval(
      `read(${toParams(replaceChar, history)}, ${
        completeFn
          ? typeof completeFn == 'string'
            ? `function(partial)\n${completeFn}\nend`
            : `RemoteCallbacks[${paramify(
                await this.callback(
                  // Auto-format the output into an array
                  async (partial: string) => [await completeFn(partial)]
                )
              )}]`
          : null
      }, ${paramify(defaultText)})`
    ).then((out: [string]) => out[0]);
  }
}

export default Computer;
