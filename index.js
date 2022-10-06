const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const Note = require('./module/note')

const mongoose = require('mongoose')

const url = process.env.MONGO_URI

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}

app.get('/', (req, res) => {
  res.send('<h1>Hello from Express!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id
  Note.findById(id)
    .then((note) => {
      note ? response.json(note) : response.status(404).end()
    })
    .catch((err) => {
      console.warn(err)
      response.status(400).send({ error: 'Malformatted id' })
    })
})

// app.delete('/api/notes/:id', (request, response) => {
//   const id = Number(request.params.id)
//   notes = notes.filter((note) => note.id !== id)
//   response.status(204).end()
// })

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note.save().then((savedNote) => {
    console.error(savedNote)
    response.json(savedNote)
  })
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
