const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors');

mongoose.connect('mongodb://127.0.0.1:27017/hoian_travel')

const app = express()

global.appRoot = path.resolve(__dirname)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors());
app.options('*', cors());

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