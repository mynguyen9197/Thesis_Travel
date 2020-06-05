const express = require('express')
const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync, getImageUrlAsObject, getAvatarUrlAsObject } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    const categories = await Activity.loadAllCategories()
    const activities = await Activity.loadTop20ByRating()
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json({categories, activities})
}))

router.get('/category/:category_id', wrapAsync(async(req, res, next) => {
    try {
        const { category_id } = req.params
        const activities = await Activity.loadActivitiesByCategoryId(category_id)
        if ( activities === null ) {
            return res.status(404).send({error: 'No Activity Was Found'})
        }
        const activity_ids = activities.map(x => x.id)
        if(activity_ids.length === 0){
            return res.status(400).send("No Activity Was Found")
        }
        const events = await Activity.loadPlacesByActivityId(activity_ids)
        return res.status(200).json({ activities, events })
    } catch (error) {
        return res.status(500).send(error.sqlMessage)
    }
}))

router.get('/filter', wrapAsync(async(req, res, next) => {
    const { search, activity_ids } = req.query
    let places = []
    if (!activity_ids && search) {
        places = await Activity.findPlaceByName(search)
    } else if(activity_ids && search) {
        places = await Activity.findPlaceByNameAndActivity(search, activity_ids)
    } else if (activity_ids && !search) {
        places = await Activity.loadPlacesByActivityId(activity_ids)
    } else {
        return res.status(500).send({error: 'Please add filter or search'})
    }
    if(places.length == 0){
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json({places})
}))

router.get('/place_detail/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const place_detail = await Activity.loadDetailById(placeid)
        const images = await Activity.loadImagesByPlaceId(placeid)
        images.map(image => getImageUrlAsObject(request_url, image))
        const comments = await Activity.loadCommentsByPlaceId(placeid)
        comments.map(comment => getAvatarUrlAsObject(request_url, comment))
        return res.status(200).json({place_detail, images, comments})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/most-viewed', wrapAsync(async(req, res, next) => {
    try{
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now() - tzoffset)
        let last30days = new Date(Date.now() - tzoffset)
        last30days.setDate(new Date(today.getDate() - 30))
        const mostViewPlaces = await Activity.loadMostViewPlaces(last30days.toISOString().split('T')[0], today.toISOString().split('T')[0])
        console.log({last30days: last30days.toISOString().split('T')[0], lastUpdate: today.toISOString().split('T')[0]})
        return res.status(200).json(mostViewPlaces)
    } catch {
        return res.status(500).json(error)
    }
}))

module.exports = router