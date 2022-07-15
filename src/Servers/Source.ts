import http from 'http';
import fs from 'fs';
import path from 'path';

function attachClientSource(server: http.Server, path = '/') {
  server.on('request', (request, response) => {
    if (request.url == path) {
      const clientSource = buildClientSource(request.headers.host);
      response.writeHead(200);
      response.end(clientSource, 'utf-8');
    }
  });
}

function attachClientStartup(
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

const sourcePath = path.join(__dirname, '../Client/Client.lua');
const startupPath = path.join(__dirname, '../Client/Startup.lua');
const clientSource = fs.readFileSync(sourcePath, { encoding: 'utf-8' });
const startupSource = fs.readFileSync(startupPath, { encoding: 'utf-8' });

function buildClientSource(host: string) {
  const connectionVariableDefinition = `_G.ConnectionURL = "${host}"`;
  return `${connectionVariableDefinition}\n${clientSource}`;
}

function buildStartupSource(source: string) {
  const connectionVariableDefinition = `_G.SourceURL = "http://${source}"`;
  return `${connectionVariableDefinition}\n${startupSource}`;
}

export {
  attachClientSource,
  attachClientStartup,
  buildClientSource,
  buildStartupSource,
};
