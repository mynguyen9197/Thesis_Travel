const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const { wrapAsync } = require(global.appRoot + '/utils')
const { requestToRecommenderApi } = require('./utils')
const tour_collaborative_route = 'tour/collab/'
const tour_content_based_route = 'tour/similarity/'

router.get("/collaborative", wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const request_url = req.protocol + '://' + req.get('host') + req.originalUrl
        const similar_places = await requestToRecommenderApi(request_url, tour_collaborative_route, decoded.id)
        return res.status(200).json(similar_places)
    } catch (error) {
        return res.status(500).json(error)
    }
}))

router.get("/content-based", wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const request_url = req.protocol + '://' + req.get('host') + req.originalUrl
        const similar_places = await requestToRecommenderApi(request_url, tour_content_based_route, decoded.id)
        return res.status(200).json(similar_places)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router