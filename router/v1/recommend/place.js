const express = require('express')
const ContentBasedRecommender = require('content-based-recommender')
const request = require('request')
const jwt = require('jsonwebtoken')
const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

const url = 'http://recommender-travel-app.herokuapp.com/place/'

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const listRatedPlace = await Activity.findRatedPlaceByUser(decoded.id)
        if(listRatedPlace.length == 0){
            const places = await Activity.loadTop20ByRating()
            return res.status(200).json(places)
        }
        request(url + decoded.id, { json: true }, async(err, resp, body) => {
            if (err) { return console.log(err); }
            try {
                const collabRecommendplaces = await Activity.loadPlacesByPlaceIds(body)
                // const contentRecommendPlaces = await contentRecommendPlace(listRatedPlace[0].place_id)
                // let places = collabRecommendplaces.concat(contentRecommendPlaces)
                // places = places.slice(0, 17)
                places = collabRecommendplaces.slice(0, 18)
                return res.status(200).json({places})
            } catch (error) {
                console.log(error)
                return res.status(500).json(error)
            }
        })
    } catch (error) {
        console.log(error)
    }
}))

const contentRecommendPlace = async(itemid) => {
    try {
        const recommender = new ContentBasedRecommender({
            minScore: 0.1,
            maxSimilarDocuments: 100
        });
        const documnets = await Activity.loadAllIdAndNamePlaces()
        if ( documnets === null ) {
            console.log('No Activity Was Found')
            return []
        }
        recommender.train(documnets);
        const similarDocuments = recommender.getSimilarDocuments(itemid, 0, 20).map(x => x.id);
        const placeIds = documnets.filter(p => similarDocuments.includes(p.id)).map(x => x.id)
        const places = await Activity.findPlacesById(placeIds)
        return places
    } catch (error) {
        console.log(error)
        return []
    }
}

router.get('/similarplace/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const documnets = await Activity.findOtherPlaceInGroup(placeid)
        const recommender = new ContentBasedRecommender({
            minScore: 0.1,
            maxSimilarDocuments: 100
        });
        if ( documnets === null ) {
            return res.status(404).send({error: 'No Activity Was Found'})
        }
        
        recommender.train(documnets);
        const similarDocuments = recommender.getSimilarDocuments(placeid, 0, 20);
        console.log(similarDocuments)
        const places = await Activity.findPlacesById(similarDocuments.map(x => x.id))
        return res.status(200).json({places: places})
    } catch (error) {
        return res.status(500).json({error})
    }
}))

router.get('/tour/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const recommender = new ContentBasedRecommender({
            minScore: 0.1,
            maxSimilarDocuments: 100
        });
        const documnets = await Tour.loadAllIdAndNameTours()
        const selectedPlace = await Activity.loadIdAndNamePlaceById(placeid)
        selectedPlace[0].id=1000
        documnets.push(selectedPlace[0])
        console.log(documnets)
        if ( documnets === null ) {
            return res.status(404).send({error: 'No Activity Was Found'})
        }
        recommender.train(documnets);
        const similarDocuments = recommender.getSimilarDocuments(selectedPlace[0].id, 0, 10).map(x => x.id);
        const placeIds = documnets.filter(p => similarDocuments.includes(p.id)).map(x => x.id)
        const places = await Activity.findPlacesById(placeIds)
        return res.status(200).json({places: places})
    } catch (error) {
        return res.status(500).json({error})
    }
}))

module.exports = router