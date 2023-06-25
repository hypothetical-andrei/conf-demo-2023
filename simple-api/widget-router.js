const express = require('express')

const router = express.Router()


router.get('/widgets', (req, res, next) => {
	let { filterField, filterContent, pageNo, pageSize, sortField, sortOrder } = req.query
	let widgets = { ...res.app.locals.widgets }
	let count = widgets.length
	widgets.forEach(e => delete e['parts'])
	if (filterField && filterContent) {
		widgets = widgets.filter(e => e[filterField] === filterContent)
	}
	if (sortField && sortOrder) {
		let order = sortOrder === 'ASC' ? 1 : -1
		widgets = widgets.sort((a, b) => (a[sortField] - b[sortField]) * order)
	}
	if (pageNo) {
		const page = parseInt(pageNo)
		let size = 10
		if (pageSize) {
			size = parseInt(pageSize)
		}
		widgets = widgets.slice(page * size, size)
	}
	res.status(200).json({ data: widgets, count })
})

router.post('/widgets', (req, res, next) => {
	const widget = req.body
	widget.parts = []
	res.app.locals.widgets.push(widget)
	res.status(201).json({ message: 'created' })
})

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

// we ommit sorting, paging and filtering for simplicity
router.get('/widgets/:wid/parts', (req, res, next) => {
	const id = parseInt(req.params.wid)
	const widgetIndex = res.app.locals.widgets.findIndex(e => e.id === id)
	if (widgetIndex !== -1) {
		res.status(200).json({ data: widget.parts, count: widget.parts.length })			
	} else {
		res.status(404).json({ message: 'not found' })
	}
})

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

router.get('/widgets/:wid/parts/:pid', (req, res, next) => {

})

router.put('/widgets/:wid/parts/:pid', (req, res, next) => {})
router.delete('/widgets/:wid/parts/:pid', (req, res, next) => {})

module.exports = router