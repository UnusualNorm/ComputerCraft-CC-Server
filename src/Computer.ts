import EventEmitter from 'events';
import ws from 'ws';
import {
  CommonTypes,
  FunctionMask,
  NetworkedCallback,
  NetworkedTypes,
  NetworkInputs,
} from './Types';

class Computer extends EventEmitter implements Computer {
  socket: ws.WebSocket;

  /**
   * @description The ComputerCraft and Minecraft version of the current computer environment.
   */
  readonly _HOST: Promise<string> = this.get(`_HOST`).then(
    (out: [string]) => out[0]
  );

  /**
   * @description The default computer settings as defined in the ComputerCraft configuration.
   */
  readonly _CC_DEFAULT_SETTINGS: Promise<string> = this.get(
    `_CC_DEFAULT_SETTINGS`
  ).then((out: [string]) => out[0]);

  constructor(socket: ws.WebSocket) {
    super();
    this.socket = socket;

    socket.on('message', async (rawMessageData) => {
      const rawMessage = rawMessageData.toString();
      const message: NetworkInputs = JSON.parse(rawMessage);

      switch (message[0]) {
        case 'eval': {
          const [, nonce, success, output, outputMask] = message;
          const args = this.#unpackArrayValues(output, outputMask);
          const callback = this.#evalRequests.get(nonce);
          if (callback) {
            callback(success, args);
            this.#evalRequests.delete(nonce);
          }
          break;
        }
        case 'callback': {
          if (message[1] == 'req') {
            const [, , nonce, id, arg, argMask] = message;
            const callback = this.#callbacks.get(id);
            if (callback) {
              const args = this.#unpackArrayValues(arg, argMask);
              const result = await callback(...args);
              const [output, outputMask] = await this.#packArrayValues(result);

              this.socket.send(
                JSON.stringify(['callback', 'res', nonce, output, outputMask])
              );
            }
          }
          if (message[1] == 'res') {
            const [, , nonce, output, outputMask] = message;
            const callback = this.#callbackRequests.get(nonce);
            if (callback) {
              const args = this.#unpackArrayValues(output, outputMask);
              callback(...args);
              this.#callbackRequests.delete(nonce);
            }
          }
          break;
        }
      }
    });
  }

  #evalRequests = new Map<
    string,
    (success: boolean, output: NetworkedTypes[]) => unknown
  >();
  #callbacks = new Map<string, NetworkedCallback>();
  #callbackRequests = new Map<string, (...args: NetworkedTypes[]) => unknown>();
  #generateNonce(map: Map<string, unknown>, length = 1): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const lengthArray = Array.from(map).filter((a) => a[0].length == length);

    const maxCount = Math.pow(chars.length, length);
    if (lengthArray.length >= maxCount)
      return this.#generateNonce(map, length + 1);

