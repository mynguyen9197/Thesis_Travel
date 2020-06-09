const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors');
const session = require('express-session');

const app = express()

global.appRoot = path.resolve(__dirname)
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
app.use('/user_upload', express.static('user_upload'))
app.use('/place_images', express.static('place_images'))
app.use('/tour_images', express.static('tour_images'))
app.use('/restaurant_images', express.static('restaurant_images'))

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