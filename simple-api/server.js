/*
a simple REST api with express
the resources exposed are widget and part
a widgets has many parts, but apart has one parent widget
*/
const express = require('express')
// widget endpoints are defined in a separate module
const widgetRouter = require('./widget-router')

const app = express()

// we generate some data for testing purposes
function generateInitialData() {
	const data = []
	for (let i = 0; i < 10; i++) {
		const item = {
			id: i,
			description: `widget ${i}`,
			parts: []
		}
		for (let j = 0; j < 3; j++) {
			item.parts.push({
				id: 10 * i + j,
				description: `part ${j} of widget ${i}`
			})
		}
		data.push(item)
	}
	return data
}

// in order to have the data visible throughout the service we store it in app.locals
app.locals.widgets = generateInitialData()

// a simple logging middleware
// it just writes the requested url before passing control
app.use((req, res, next) => {
	console.log('REQUESTED ' + req.url)
	next()
})

// a middleware function, which can be applied to a single request or to multiple
const pingMiddleware = (req, res, next) => {
	console.log('i have been pinged')
	next()
}

// in order to receive json data, we must deserialize it with a middleware
app.use(express.json())

// the widget router is also a middleware
app.use('/widget-api', widgetRouter)

// this request uses a middelware before applying the processing function
app.get('/ping', pingMiddleware, (req, res, next) => {
	res.status(200).json({ message: 'pong' })
})

// this is implemented just to showcase error handling middleware
app.get('/error', (req, res, next) => {
	try {
		if (req.query.trigger === 'on') {
			throw new Error('some error')
		} else {
			res.status(200).send('no error')
		}
	} catch (err) {
		next(err)
	}
})

// an error handling middleware has a slightly different prototype
// error handling middleware should be the last in their chain
// they are designed to provide uniform error handling
app.use((err, req, res, next) => {
	console.warn(err)
	res.status(500).json({ message: 'some server error' })	
})

app.listen(8080)