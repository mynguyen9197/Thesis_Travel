const express = require('express')
const router = express.Router()

const Tour = require(global.appRoot + '/models/tour')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const activities = await Tour.loadAllTourActivities()
        if ( activities === null ) {
            return res.status(404).send({error: 'No Activity Was Found'})
        }
        const activity_ids = activities.map(x => x.id)
        const tours = await Tour.loadTourByActivityId(activity_ids)
        return res.status(200).json({ activities, tours: tours })
    } catch (error) {
        return res.status(500).send(error.sqlMessage)
    }
}))

router.get('/filter', wrapAsync(async(req, res, next) => {
    const { activity_ids } = req.query
    const tours = await Tour.loadTourByActivityId(activity_ids)
    
    return res.status(200).json({ tours: tours, activity_ids })
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