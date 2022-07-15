import http from 'http';
import path from 'path';
import fs from 'fs';
import { Computer } from './Computer';
import EventEmitter from 'events';
import { WebSocketServer } from 'ws';

export function attachClientSource(server: http.Server, path = '/') {
  server.on('request', (request, response) => {
    if (request.url == path) {
      const clientSource = buildClientSource(request.headers.host);
      response.writeHead(200);
      response.end(clientSource, 'utf-8');
    }
  });
}

export function attachClientStartup(
  server: http.Server,
  sourcePath = '/',
  path = '/startup'
) {
  server.on('request', (request, response) => {
    if (request.url == path) {
      const startupSource = buildStartupSource(
        `${request.headers.host}${sourcePath}`
      );
      response.writeHead(200);
      response.end(startupSource, 'utf-8');
    }
  });
}

const sourcePath = path.join(__dirname, './Client/Client.lua');
const startupPath = path.join(__dirname, './Client/Startup.lua');
const clientSource = fs.readFileSync(sourcePath, { encoding: 'utf-8' });
const startupSource = fs.readFileSync(startupPath, { encoding: 'utf-8' });

export function buildClientSource(host: string) {
  const connectionVariableDefinition = `_G.ConnectionURL = "${host}"`;
  return `${connectionVariableDefinition}\n${clientSource}`;
}

export function buildStartupSource(source: string) {
  const connectionVariableDefinition = `_G.SourceURL = "http://${source}"`;
  return `${connectionVariableDefinition}\n${startupSource}`;
}

export interface Server {
  on: (event: 'connection', listener: (computer: Computer) => unknown) => this;
}

export class Server extends EventEmitter {
  httpServer: http.Server;
  wsServer: WebSocketServer;

  constructor(server?: http.Server) {
    super();
    if (!server) server = (() => {
      const server = new http.Server();
      attachClientSource(server);
      attachClientStartup(server);
      return server;
    })();
    this.httpServer = server;

    this.wsServer = new WebSocketServer({ server: this.httpServer });
    this.wsServer.on('connection', (socket) => {
      const computer = new Computer(socket);
      this.emit('connection', computer);
    });
  }

  listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void) {
    this.httpServer.listen(port, hostname, backlog, listeningListener);
  }

  close(callback?: (err?: Error) => void) {
    this.httpServer.close(callback);
  }
}
