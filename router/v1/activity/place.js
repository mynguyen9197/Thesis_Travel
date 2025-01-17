const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync, getImageUrlAsLink } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    const request_url = req.protocol + '://' + req.get('host')
    const categories = await Activity.loadAllCategories()
    const activities = await Activity.loadAllActivities()
    const places = await Activity.loadTop20ByRating()
    if ( places === null ) {
        return res.status(404).send({error: 'No Place Was Found'})
    }
    places.map(place => {
        place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
    })
    return res.status(200).json({categories, activities, places})
}))

router.get('/category/:category_id', wrapAsync(async(req, res, next) => {
    try {
        const { category_id } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const activities = await Activity.loadActivitiesByCategoryId(category_id)
        if ( activities === null ) {
            return res.status(404).send({error: 'No Place Was Found'})
        }
        const activity_ids = activities.map(x => x.id)
        if(activity_ids.length === 0){
            return res.status(400).send("No Place Was Found")
        }
        const events = await Activity.loadPlacesByActivityId(activity_ids)
        events.map(place => {
            place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
        })
        return res.status(200).json({ activities, events })
    } catch (error) {
        console.log(error)
        return res.status(500).send(error.sqlMessage)
    }
}))

router.get('/filter', wrapAsync(async(req, res, next) => {
    const { search, activity_ids } = req.query
    let places = []
    const request_url = req.protocol + '://' + req.get('host')
    if (!activity_ids && search) {
        places = await Activity.findPlaceByName(search)
    } else if(activity_ids && search) {
        places = await Activity.findPlaceByNameAndActivity(search, activity_ids)
    } else if (activity_ids && !search) {
        places = await Activity.loadPlacesByActivityId(activity_ids)
    } else {
        return res.status(500).send({error: 'No Place Was Found'})
    }
    if(places.length == 0){
        return res.status(404).send({error: 'No Place Was Found'})
    }
    places.map(place => {
        place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
    })
    return res.status(200).json({places})
}))

router.get('/place_detail/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const place_detail = await Activity.loadDetailById(placeid)
        if(!place_detail.length){
            return res.status(404).json('Place is not found')
        }
        place_detail[0].thumbnail = getImageUrlAsLink(request_url, place_detail[0].thumbnail)
        const images = await Activity.loadImagesByPlaceId(placeid)
        images.map(image => {
            image.address = getImageUrlAsLink(request_url, image.address)
        })
        const comments = await Activity.loadCommentsByPlaceId(placeid)
        comments.map(comment => {
            comment.avatar = getImageUrlAsLink(request_url, comment.avatar)
        })
        const bearerHeader = req.headers['authorization']
        if(bearerHeader){
            const token = bearerHeader.split(' ')[1]
            const decoded = jwt.verify(token, 'RESTFULAPIs')
            if(decoded){
                const rating = await Activity.checkIfUserAlreadyReview(placeid, decoded.id)
                return res.status(200).json({place_detail, images, comments, rating: rating[0]})
            }
        }
        return res.status(200).json({place_detail, images, comments})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: error.sqlMessage})
    }
}))

router.get('/most-viewed', wrapAsync(async(req, res, next) => {
    try{
        const { search, activity_ids } = req.query
        const request_url = req.protocol + '://' + req.get('host')
        let places = []
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now() - tzoffset)
        let last30days = new Date(Date.now() - tzoffset)
        last30days.setDate(new Date(today.getDate() - 30))
        const from = last30days.toISOString().split('T')[0]
        const to = today.toISOString().split('T')[0]
        if (!activity_ids && search) {
            places = await Activity.findMostViewedPlaceByName(search, from, to)
        } else if(activity_ids && search) {
            places = await Activity.findMostViewedPlaceByNameAndActivity(search, activity_ids, from, to)
        } else if (activity_ids && !search) {
            places = await Activity.loadMostViewedPlacesByActivityId(activity_ids, from, to)
        } else {
            return res.status(500).send({error: 'No Place Was Found'})
        }
        if(places.length == 0){
            return res.status(404).send({error: 'No Place Was Found'})
        }
        places.map(place => {
            place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
        })
        return res.status(200).json({places})
    } catch(error) {
        console.log(error)
        return res.status(500).json({error: error.sqlMessage})
    }
}))

router.get('/highest-rating', wrapAsync(async(req, res, next) => {
    try {
        const request_url = req.protocol + '://' + req.get('host')
        const activities = await Activity.loadTopRating()
        activities.map(place => {
            place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
        })
        return res.status(200).json(activities)
    } catch(error) {
        console.log(error)
        return res.status(500).json({error: error.sqlMessage})
    }
}))

module.exports = router