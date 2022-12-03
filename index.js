const express = require('express'); // Import the express library
const app = express(); // Create an express app
const server = require('http').Server(app); // Create a http server
const io = require('socket.io')(server); // Import and initialize socket.io

// Create a map to store connected nodes
const nodes = new Map();

// Listen for incoming connections
io.on('connection', (socket) => {
  console.log('New client connected'); // Log a message when a new client connects

  // Listen for registration requests
  socket.on('register', (data) => {
    // Add the node to the map
    nodes.set(data.id, socket.id);
    console.log(`Node registered: ${data.id}`); // Log a message when a node is registered
  });

  // Listen for hole punching requests
  socket.on('hole punch', (data) => {
    // Forward the hole punch request to the recipient
    io.to(nodes.get(data.recipient)).emit('hole punch', data.request);
  });

  // Listen for messages
  socket.on('message', (data) => {
    // Forward the message to the recipient
    io.to(nodes.get(data.recipient)).emit('message', data.message);
  });

  // Listen for disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected'); // Log a message when a client disconnects

    // Remove the node from the map
    for (const [id, socketId] of nodes) {
      if (socketId === socket.id) {
        nodes.delete(id);
        console.log(`Node unregistered: ${id}`); // Log a message when a node is unregistered
        break;
      }
    }
  });
});

// Start the server on port 8080
server.listen(8080, () => {
  console.log('Signaling server listening on port 8080'); // Log a message when the server is started
});
