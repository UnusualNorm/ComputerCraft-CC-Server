const { readFile } = require('fs').promises;
const path = require('path');

/**
 * @param {import('http').Server} server 
 */
function attachClientSourceServer(server) {
  server.on('request', async (request, response) => {
    const clientSource = await buildClientSource(request.headers.host);
  
    response.writeHead(200);
    response.end(clientSource, 'utf-8');
  });
}

/** @type {string} */
let partialClientSource;

/**
 * @param {string} host 
 */
async function buildClientSource(host) {
  const connectionVariableDefinition = `local connectionURL = "ws://${host}"`
  
  if (!partialClientSource) {
    const sourcePath = path.join(__dirname, 'partialClient.lua');
    partialClientSource = await readFile(sourcePath);
  }

  return `${connectionVariableDefinition}\n${partialClientSource}`;
}

module.exports = { attachClientSourceServer };