import { CommonTypes, Side } from './ComputerCraft';
import { FSGlobalNewtworkedTypes } from './Globals';

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
    message: CommonTypes,
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
    message: CommonTypes,
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

export interface ComputerEventEmitter {
  on<U extends keyof ComputerEvents>(
    event: U,
    listener: ComputerEvents[U]
  ): this;

  emit<U extends keyof ComputerEvents>(
    event: U,
    ...args: Parameters<ComputerEvents[U]>
  ): boolean;
}

export type NetworkedCallback = (
  ...args: NetworkedTypes[]
) => NetworkedTypes[] | Promise<NetworkedTypes[]>;

export type FunctionMask =
  | boolean
  | FunctionMask[]
  | { [x: string]: FunctionMask };

export type NetworkedTypes =
  | CommonTypes
  | NetworkedCallback
  | NetworkedTypes[]
  | { [x: string]: NetworkedTypes }
  | FSGlobalNewtworkedTypes;

export type NetworkInputs =
  | ['eval', string, boolean, CommonTypes[], FunctionMask[]]
  | ['callback', 'req', string, string, CommonTypes[], FunctionMask[]]
  | ['callback', 'res', string, CommonTypes[], FunctionMask[]]
  | ['event', string, CommonTypes[], FunctionMask[]];
