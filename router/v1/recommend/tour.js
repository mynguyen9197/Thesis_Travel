const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const { wrapAsync, verifyToken, getImageUrlAsLink } = require(global.appRoot + '/utils')
const { requestToRecommenderApi } = require('./utils')
const tour_collaborative_route = 'tour/collab/'
const tour_content_based_route = 'tour/similarity/'
const tour_similar_detail_route = 'tour/detail/'

router.get("/collaborative", verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, tour_collaborative_route, decoded.id)
        similar_places.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        return res.status(500).json(error)
    }
}))

router.get("/detail/:tour_id", wrapAsync(async(req, res, next) => {
    try {
        const { tour_id } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, tour_similar_detail_route, tour_id)
        similar_places.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        
    }
}))

router.get("/content-based", verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, tour_content_based_route, decoded.id)
        similar_places.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router