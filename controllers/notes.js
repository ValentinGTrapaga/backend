const notesRouter = require('express').Router()

const jwt = require('jsonwebtoken')

const Note = require('../models/note.js')
const User = require('../models/user.js')
const { SECRET } = require('../utils/config.js')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const id = request.params.id

  const note = await Note.findById(id)
  note ? response.json(note) : response.status(404).end()
})

notesRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  await Note.findByIdAndRemove(id)
  response.status(204).end()
})

notesRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const { content, important } = request.body

  const foundNote = await Note.findByIdAndUpdate(
    id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
  response.json(foundNote)
})

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

notesRouter.post('/', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important === undefined ? false : body.important,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.json(savedNote)
})

module.exports = notesRouter
