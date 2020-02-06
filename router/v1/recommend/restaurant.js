const express = require('express')
const request = require('request')
const jwt = require('jsonwebtoken')
const router = express.Router()

const restaurant = require(global.appRoot + '/models/restaurant')
const { wrapAsync } = require(global.appRoot + '/utils')

const url = 'http://recommender-travel-app.herokuapp.com/restaurant/'

const verifyToken = ((req, res, next) => {
    const bearerHeader = req.headers['authorization']
    if(bearerHeader){
        const token = bearerHeader.split(' ')[1]
        if(token){
            req.token = token
            const decoded = jwt.verify(token, 'RESTFULAPIs')
            if(decoded){
                next()
                return
            }
        }
    } 
    return res.status(403).send("Do not have permission")
})

router.get('/', verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        request(url + decoded.id, { json: true }, async(err, resp, body) => {
            if (err) { return console.log(err); }
            try {
                let restaurants = await restaurant.findResByRestIds(body)
                restaurants = restaurants.slice(0, 17)
                return res.status(200).json(restaurants)
            } catch (error) {
                console.log(error)
                return res.status(500).json(error)
            }
        })
    } catch (error) {
        console.log(error)
    }
}))

module.exports = router