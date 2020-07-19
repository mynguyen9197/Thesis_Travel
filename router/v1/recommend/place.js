const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const { wrapAsync, verifyToken, getImageUrlAsLink } = require(global.appRoot + '/utils')
const { requestToRecommenderApi } = require('./utils')
const place_collaborative_route = 'place/collab/'
const place_content_based_route = 'place/similarity/'
const place_similar_detail_route = 'place/detail/'

router.get("/collaborative", verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, place_collaborative_route, decoded.id)
        similar_places.map(place => {
            place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get("/detail/:place_id", wrapAsync(async(req, res, next) => {
    try {
        const { place_id } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, place_similar_detail_route, place_id)
        similar_places.map(place => {
            place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        
    }
}))

router.get("/content-based", verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, place_content_based_route, decoded.id)
        similar_places.map(place => {
            place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router