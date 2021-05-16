class CcSocket {

  /**
   * @param {import('ws')} socket 
   */
  constructor(socket) {
      this.socket = socket;
  }

  /**
   * @example
   * const [response, details] = await ccSocket.command('turtle.inspect()');
   * 
   * if (response === true) {
   *   console.log(`Inspected: ${details.name}`);
   * } else {
   *   console.log(`Was not able to inspect: ${details}`);
   * }
   * 
   * await ccSocket.close();
   * 
   * @param {string} commandString 
   * @returns {Promise<[*, *]>}
   */
  command(commandString) {
      this.socket.send(commandString);
  
      return new Promise(resolve => {
          this.socket.once('message', message => {
              resolve(JSON.parse(message));
          })
      })
  }
  
  /**
   * @returns {Promise<void>}
   */
  close() {
      this.socket.send('exit()');
      return new Promise(resolve => {
          this.socket.once('close', () => resolve());
      });
  }
}

module.exports = { CcSocket };
