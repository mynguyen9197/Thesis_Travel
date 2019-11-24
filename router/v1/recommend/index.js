const express = require('express')
const router = express.Router()
const ContentBasedRecommender = require('content-based-recommender')

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const recommender = new ContentBasedRecommender({
            minScore: 0.1,
            maxSimilarDocuments: 100
        });
        const documnets = await Activity.loadAllIdAndNamePlaces()
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

module.exports = router