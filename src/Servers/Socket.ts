import { WebSocketServer as WSServer } from 'ws';
import { Base } from '../Computers';
import Server from '../Server';

class SocketServer {
  server: Server;
  wss: WSServer;

  constructor(server: Server) {
    this.server = server;
    this.wss = new WSServer({ server: server.httpServer });

    this.wss.on('connection', (socket) => {
      const computer = new Base(socket);
      server.emit('connection', computer);
    });
  }
}

export default SocketServer;
