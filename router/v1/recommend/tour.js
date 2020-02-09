const express = require('express')
const request = require('request')
const jwt = require('jsonwebtoken')
const ContentBasedRecommender = require('content-based-recommender')
const router = express.Router()

const tour = require(global.appRoot + '/models/tour')
const { wrapAsync } = require(global.appRoot + '/utils')

const url = 'http://recommender-travel-app.herokuapp.com/tour/'

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        request(url + decoded.id, { json: true }, async(err, resp, body) => {
            if (err) { return console.log(err); }
            try {
                let tours = await tour.loadTourByListId(body)
                tours = tours.slice(0, 18)
                return res.status(200).json(tours)
            } catch (error) {
                console.log(error)
                return res.status(500).json(error)
            }
        })
    } catch (error) {
        console.log(error)
    }
}))

router.get('/similartour/:tourid', wrapAsync(async(req, res, next) => {
    try {
        const { tourid } = req.params
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const documnets = await tour.findOtherTourInGroup(tourid)
        const recommender = new ContentBasedRecommender({
            minScore: 0.1,
            maxSimilarDocuments: 100
        });
        if ( documnets === null ) {
            return res.status(404).send({error: 'No Tour Was Found'})
        }
        
        recommender.train(documnets);
        const similarDocuments = recommender.getSimilarDocuments(tourid, 0, 20);
        console.log(similarDocuments)
        const tours = await tour.loadTourByListId(similarDocuments.map(x => x.id))
        return res.status(200).json({tours: tours})
    } catch (error) {
        return res.status(500).json({error})
    }
}))

module.exports = router