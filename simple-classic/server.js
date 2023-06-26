/*
a minimal classical app with express
it contains two pages, which are rendered views
state is maintained and passed between the two views
*/
const express = require('express')
const session = require('express-session')

const app = express()

// a view engine must be selected in order to render views to HTML
app.set('view engine', 'pug')

// express apps are composed of a series of middleware
// in this case we have an empty (passthrough) middleware
app.use((req, res, next) => {
	next()
})

// a session middleware necessary to maintain state between requests
app.use(session({secret : 'really secret secret'}))

// when the webroot is requested, the session is accessed an populated
// afterwards, a view is rendered based on some parameters
app.get('/', (req, res) => {
	const session = req.session
	session.someData = 'this is some session data'
	res.render('index', { title: 'some title', message: 'some message' })
})

// when navigating to next, the existing state is read from the session
// the rendered view is dependent on the session data in this case
app.get('/next', (req, res) => {
	const session = req.session
	const data = session.someData
	res.render('next', { data })
})

app.listen(8080)