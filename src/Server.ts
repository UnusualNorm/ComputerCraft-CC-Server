import http from 'http';
import { attachClientSource } from './Servers/Source';
import SocketServer from './Servers/Socket';
import Computer from './Computer';
import EventEmitter from 'events';

interface Server {
  on: (event: 'connection', listener: (computer: Computer) => unknown) => this;
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
