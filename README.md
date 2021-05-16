# @wwaaijer/cc-socket-server
A Node.js package providing a proof of concept command and control server for ComputerCraft computers in Minecraft.
Allowing control over these in game computers (like turtles!) with Node.js using WebSockets.

This project is meant to be used with the `CC:Tweaked` Minecraft mod:

- [https://github.com/SquidDev-CC/CC-Tweaked](https://github.com/SquidDev-CC/CC-Tweaked)
- [https://tweaked.cc/](https://tweaked.cc/)

This package provides:

- A server serving a Lua script over HTTP with instructions to open a WebSocket the the same address.
- A listener can be added to be informed if a WebSocket connection is opened.
- Raw Lua commands can be send to the connected ComputerCraft computers.

# Usage

## Setting up a control server
Install the package:
```
npm install @wwaaijer/cc-socket-server
```

Create a file, `server.js`, with the content:
```js
const { CcSocketServer } = require('@wwaaijer/cc-socket-server');

const port = 3000;
const ccSocketServer = new CcSocketServer();

ccSocketServer.addConnectionListener(async (ccSocket) => {
  await ccSocket.command('print("Hello World!")');
  await ccSocket.close();
});

ccSocketServer.listen(port);
console.log(`Listening on port ${port}`);
```

Start the server:
```
node server.js
```

## Allow your ComputerCraft computers to connect to your server
Before you hop into a Minecraft world you want to make sure ComputerCraft is setup to allow connections to the correct address.
As this is meant as a proof of concept project I assume the following setup:

- Server running on your own PC/laptop
- Minecraft single player world running on the same PC/laptop

To make this work you'll need to allow connections to your localhost as described here:
[Allowing access to local IPs](https://github.com/SquidDev-CC/CC-Tweaked/wiki/Allowing-access-to-local-IPs)

## Connect a ComputerCraft computer to the control server
Switch to Minecraft and open up the terminal of the computer/turtle you would like to control with the server.
In the terminal of the computer/turtle use the `wget` program to download and run the Lua script exposed by the server:
```
wget run http://localhost:3000
```

The computer will retrieve a Lua script from the server with instructions to open up a web socket.
From then on your javascript code will have control of the ComputerCraft computer/turtle.

![alt text](./computer-run-example.png)

> If you see `Domain not permitted`, your ComputerCraft configuration is not correct yet.
> Make sure you complete the step above, "Allow your ComputerCraft computers to connect to your server".

## Working with return values
All commands return an array with 1 or 2 values.
The first value being the result and the second value being details to the result, if applicable.

For instance for the `turtle.inspect()` command.
The first value will state if a block was detected.
The second value will contain the block that it detected.

```js
const [success, details] = await ccSocket.command('turtle.inspect()');

console.log('Inspection successful:', success);
console.log('Inspection details:', details);

await ccSocket.close();
```

Output:

```
Inspection success: true
Inspection details: {
  name: 'minecraft:birch_log',
  state: { axis: 'y' },
  tags: {
    'minecraft:logs_that_burn': true,
    'minecraft:birch_logs': true,
    'minecraft:logs': true
  }
}
```

Or, for when a movement command of a turtle fails like the `turtle.down()` command:

```js
const [successful, details] = await ccSocket.command('turtle.down()');

console.log('Move successful:', successful);
console.log('Move details:', details);

await ccSocket.close();
```

The output would be:

```
Move successful: false
Move details: Movement obstructed
```
