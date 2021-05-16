const ws = require('ws');
const { CcSocket } = require('./CcSocket');

/**
 * @callback ConnectionListener
 * @param {CcSocket} ccSocket
 * @returns {void}
 */

class SocketServer {

  /**
   * @param {import('http').Server} server 
   */
  constructor(server) {
    /** @type {ConnectionListener[]} */
    this.connectionListeners = [];

    this.wss = new ws.Server({ server });
  
    this.wss.on('connection', socket => {
      const ccSocket = new CcSocket(socket);
      this.connectionListeners.forEach(listener => listener(ccSocket));
    });
  }

  /**
   * @param {ConnectionListener} listener 
   */
  addConnectionListener(listener) {
    this.connectionListeners.push(listener);
  }
}

module.exports = { SocketServer };
