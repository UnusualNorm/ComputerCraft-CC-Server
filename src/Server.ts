import http from 'http';
import { attachClientSource, attachClientUpdater } from './Servers/Source';
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
    this.httpServer = server ? server : (() => {
      const server = new http.Server();
      attachClientSource(server);
      attachClientUpdater(server);
      return server;
    })();

    this.socketServer = new SocketServer(this);
  }

  listen(port: number) {
    this.httpServer.listen(port);
  }
}

export default Server;
