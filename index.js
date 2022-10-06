require('dotenv').config()
const express = require('express')
const cors = require('cors')
const errorHandler = require('./utils/erroHandler.js')
const { info, error } = require('./utils/logger.js')
const unknownEndpoint = require('./utils/unknownEndpoint')

const notesRouter = require('./controller/notes')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

app.use('/api/notes', notesRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  info(`Server running on PORT ${PORT}`)
})
