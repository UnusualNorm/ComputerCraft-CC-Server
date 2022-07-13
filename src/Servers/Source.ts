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

function attachClientUpdater(server: http.Server, sourcePath = '/', path = '/updater') {
  server.on('request', (request, response) => {
    if (request.url == path) {
      const updaterSource = buildUpdaterSource(`${request.headers.host}${sourcePath}`);
      response.writeHead(200);
      response.end(updaterSource, 'utf-8');
    }
  });
}

const sourcePath = path.join(__dirname, '../Client/Client.lua');
const updaterPath = path.join(__dirname, '../Client/Updater.lua');
const clientSource = fs.readFileSync(sourcePath, { encoding: 'utf-8' });
const updaterSource = fs.readFileSync(updaterPath, { encoding: 'utf-8' });

function buildClientSource(host: string) {
  const connectionVariableDefinition = `_G.ConnectionURL = "${host}"`;
  return `${connectionVariableDefinition}\n${clientSource}`;
}

function buildUpdaterSource(source: string) {
  const connectionVariableDefinition = `_G.ConnectionURL = "http://${source}"`;
  return `${connectionVariableDefinition}\n${updaterSource}`;
}

export { attachClientSource, attachClientUpdater, buildClientSource, buildUpdaterSource };
