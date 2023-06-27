/* 
this is a simple code sharing tool with express
*/
const express = require('express')
// we will need to uniquely identify code snippets
const { v4: uuidv4 } = require('uuid')
// this is optional, but it is preferable to send text gzipped for performance
const compression = require('compression')
// we need a library to interact with persistent storage
const Database = require('better-sqlite3')

// create/open the database
const db = new Database('code.db', { verbose: console.log })

const app = express()

// create the table to store the snippets
db.prepare(`create table if not exists snippets (
  id string primary key autoincrement,
  content text
)`).run()

// in order to avoid injection, we use prepared statements
// for any value that comes from the user
const insert = db.prepare('insert into snippets (id, content) values (@id, @content)')
const read = db.prepare('select * from snippets where id=@id')

// we use ejs as a view templating engine in this case
app.set('view engine', 'ejs')
app.use(compression())

// the data received will be serialized as urlencoded instead of JSON
app.use(express.urlencoded({ extended: true }))

// render the homepage when requesting the web root
app.get('/', (req, res) => {
  res.render('pages/index')
})

// add a paste to the database
// a unique id is generated and the code is stored in the database
// afterwards, the user is redirected to a page displaying the saved paste
app.post('/pastes', (req, res) => {
  const key = uuidv4()
  insert.run({ id: key, content: req.body.content })
  res.redirect(`pastes/${key}`)
})

// get a particular paste
// retrieval is based on the unique identifier
// if it exists, it is rendered in a view template
// otherwise, a 404 page is rendered
app.get('/pastes/:id', (req, res) => {
  let key = req.params.id
  const record = read.get({ id: key})
  const paste = record?.content
  if (paste) {
    res.render('pages/paste', { paste, key })
  } else {
    res.status(404).render('pages/404')
  }
})

// get a paste as plain text to make copy pasting easier
app.get('/pastes/raw/:id', (req, res) => {
  let key = req.params.id
  const record = read.get({ id: key})
  const paste = record?.content
  if (paste) {
    res.status(200).set('Content-Type', 'text/plain').send(paste)
  } else {
    res.status(404).render('pages/404')
  }
})

app.listen(8080)


