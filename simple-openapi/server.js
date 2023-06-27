const express = require('express')
const expressJSDocSwagger = require('express-jsdoc-swagger')
const validator = require('./validator')
const cors = require('cors')

const options = {
  info: {
    version: '1.0.0',
    title: 'User store',
    license: {
      name: 'MIT'
    }
  },
  baseDir: __dirname,
  filesPattern: './**/*.js',
  swaggerUIPath: '/api-docs',
  exposeSwaggerUI: true,
  exposeApiDocs: true,
  apiDocsPath: '/v3/api-docs',
  multiple: true
}

const app = express()
const instance = expressJSDocSwagger(app)(options)

const serverApp = async () => {
  const { validateRequest, validateResponse } = await validator(instance)

  /**
   * A user type
   * @typedef {object} User
   * @property {number} id - The user id
   * @property {string} username.required - The username
   * @property {string} password.required - The password,
   */

  app.locals.users = [{
    id: 1,
    username: 'jsmith',
    password: 'secret'
  }]

  app.use(express.json())

  const userRouter = express.Router()

  app.use('/user-api', userRouter)

  /**
   * GET /user-api/users
   * @summary Gets all users
   * @tags users
   * @return {array<User>} 200 - success response - application/json
   */
  userRouter.get('/users', validateRequest(), async (req, res, next) => {
    try {
      const users = app.locals.users
      const count = app.locals.users.length
      res.status(200).json({ items: users, count })
    } catch (error) {
      next(error)
    }
  })

  /**
   * POST /user-api/users
   * @summary Create user
   * @tags users
   * @param {User} request.body.required - user info
   * @return {User} 201 - success response - application/json
   */
  userRouter.post('/users', validateRequest(), async (req, res, next) => {
    try {
      const user = req.body
      app.locals.users.push(user)
      validateResponse(user, req, 201)
      res.payload = { content: user, code: 201 }
      next()
    } catch (error) {
      next(error)
    }
  })

  /**
   * GET /user-api/users/{id}
   * @summary Update user
   * @tags users
   * @param {number} id.path.required - the id of the user
   * @return {User} 202 - success response - application/json
   * @return {object} 404 - Not found
   */
  userRouter.get('/users/:id', async (req, res, next) => {
    try {
      const user = app.locals.users.find(e => e.id == req.params.id)
      if (!user) {
        res.status(404).json({ message: 'not found' })
      } else {
        res.status(200).json(user)
      }
    } catch (error) {
      next(error)
    }
  })

  /**
   * DELETE /user-api/users/{id}
   * @summary Update user
   * @tags users
   * @param {number} id.path.required - the id of the user
   * @return {object} 202 - success response - application/json
   * @return {object} 404 - Not found
   */
  userRouter.delete('/users/:id', async (req, res, next) => {
    try {
      const userIndex = app.locals.users.find(e => e.id == req.params.id)
      if (userIndex === -1) {
        res.status(404).json({ message: 'not found' })
      } else {
        app.locals.users.splice(userIndex, 1)
        res.status(202).json({ message: 'accepted' })
      }
    } catch (error) {
      next(error)
    }
  })

  /**
   * PUT /user-api/users/{id}
   * @summary Update user
   * @tags users
   * @param {number} id.path.required - the id of the user
   * @param {User} request.body.required - user info
   * @return {array<User>} 202 - success response - application/json
   * @return {object} 404 - Not found
   */
  userRouter.put('/users/:id', async (req, res, next) => {
    try {
      const userIndex = app.locals.users.find(e => e.id == req.params.id)
      if (userIndex === -1) {
        res.status(404).json({ message: 'not found' })
      } else {
        app.locals.users[userIndex] = req.body
        res.status(202).json({ message: 'accepted' })
      }
    } catch (error) {
      next(error)
    }
  })

  userRouter.use((req, res, next) => {
    // a validation middleware
    const { content, code } = res.payload
    validateResponse(content, req, code)
    res.status(code).json(content)
  })

  app.use((err, req, res, next) => {
    switch (err.name) {
      case 'OpenAPIUtilsError':
        switch (err.type) {
          case 'OpenAPIUtilsError:request': {
            const errors = err.extra.map(e => e.message)
            res.status(400).json({ message: 'malformed request', details: errors })
            break
          }
          default:
            res.status(500).json({ message: 'some unknown openapi error' })
        }
        break
      default:
        res.status(500).json({ message: 'some other error' })
    }
  })

  return app
}

const PORT = process.env.PORT || 8080

serverApp()
  .then(app =>
    app.listen(PORT, () =>
      console.log(`Listening PORT: ${PORT}`)
    ))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
