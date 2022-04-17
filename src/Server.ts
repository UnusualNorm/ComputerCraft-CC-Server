import http from 'http';
import { attachClientSource } from './Servers/Source.js';
import SocketServer from './Servers/Socket.js';
import { Base } from './Computers.js';
import EventEmitter from 'events';

interface Server {
  on: (event: 'connection', listener: (computer: Base) => unknown) => this;
}
class Server extends EventEmitter {
  httpServer: http.Server;
  socketServer: SocketServer;

  constructor(server?: http.Server) {
    super();
    // If the user does not provide a server, create one with defaults.
    this.httpServer = server ? server : new http.Server();
    if (!server) attachClientSource(this.httpServer);

    this.socketServer = new SocketServer(this);
  }

  listen(port: number) {
    this.httpServer.listen(port);
  }
}

export default Server;
