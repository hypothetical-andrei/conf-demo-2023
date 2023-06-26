/*
a minimal custom web server with express
*/
const express = require('express')

// apps are created via a factory function
const app = express()

// creates an endpoint, for get requests to the web server root,
// the server will reply with ok and a status code of 200
// behaviour is defined as a function with the following parameters
// req - the request, which allows us to read parameters, headers etc.
// res - the response, which allows us to send a response to the client
// next - a function to pass control down the middleware chain
app.get('/', (req, res, next) => {
	res.status(200).send('ok')
})

// the served binds to a port and waits for client requests
app.listen(8080)