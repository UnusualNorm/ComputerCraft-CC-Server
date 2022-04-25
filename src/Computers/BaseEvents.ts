interface BaseEvents {
  on(event: 'close', listener: () => unknown): this;

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
  on(event: 'disk', listener: (side: string) => unknown): this;

  /**
   * @description The disk_eject event is fired when a disk is removed from an adjacent or networked disk drive.
   * @returns The side of the disk drive that had a disk removed.
   * @example
   * // Prints a message when a disk is removed:
   * computer.on('disk_eject', side => console.log(`Removed a disk on side ${side}`))
   * @see disk For the event sent when a disk is inserted.
   */
   on(event: 'disk_eject', listener: (side: string) => unknown): this;

   on(event: 'http_check', listener: () => unknown): this;
   on(event: 'http_failure', listener: () => unknown): this;
   on(event: 'http_success', listener: () => unknown): this;
   on(event: 'key', listener: () => unknown): this;
   on(event: 'key_up', listener: () => unknown): this;
   on(event: 'modem_message', listener: () => unknown): this;
   on(event: 'monitor_resize', listener: () => unknown): this;
   on(event: 'monitor_touch', listener: () => unknown): this;
   on(event: 'mouse_click', listener: () => unknown): this;
   on(event: 'mouse_drag', listener: () => unknown): this;
   on(event: 'mouse_scroll', listener: () => unknown): this;
   on(event: 'mouse_up', listener: () => unknown): this;
   on(event: 'paste', listener: () => unknown): this;
   on(event: 'peripheral', listener: () => unknown): this;
   on(event: 'peripheral_detach', listener: () => unknown): this;
   on(event: 'rednet_message', listener: () => unknown): this;
   on(event: 'redstone', listener: () => unknown): this;
   on(event: 'speaker_audio_empty', listener: () => unknown): this;
   on(event: 'task_complete', listener: () => unknown): this;
   on(event: 'term_resize', listener: () => unknown): this;
   on(event: 'terminate', listener: () => unknown): this;
   on(event: 'timer', listener: () => unknown): this;
   on(event: 'turtle_inventory', listener: () => unknown): this;
   on(event: 'websocket_closed', listener: () => unknown): this;
   on(event: 'websocket_failure', listener: () => unknown): this;
   on(event: 'websocket_message', listener: () => unknown): this;
   on(event: 'websocket_success', listener: () => unknown): this;
}

export default BaseEvents;