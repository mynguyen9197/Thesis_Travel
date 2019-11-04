const express = require('express')
const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
const Tour = require(global.appRoot + '/models/tour')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    const categories = await Activity.loadAllCategories()
    const activities = await Activity.loadTop20ByRating()
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json({categories, activities})
}))

router.get('/category/:category_id', wrapAsync(async(req, res, next) => {
    const { category_id } = req.params
    const activities = await Activity.loadActivitiesByCategoryId(category_id)
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    const activity_ids = activities.map(x => x.id)
    let events = {}
    if(category_id != 1){
        events = await Activity.loadPlacesByActivityId(activity_ids)
    } else {
        events = await Tour.loadTourByActivityId(activity_ids.join(','))
    }
    return res.status(200).json({ activities, events })
}))

router.get('/filter', wrapAsync(async(req, res, next) => {
    const { category_id, activity_ids } = req.query
    let events = {}
    if(category_id != 1){
        events = await Activity.loadPlacesByActivityId(activity_ids)
    } else {
        events = await Tour.loadTourByActivityId(activity_ids)
    }
    return res.status(200).json({ events, activity_ids })
}))

router.get('/place/filter', wrapAsync(async(req, res, next) => {
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
    const { placeid } = req.params
    const place_detail = await Activity.loadDetailById(placeid)
    const images = await Activity.loadImagesByPlaceId(placeid)
    const comments = await Activity.loadCommentsByPlaceId(placeid)
    const contact = await Activity.loadContactByPlaceId(placeid)
    const kind = await Activity.loadKindOfActivityOfPlace(placeid)
    return res.status(200).send({place_detail: place_detail, images: images, comments: comments, contact: contact, kind: kind})
}))

router.get('/tour_detail/:tour_id', wrapAsync(async(req, res, next) => {
    const { tour_id } = req.params
    const tour_detail = await Tour.findTourById(tour_id)
    const images = await Tour.loadImagesByTourId(tour_id)
    const comments = await Tour.loadCommentsByTourId(tour_id)
    const tourism = await Tour.findTourismById(tour_detail[0].tourism_id)
    return res.status(200).send({tour_detail, images, comments, tourism})
}))

module.exports = router