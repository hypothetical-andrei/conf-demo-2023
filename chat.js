/*
* a simple chat server, operating at socket level
* node abstracts socket communication and thread handling
*/
const net = require('net')

// create a socket server
const server = net.createServer()

// hold an array of clients to keep track of connections
const clients = [] 

// on the connection event write a message to the client and add it to the list
server.on('connection', (client) => {
	client.write('Welcome to the chat server! \n')
	clients.push(client)

	// when data is received, send it to all clients except the sender
	client.on('data', (data) => {
		for (let i = 0; i < clients.length; i++) {
			if (clients[i] !== client) {
				clients[i].write(data)
			}
		}
	})

	// if a client disconnects, they are removed from the list of connected clients
	client.on('end', () => {
		const index = clients.findIndex(e => e === client)
		clients.splice(index, 1)
	})
})

// the served binds to a port and waits for client connections
server.listen(3333)