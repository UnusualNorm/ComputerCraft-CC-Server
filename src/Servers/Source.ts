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

const sourcePath = path.join(__dirname, '../Client.lua');
const clientSource = fs.readFileSync(sourcePath, { encoding: 'utf-8' });

function buildClientSource(host: string) {
  const connectionVariableDefinition = `local connectionURL = "ws://${host}"`;
  return `${connectionVariableDefinition}\n${clientSource}`;
}

export { attachClientSource, buildClientSource };
