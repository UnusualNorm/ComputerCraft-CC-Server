import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

// Since we're using ESM, patch in __dirname
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function attachClientSource(server: http.Server, path = '/') {
  server.on('request', async (request, response) => {
    if (request.url == path) {
      const clientSource = await buildClientSource(request.headers.host);
      response.writeHead(200);
      response.end(clientSource, 'utf-8');
    }
  });
}

const sourcePath = path.join(__dirname, '../Client.lua');
const clientSource = await fs.readFile(sourcePath, { encoding: 'utf-8' });

async function buildClientSource(host: string) {
  const connectionVariableDefinition = `local connectionURL = "ws://${host}"`;
  return `${connectionVariableDefinition}\n${clientSource}`;
}

export { attachClientSource, buildClientSource };
