import { WebSocketServer as WSServer } from 'ws';
import Computer from '../Computer';
import Server from '../Server';

class SocketServer {
  server: Server;
  wss: WSServer;

  constructor(server: Server) {
    this.server = server;
    this.wss = new WSServer({ server: server.httpServer });

    this.wss.on('connection', (socket) => {
      const computer = new Computer(socket);
      server.emit('connection', computer);
    });
  }
}

export default SocketServer;
