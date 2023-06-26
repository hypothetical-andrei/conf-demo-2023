/*
a simple http server, operating with requests
*/
const http = require('http')
const url = require('url')

// create a http server
const httpServer = http.createServer()

// when a request is received handle it
httpServer.on('request', (req, res) => {
	// parse the url of the request into its components
	const parsed = url.parse(req.url)
	console.log(parsed)

	// send a message to the client, content type must be specified
	res.writeHead(200, { 'Content-Type': 'text/plain' })
	res.end('got it!')
})

// the served binds to a port and waits for client requests
httpServer.listen(8080)