const express = require('express')
const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
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
    try {
        const { category_id } = req.params
        const activities = await Activity.loadActivitiesByCategoryId(category_id)
        if ( activities === null ) {
            return res.status(404).send({error: 'No Activity Was Found'})
        }
        const activity_ids = activities.map(x => x.id)
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
        const place_detail = await Activity.loadDetailById(placeid)
        const images = await Activity.loadImagesByPlaceId(placeid)
        const comments = await Activity.loadCommentsByPlaceId(placeid)
        const contact = await Activity.loadContactByPlaceId(placeid)
        return res.status(200).json({place_detail, images, comments, contact})
    } catch (error) {
        return res.status(500).send(error)
    }
}))

module.exports = router