import { JsonTypes, Side } from './CCLua';

interface BaseEvents {
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
  on(event: 'alarm', listener: (id: number) => unknown): this;

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
  on(event: 'char', listener: (character: string) => unknown): this;

  /**
   * @description The computer_command event is fired when the /computercraft queue command is run for the current computer.
   * @returns The arguments passed to the command.
   * @example
   * // Prints the contents of messages sent:
   * computer.on('computer_command', args => console.log('Received message:', ...args))
   */
  on(event: 'computer_command', listener: (args: string[]) => unknown): this;

  /**
   * @description The disk event is fired when a disk is inserted into an adjacent or networked disk drive.
   * @returns The side of the disk drive that had a disk inserted.
   * @example
   * // Prints a message when a disk is inserted:
   * computer.on('disk', side => console.log(`Inserted a disk on side ${side}`))
   * @see disk_eject For the event sent when a disk is removed.
   */
  on(event: 'disk', listener: (side: Side) => unknown): this;

  /**
   * @description The disk_eject event is fired when a disk is removed from an adjacent or networked disk drive.
   * @returns The side of the disk drive that had a disk removed.
   * @example
   * // Prints a message when a disk is removed:
   * computer.on('disk_eject', side => console.log(`Removed a disk on side ${side}`))
   * @see disk For the event sent when a disk is inserted.
   */
  on(event: 'disk_eject', listener: (side: Side) => unknown): this;

  on(
    event: 'http_check',
    listener: (url: string, success: boolean, err: string) => unknown
  ): this;

  on(
    event: 'http_failure',
    listener: (url: string, err: string, handle: null) => unknown
  ): this;

  on(
    event: 'http_success',
    listener: (url: string, handle: null) => unknown
  ): this;

  on(event: 'key', listener: (key: number, is_held: boolean) => unknown): this;

  on(event: 'key_up', listener: (key: number) => unknown): this;

  on(
    event: 'modem_message',
    listener: (
      side: Side,
      channel: number,
      replyChannel: number,
      message: JsonTypes,
      distance: number
    ) => unknown
  ): this;

  on(event: 'monitor_resize', listener: (side: Side) => unknown): this;
  on(event: 'monitor_resize', listener: (id: number) => unknown): this;

  on(
    event: 'monitor_touch',
    listener: (side: Side, x: number, y: number) => unknown
  ): this;
  on(
    event: 'monitor_touch',
    listener: (id: number, x: number, y: number) => unknown
  ): this;

  on(
    event: 'mouse_click',
    listener: (button: number, x: number, y: number) => unknown
  ): this;

  on(
    event: 'mouse_drag',
    listener: (button: number, x: number, y: number) => unknown
  ): this;

  on(
    event: 'mouse_scroll',
    listener: (dir: -1 | 1, x: number, y: number) => unknown
  ): this;

  on(
    event: 'mouse_up',
    listener: (button: number, x: number, y: number) => unknown
  ): this;

  on(event: 'paste', listener: (text: string) => unknown): this;

  on(event: 'peripheral', listener: (side: Side) => unknown): this;

  on(event: 'peripheral_detach', listener: (side: Side) => unknown): this;

  on(
    event: 'rednet_message',
    listener: (sender: number, message: JsonTypes, protocol: string) => unknown
  ): this;

  on(event: 'redstone', listener: () => unknown): this;

  on(event: 'speaker_audio_empty', listener: (name: string) => unknown): this;

  on(
    event: 'task_complete',
    listener: (
      id: number,
      success: boolean,
      err: string,
      ...params: string[]
    ) => unknown
  ): this;

  on(event: 'term_resize', listener: () => unknown): this;

  on(event: 'terminate', listener: () => unknown): this;

  on(event: 'timer', listener: (id: number) => unknown): this;

  on(event: 'turtle_inventory', listener: () => unknown): this;
}

export default BaseEvents;