    let nonce = '';
    for (let i = 0; i < length; i++)
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));

    if (map.has(nonce)) return this.#generateNonce(map, length);
    else return nonce;
  }

  eval(code: string, ...arg: NetworkedTypes[]) {
    return this.rawEval(`return function(...) \n${code}\n end`, ...arg);
  }

  async rawEval(code: string, ...arg: NetworkedTypes[]) {
    const [values, mask] = await this.#packArrayValues(arg);

    return new Promise<NetworkedTypes[]>((resolve, reject) => {
      const nonce = this.#generateNonce(this.#evalRequests);
      this.#evalRequests.set(nonce, async (success, output) => {
        if (success) resolve(output);
        else reject(output[0]);
      });

      this.socket.send(JSON.stringify(['eval', nonce, code, values, mask]));
    });
  }

  run(func: string, ...arg: NetworkedTypes[]) {
    return this.rawEval(`return ${func}`, ...arg);
  }
  get(val: string) {
    return this.eval(`return ${val}`);
  }

  #runCallback(cbId: string, ...arg: NetworkedTypes[]) {
    return this.rawEval(`return _G.Callbacks[${JSON.stringify(cbId)}]`, ...arg);
  }

  #callback(cbId: string) {
    return (...arg: NetworkedTypes[]) => {
      return this.#runCallback(cbId, ...arg);
    };
  }

  #createCallback(callback: NetworkedCallback): Promise<string> {
    return new Promise<string>((resolve) => {
      const nonce = this.#generateNonce(this.#callbackRequests);
      const callbackId = this.#generateNonce(this.#callbacks);

      this.socket.send(
        JSON.stringify(['callback', 'create', nonce, callbackId])
      );

      this.#callbackRequests.set(nonce, () => resolve(callbackId));
      this.#callbacks.set(callbackId, callback);
    });
  }

  async #packArrayValues(
    data: NetworkedTypes[]
  ): Promise<[CommonTypes[], FunctionMask[]]> {
    const values: CommonTypes[] = [];
    const mask: FunctionMask[] = [];

    for (const item of data) {
      if (typeof item === 'function') {
        values.push(await this.#createCallback(item));
        mask.push(true);
      } else if (typeof item === 'object') {
        if (Array.isArray(item)) {
          const [arrayValues, arrayMask] = await this.#packArrayValues(item);
          values.push(arrayValues);
          mask.push(arrayMask);
        } else {
          const [objectValues, objectMask] = await this.#packObjectValues(item);
          values.push(objectValues);
          mask.push(objectMask);
        }
      } else {
        values.push(item);
        mask.push(false);
      }
    }
    return [values, mask];
  }

  async #packObjectValues(
    // TODO: Determine a type that also allows for packaging of global types
    data: unknown
  ): Promise<[Record<string, CommonTypes>, Record<string, FunctionMask>]> {
    const values: Record<string, CommonTypes> = {};
    const mask: Record<string, FunctionMask> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'function') {
        values[key] = await this.#createCallback(value);
        mask[key] = true;
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          const [arrayValues, arrayMask] = await this.#packArrayValues(value);
          values[key] = arrayValues;
          mask[key] = arrayMask;
        } else {
          const [objectValues, objectMask] = await this.#packObjectValues(
            value
          );
          values[key] = objectValues;
          mask[key] = objectMask;
        }
      } else {
        values[key] = value;
        mask[key] = false;
      }
    }

    return [values, mask];
  }

  #unpackArrayValues(
    data: CommonTypes[] | Record<string, never>,
    mask: FunctionMask[] | Record<string, never>
  ): NetworkedTypes[] {
    if (!Array.isArray(data)) data = [];
    if (!Array.isArray(mask)) mask = [];

    const values: NetworkedTypes[] = [];

    for (const [i, item] of data.entries()) {
      const itemMask = mask[i];
      if (typeof item == 'string' && mask[i]) {
        values.push(this.#callback(item));
      } else if (typeof item == 'object' && typeof itemMask == 'object') {
        if (Array.isArray(item) && Array.isArray(itemMask)) {
          values.push(this.#unpackArrayValues(item, itemMask));
        } else if (!Array.isArray(item) && !Array.isArray(itemMask)) {
          values.push(this.#unpackObjectValues(item, itemMask));
        }
      } else {
        values.push(item);
      }
    }

    return values;
  }

  #unpackObjectValues(
    data: Record<string, CommonTypes>,
    mask: Record<string, FunctionMask>
  ): Record<string, NetworkedTypes> {
    const values: Record<string, NetworkedTypes> = {};

    for (const [key, value] of Object.entries(data)) {
      const itemMask = mask[key];
      if (typeof value == 'string' && mask[key]) {
        values[key] = this.#callback(value);
      } else if (typeof value == 'object' && typeof itemMask == 'object') {
        if (Array.isArray(value) && Array.isArray(itemMask)) {
          values[key] = this.#unpackArrayValues(value, itemMask);
        } else if (!Array.isArray(value) && !Array.isArray(itemMask)) {
          values[key] = this.#unpackObjectValues(value, itemMask);
        }
      } else {
        values[key] = value;
      }
    }

    return values;
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
   * @see Computer.print A wrapper around write that adds a newline and accepts multiple arguments
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
  async print(...data: CommonTypes[]): Promise<number> {
    const out = await this.run(`print`, ...data).then((out: [number]) => out);
    return out[0];
  }

  /**
   * @description Prints the specified values to the screen in red, separated by spaces, wrapping if necessary.
   * @param data The values to print on the screen
   * @example computer.printError("Something went wrong!")
   */
  async printError(...data: CommonTypes[]): Promise<void> {
    await this.run(`printError`, ...data);
    return;
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
    history?: CommonTypes[],
    completeFn?: (partial: string) => string[] | Promise<string[]>,
    defaultText?: string
  ) {
    const out = await this.run(
      `read`,
      replaceChar,
      history,
      async (partial: string) => [await completeFn(partial)],
      defaultText
    ).then((out: [string]) => out[0]);
    return out;
  }
}

export { Computer };
