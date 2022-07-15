import EventEmitter from 'events';
import ws from 'ws';
import { CommonType, Side } from './ComputerCraft';
import { FSNetworkedType, HTTPNetworkedType } from './Globals';

export interface ComputerEvents {
  /**
   * @description The timer event is fired when an alarm started with os.setAlarm completes.
   * @returns The ID of the alarm that finished.
   * @example
   * // Starts a timer and then prints its ID:
   * const alarmID = await os.setAlarm(os.time() + 0.05);
   * computer.on('alarm', id => {
   *  if (id == alarmID)
   *    console.log(`Alarm with ID ${id} was fired`);
   * });
   * @see os.setAlarm To start an alarm.
   */
  alarm: (id: number) => unknown;

  /**
   * @description
   * The char event is fired when a character is typed on the keyboard.
   *
   * The char event is different to a key press. Sometimes multiple key presses may result in one character being typed (for instance, on some European keyboards). Similarly, some keys (e.g. Ctrl) do not have any corresponding character. The key should be used if you want to listen to key presses themselves.
   * @returns The string representing the character that was pressed.
   * @example
   * // Prints each character the user presses:
   * computer.on('char', character => console.log(`${character} was pressed.`))
   * @see key To listen to any key press.
   */
  char: (character: string) => unknown;

  /**
   * @description The computer_command event is fired when the /computercraft queue command is run for the current computer.
   * @returns The arguments passed to the command.
   * @example
   * // Prints the contents of messages sent:
   * computer.on('computer_command', args => console.log('Received message:', ...args))
   */
  computer_command: (args: string[]) => unknown;

  /**
   * @description The disk event is fired when a disk is inserted into an adjacent or networked disk drive.
   * @returns The side of the disk drive that had a disk inserted.
   * @example
   * // Prints a message when a disk is inserted:
   * computer.on('disk', side => console.log(`Inserted a disk on side ${side}`))
   * @see disk_eject For the event sent when a disk is removed.
   */
  disk: (side: Side) => unknown;

  /**
   * @description The disk_eject event is fired when a disk is removed from an adjacent or networked disk drive.
   * @returns The side of the disk drive that had a disk removed.
   * @example
   * // Prints a message when a disk is removed:
   * computer.on('disk_eject', side => console.log(`Removed a disk on side ${side}`))
   * @see disk For the event sent when a disk is inserted.
   */
  disk_eject: (side: Side) => unknown;

  http_check: (url: string, success: boolean, err: string) => unknown;

  http_failure: (url: string, err: string, handle: null) => unknown;

  http_success: (url: string, handle: null) => unknown;

  key: (key: number, is_held: boolean) => unknown;

  key_up: (key: number) => unknown;

  modem_message: (
    side: Side,
    channel: number,
    replyChannel: number,
    message: CommonType,
    distance: number
  ) => unknown;

  monitor_resize: ((id: number) => unknown) | ((side: Side) => unknown);

  monitor_touch:
    | ((side: Side, x: number, y: number) => unknown)
    | ((id: number, x: number, y: number) => unknown);

  mouse_click: (button: number, x: number, y: number) => unknown;

  mouse_drag: (button: number, x: number, y: number) => unknown;

  mouse_scroll: (dir: -1 | 1, x: number, y: number) => unknown;

  mouse_up: (button: number, x: number, y: number) => unknown;

  paste: (text: string) => unknown;

  peripheral: (side: Side) => unknown;

  peripheral_detach: (side: Side) => unknown;

  rednet_message: (
    sender: number,
    message: CommonType,
    protocol: string
  ) => unknown;

  redstone: () => unknown;

  speaker_audio_empty: (name: string) => unknown;

  task_complete: (
    id: number,
    success: boolean,
    err: string,
    ...params: string[]
  ) => unknown;

  term_resize: () => unknown;

  terminate: () => unknown;

  timer: (id: number) => unknown;

  turtle_inventory: () => unknown;
}

export type NetworkedCallback = (
  ...args: NetworkedType[]
) => NetworkedType[] | Promise<NetworkedType[]>;

export type FunctionMask =
  | boolean
  | FunctionMask[]
  | { [x: string]: FunctionMask };

export type NetworkedType =
  | CommonType
  | NetworkedCallback
  | NetworkedType[]
  | { [x: string]: NetworkedType }
  | FSNetworkedType
  | HTTPNetworkedType;

export type NetworkInput =
  | ['eval', string, boolean, CommonType[], FunctionMask[]]
  | ['callback', 'req', string, string, CommonType[], FunctionMask[]]
  | ['callback', 'res', string, CommonType[], FunctionMask[]]
  | ['event', string, CommonType[], FunctionMask[]];

export interface Computer {
  on<U extends keyof ComputerEvents>(
    event: U,
    listener: ComputerEvents[U]
  ): this;

  emit<U extends keyof ComputerEvents>(
    event: U,
    ...args: Parameters<ComputerEvents[U]>
  ): boolean;
}

export class Computer extends EventEmitter {
  socket: ws.WebSocket;

  async _HOST(): Promise<string> {
    return this.get(`_HOST`).then((out: [string]) => out[0]);
  }

