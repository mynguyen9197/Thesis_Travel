const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()

global.appRoot = path.resolve(__dirname)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api', require('./router'))

// custom response headers
app.use((req, res, next) => {
  res.sendStatus(404)
})

app.use((err, req, res, next) => {
  res.status(500)
  res.send(err)
})

module.exports = app