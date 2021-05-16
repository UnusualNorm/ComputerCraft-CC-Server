const http = require('http');
const { attachClientSourceServer } = require('./clientSourceServer');
const { SocketServer } = require('./SocketServer');

class CcSocketServer {

  constructor() {
    this.httpServer = http.createServer();
    this.socketServer = new SocketServer(this.httpServer);

    attachClientSourceServer(this.httpServer);
  }

  /** 
   * @param {number} port 
   */
  listen(port) {
    this.httpServer.listen(port);
  }

  /**
   * @param {import('./SocketServer').ConnectionListener} listener 
   */
  addConnectionListener(listener) {
    this.socketServer.addConnectionListener(listener);
  }

}

module.exports = { CcSocketServer };