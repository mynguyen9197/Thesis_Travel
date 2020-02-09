const express = require('express')
const request = require('request')
const jwt = require('jsonwebtoken')
const ContentBasedRecommender = require('content-based-recommender')
const router = express.Router()

const restaurant = require(global.appRoot + '/models/restaurant')
const { wrapAsync } = require(global.appRoot + '/utils')

const url = 'http://recommender-travel-app.herokuapp.com/restaurant/'

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        request(url + decoded.id, { json: true }, async(err, resp, body) => {
            if (err) { return console.log(err); }
            try {
                let restaurants = await restaurant.findResByRestIds(body)
                restaurants = restaurants.slice(0, 18)
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

router.get('/similarrestaurant/:restid', wrapAsync(async(req, res, next) => {
    try {
        const { restid } = req.params
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const documnets = await restaurant.findOtherRestInCuisineGroup(restid)
        const recommender = new ContentBasedRecommender({
            minScore: 0.1,
            maxSimilarDocuments: 100
        })
        if ( documnets === null ) {
            return res.status(404).send({error: 'No Activity Was Found'})
        }
        
        recommender.train(documnets)
        const similarDocuments = recommender.getSimilarDocuments(restid, 0, 20)
        console.log(similarDocuments)
        const places = await restaurant.findResByRestIds(similarDocuments.map(x => x.id))
        return res.status(200).json({places: places})
    } catch (error) {
        return res.status(500).json({error})
    }
}))

module.exports = router