  async _CC_DEFAULT_SETTINGS(): Promise<string> {
    return this.get(`_CC_DEFAULT_SETTINGS`).then((out: [string]) => out[0]);
  }

  constructor(socket: ws.WebSocket) {
    super();
    this.socket = socket;

    socket.on('message', async (rawMessageData) => {
      const rawMessage = rawMessageData.toString();
      const message: NetworkInput = JSON.parse(rawMessage);

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
              const [output, outputMask] = this.#packArrayValues(result);

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
    (success: boolean, output: NetworkedType[]) => unknown
  >();
  #callbacks = new Map<string, NetworkedCallback>();
  #callbackRequests = new Map<string, (...args: NetworkedType[]) => unknown>();
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

  eval(code: string, ...arg: NetworkedType[]) {
    return this.rawEval(`return function(...) \n${code}\n end`, ...arg);
  }

  rawEval(code: string, ...arg: NetworkedType[]): Promise<NetworkedType[]> {
    return new Promise<NetworkedType[]>((resolve, reject) => {
      const [values, mask] = this.#packArrayValues(arg);
      const nonce = this.#generateNonce(this.#evalRequests);

      this.#evalRequests.set(nonce, async (success, output) => {
        if (success) resolve(output);
        else reject(output[0]);
      });

      this.socket.send(JSON.stringify(['eval', nonce, code, values, mask]));
    });
  }

  run(func: string, ...arg: NetworkedType[]) {
    return this.rawEval(`return ${func}`, ...arg);
  }
  get(val: string, ...arg: NetworkedType[]) {
    return this.eval(`return ${val}`, ...arg);
  }

  #remoteCallback(callbackId: string) {
    return (...arg: NetworkedType[]) => {
      return new Promise<NetworkedType[]>((resolve) => {
        const [values, mask] = this.#packArrayValues(arg);
        const nonce = this.#generateNonce(this.#callbackRequests);

        this.#callbackRequests.set(nonce, (...arg) => resolve(arg));
        this.socket.send(
          JSON.stringify(['callback', 'req', nonce, callbackId, values, mask])
        );
      });
    };
  }

  #createCallback(callback: NetworkedCallback) {
    const callbackId = this.#generateNonce(this.#callbacks);
    this.#callbacks.set(callbackId, callback);
    return callbackId;
  }

  #packArrayValues(data: NetworkedType[]): [CommonType[], FunctionMask[]] {
    const values: CommonType[] = [];
    const mask: FunctionMask[] = [];

    for (const item of data) {
      if (typeof item === 'function') {
        values.push(this.#createCallback(item));
        mask.push(true);
      } else if (typeof item === 'object') {
        if (Array.isArray(item)) {
          const [arrayValues, arrayMask] = this.#packArrayValues(item);
          values.push(arrayValues);
          mask.push(arrayMask);
        } else {
          const [objectValues, objectMask] = this.#packObjectValues(item);
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

  #packObjectValues(
    // TODO: Determine a type that also allows for packaging of global types
    data: unknown
  ): [Record<string, CommonType>, Record<string, FunctionMask>] {
    const values: Record<string, CommonType> = {};
    const mask: Record<string, FunctionMask> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'function') {
        values[key] = this.#createCallback(value);
        mask[key] = true;
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          const [arrayValues, arrayMask] = this.#packArrayValues(value);
          values[key] = arrayValues;
          mask[key] = arrayMask;
        } else {
          const [objectValues, objectMask] = this.#packObjectValues(value);
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
    data: CommonType[] | Record<string, never>,
    mask: FunctionMask[] | Record<string, never>
  ): NetworkedType[] {
    if (!Array.isArray(data)) data = [];
    if (!Array.isArray(mask)) mask = [];

    const values: NetworkedType[] = [];

    for (const [i, item] of data.entries()) {
      const itemMask = mask[i];
      if (typeof item == 'string' && mask[i]) {
        values.push(this.#remoteCallback(item));
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
    data: Record<string, CommonType>,
    mask: Record<string, FunctionMask>
  ): Record<string, NetworkedType> {
    const values: Record<string, NetworkedType> = {};

    for (const [key, value] of Object.entries(data)) {
      const itemMask = mask[key];
      if (typeof value == 'string' && mask[key]) {
        values[key] = this.#remoteCallback(value);
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

  async sleep(time: number): Promise<void> {
    await this.run(`sleep`, time);
    return;
  }

  async write(text: string): Promise<number> {
    return this.run(`write`, text).then((out: [number]) => out[0]);
  }

  async print(...data: CommonType[]): Promise<number> {
    return this.run(`print`, ...data).then((out: [number]) => out[0]);
  }

  async printError(...data: CommonType[]): Promise<void> {
    await this.run(`printError`, ...data);
    return;
  }

  async read(
    replaceChar?: string,
    history?: CommonType[],
    completeFn?: (partial: string) => string[] | Promise<string[]>,
    defaultText?: string
  ): Promise<string> {
    return this.run(
      `read`,
      replaceChar,
      history,
      async (partial: string) => [await completeFn(partial)],
      defaultText
    ).then((out: [string]) => out[0]);
  }
}
