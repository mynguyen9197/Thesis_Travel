const express = require('express')
const router = express.Router()
const ContentBasedRecommender = require('content-based-recommender')

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/place/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const recommender = new ContentBasedRecommender({
            minScore: 0.1,
            maxSimilarDocuments: 100
        });
        const documnets = await Activity.loadAllIdAndAboutPlaces()
        if ( documnets === null ) {
            return res.status(404).send({error: 'No Activity Was Found'})
        }
        recommender.train(documnets);
        const similarDocuments = recommender.getSimilarDocuments(placeid, 0, 10).map(x => x.id);
        const placeIds = documnets.filter(p => similarDocuments.includes(p.id)).map(x => x.id)
        const places = await Activity.findPlacesById(placeIds)
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