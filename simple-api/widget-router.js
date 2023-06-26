const express = require('express')

const router = express.Router()

// get all widgets, with support for filtering, paging and sorting
// in order to sort widgets, sortField and sortOrder must be provided
// in order to filter widgets, filterField and filterCotent must be provided
// in order to get a certain page, pageNo must be provided
// pageSize can be provided, but defaults to 10
router.get('/widgets', (req, res, next) => {
	let { filterField, filterContent, pageNo, pageSize, sortField, sortOrder } = req.query
	let widgets = [ ...res.app.locals.widgets ]
	let count = widgets.length
	widgets.forEach(e => delete e['parts'])
	if (filterField && filterContent) {
		widgets = widgets.filter(e => e[filterField].includes(filterContent))
	}
	if (sortField && sortOrder) {
		let order = sortOrder === 'ASC' ? 1 : -1
		widgets = widgets.sort((a, b) => {
			if (a[sortField] > b[sortField]) {
				return order
			}
			if (a[sortField] < b[sortField]) {
				return -1 * order
			}
			return 0
		})
	}
	if (pageNo) {
		const page = parseInt(pageNo)
		let size = 10
		if (pageSize) {
			size = parseInt(pageSize)
		}
		widgets = widgets.slice(page * size, (page + 1) * size)
	}
	res.status(200).json({ data: widgets, count })
})

// add a widget
router.post('/widgets', (req, res, next) => {
	const widget = req.body
	widget.parts = []
	res.app.locals.widgets.push(widget)
	res.status(201).json({ message: 'created' })
})

// get a particular widget
// the widget is specified with a path parameter
// if not found a 404 code is returned
router.get('/widgets/:wid', (req, res, next) => {
	const id = parseInt(req.params.wid)
	const widget = res.app.locals.widgets.find(e => e.id === id)
	if (widget) {
		delete widget['parts']
		res.status(200).json(widget)
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

// update a particular widget
// the widget is specified with a path parameter
// if not found a 404 code is returned
router.put('/widgets/:wid', (req, res, next) => {
	const id = parseInt(req.params.wid)
	const widgetIndex = res.app.locals.widgets.findIndex(e => e.id === id)
	if (widgetIndex !== -1) {
		res.app.locals.widgets[widgetIndex].description = req.body.description
		res.status(202).json({ message: 'accepted' })
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

// delete a particular widget
// the widget is specified with a path parameter
// if not found a 404 code is returned
router.delete('/widgets/:wid', (req, res, next) => {
	const id = parseInt(req.params.wid)
	const widgetIndex = res.app.locals.widgets.findIndex(e => e.id === id)
	if (widgetIndex !== -1) {
		res.app.locals.widgets.splice(widgetIndex, 1)
		res.status(202).json({ message: 'accepted' })
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

// get all parts of a particular widget
// the widget is specified with a path parameter
// if the parent is not found a 404 code is returned
// we ommit sorting, paging and filtering for simplicity
router.get('/widgets/:wid/parts', (req, res, next) => {
	const id = parseInt(req.params.wid)
	const widget = res.app.locals.widgets.find(e => e.id === id)
	if (widget) {
		res.status(200).json({ data: widget.parts, count: widget.parts.length })			
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

// add a part a particular widget
// the widget is specified with a path parameter
// if the parent is not found a 404 code is returned
router.post('/widgets/:wid/parts', (req, res, next) => {
	const id = parseInt(req.params.wid)
	const widgetIndex = res.app.locals.widgets.findIndex(e => e.id === id)
	if (widgetIndex !== -1) {
		res.app.locals.widgets[widgetIndex].parts.push(req.body)
		res.status(201).json({ message: 'created' })
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

// get a particular a part of a particular widget
// the widget and part are specified as path parameters
// if the parent or the child are not found a 404 code is returned
router.get('/widgets/:wid/parts/:pid', (req, res, next) => {
	const wid = parseInt(req.params.wid)
	const pid = parseInt(req.params.pid)
	const widget = res.app.locals.widgets.find(e => e.id === wid)
	if (widget) {
		const part = widget.parts.find(e => e.id === pid)
		if (part) {
			res.status(200).json(part)
		}	else {
			res.status(404).json({ message: 'not found' })
		}		
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

// modify a part of a particular widget
// the widget and part are specified as path parameters
// if the parent or the child are not found a 404 code is returned
router.put('/widgets/:wid/parts/:pid', (req, res, next) => {
	const wid = parseInt(req.params.wid)
	const pid = parseInt(req.params.pid)
	const widgetIndex = res.app.locals.widgets.findIndex(e => e.id === wid)
	if (widgetIndex !== -1) {
		const partIndex = res.app.locals.widgets[widgetIndex].parts.findIndex(e => e.id === pid)
		if (partIndex !== -1) {
			res.app.locals.widgets[widgetIndex].parts[partIndex].description = req.body.description
			res.status(202).json({ message: 'accepted' })
		}	else {
			res.status(404).json({ message: 'not found' })
		}		
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

// delete a part of a particular widget
// the widget and part are specified as path parameters
// if the parent or the child are not found a 404 code is returned
router.delete('/widgets/:wid/parts/:pid', (req, res, next) => {
	const wid = parseInt(req.params.wid)
	const pid = parseInt(req.params.pid)
	const widgetIndex = res.app.locals.widgets.findIndex(e => e.id === wid)
	if (widgetIndex !== -1) {
		const partIndex = res.app.locals.widgets[widgetIndex].parts.findIndex(e => e.id === pid)
		if (partIndex !== -1) {
			res.app.locals.widgets[widgetIndex].parts.splice(partIndex, 1)
			res.status(202).json({ message: 'accepted' })
		}	else {
			res.status(404).json({ message: 'not found' })
		}		
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

module.exports = router