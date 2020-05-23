const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors');
const session = require('express-session');

const app = express()

global.appRoot = path.resolve(__dirname)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/user_upload', express.static('user_upload'))

app.use(session({
  secret: 'keyboard cat', 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

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