const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const { wrapAsync, verifyToken, getImageUrlAsLink } = require(global.appRoot + '/utils')
const { requestToRecommenderApi } = require('./utils')
const restaurant_collaborative_route = 'restaurant/collab/'
const restaurant_content_based_route = 'restaurant/similarity/'
const restaurant_similar_detail_route = 'restaurant/detail/'

router.get("/collaborative", verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, restaurant_collaborative_route, decoded.id)
        similar_places.map(rest => {
            rest.thumbnail = getImageUrlAsLink(request_url, rest.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get("/detail/:restaurant_id", wrapAsync(async(req, res, next) => {
    try {
        const { restaurant_id } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, restaurant_similar_detail_route, restaurant_id)
        similar_places.map(rest => {
            rest.thumbnail = getImageUrlAsLink(request_url, rest.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        
    }
}))

router.get("/content-based", verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const request_url = req.protocol + '://' + req.get('host')
        const similar_places = await requestToRecommenderApi(request_url + req.originalUrl, restaurant_content_based_route, decoded.id)
        similar_places.map(rest => {
            rest.thumbnail = getImageUrlAsLink(request_url, rest.thumbnail)
        })
        return res.status(200).json(similar_places)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router