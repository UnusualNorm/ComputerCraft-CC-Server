# @unnusualnorm/computercraft-cc-server


A Node.js package providing a command and control server for ComputerCraft computers in Minecraft.
Allowing control over these in game computers (like turtles!) with Node.js using WebSockets.

---
## Disclaimer
This project is currently NOT uploaded to NPM, please disreguard below instructions and manually install it using git
```
npm install git+https://github.com/UnusualNorm/ComputerCraft-CC-Server
```

---

This project is meant to be used with the `CC:Tweaked` Minecraft mod:

- [https://github.com/SquidDev-CC/CC-Tweaked](https://github.com/SquidDev-CC/CC-Tweaked)
- [https://tweaked.cc/](https://tweaked.cc/)

This package provides/is going to provide:

- An HTTP server serving the lua script.
- A simple wrapper for cc: tweaked api's. (globals, peripherals, etc...)
- Modded Peripheral support.
- An easy to use event system for the server and computers.
- An easy way to send raw lua commands to a computer.

## To Do

- Add more events to ther server and computer
- Setup Peripheral and Global support
- Callback support for parameters
- Add more cached details

## Known Bugs

- If the server disconnects during an operation, the client crashes
- Arrays and objects are not supported for print() and printError()

# Usage

## Setting up a Control Server

Install the package:

```
npm install @unnusualnorm/computercraft-cc-server
```

Create a file, `server.js`, with the content:

```js
const { Server } = require('@unnusualnorm/computercraft-cc-server');

const port = 3000;
const server = new Server();

server.on('connection', async (computer) => {
  await computer.init;
  await computer.print('Hello World!');
  await computer.close();
});

server.listen(port);
console.log(`Listening on port ${port}!`);
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
const [success, details] = await turtle.inspect();

console.log('Inspection successful:', success);
console.log('Inspection details:', details);

await turtle.close();
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
const [successful, details] = await turtle.down();

console.log('Move successful:', successful);
console.log('Move details:', details);

await turtle.close();
```

The output would be:

```
Move successful: false
Move details: Movement obstructed
```
