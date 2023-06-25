const express = require('express')
const widgetRouter = require('./widget-router')

const app = express()

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
	}
	return data
}

app.locals.widgets = generateInitialData()

app.use((req, res, next) => {
	console.log('REQUESTED ' + req.url)
	next()
})

const pingMiddleware = (req, res, next) => {
	console.log('i have been pinged')
	next()
}

app.use(express.json())

app.use('/widget-api', widgetRouter)

app.get('/ping', pingMiddleware, (req, res, next) => {
	res.status(200).json({ message: 'pong' })
})

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

app.use((err, req, res, next) => {
	console.warn(err)
	res.status(500).json({ message: 'some server error' })	
})

app.listen(8080)