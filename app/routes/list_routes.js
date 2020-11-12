const express = require('express')

const passport = require('passport')

const List = require('../models/list')

// custom errors
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

// middleware
const removeBlanks = require('../../lib/remove_blank_fields')
const list = require('../models/list')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// CREATE 
// POST /lists
router.post('/lists', requireToken, (req, res, next) => {
    // owner of new list is the current user
    req.body.list.owner = req.user.id

    List.create(req.body.list)
    // respond to a successful 'create' with 201 and JSON of the created list
    .then(list => {
        res.status(201).json({ list: list.toObject() })
    })
    // if an error occurs, pass it off to the error handler
    .catch(next)
})

// INDEX
// GET /lists
router.get('/lists', (req, res, next) => {
    List.find()
      .then(list => {
        // `examples` will be an array of Mongoose documents
        // we want to convert each one to a POJO, so we use `.map` to
        // apply `.toObject` to each one
        return list.map(list => list.toObject())
      })
      // respond with status 200 and JSON of the examples
      .then(list => res.status(200).json({ list: list }))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

  // SHOW
// GET /lists/5a7db6c74d55bc51bdf39793
router.get('/lists/:id', (req, res, next) => {
    // req.params.id will be set based on the `:id` in the route
    List.findById(req.params.id)
      .then(handle404)
      // if `findById` is succesful, respond with 200 and "example" JSON
      .then(list => res.status(200).json({ list: list.toObject() }))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/lists/:id', requireToken, removeBlanks, (req, res, next) => {
    // if the client attempts to change the `owner` property by including a new
    // owner, prevent that by deleting that key/value pair
    delete req.body.list.owner
  
    List.findById(req.params.id)
      .then(handle404)
      .then(list => {
        // pass the `req` object and the Mongoose record to `requireOwnership`
        // it will throw an error if the current user isn't the owner
        requireOwnership(req, list)
  
        // pass the result of Mongoose's `.update` to the next `.then`
        return list.updateOne(req.body.list)
      })
      // if that succeeded, return 204 and no JSON
      .then(() => res.sendStatus(204))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

  // DESTROY
// DELETE /lists/5a7db6c74d55bc51bdf39793
router.delete('/lists/:id', requireToken, (req, res, next) => {
    List.findById(req.params.id)
      .then(handle404)
      .then(list => {
        // throw an error if current user doesn't own `list`
        requireOwnership(req, list)
        // delete the example ONLY IF the above didn't throw
        list.deleteOne()
      })
      // send back 204 and no content if the deletion succeeded
      .then(() => res.sendStatus(204))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

module.exports = router