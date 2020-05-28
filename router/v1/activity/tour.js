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

router.get('/most-viewed', wrapAsync(async(req, res, next) => {
    try{
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now() - tzoffset)
        let last30days = new Date(Date.now() - tzoffset)
        last30days.setDate(new Date(today.getDate() - 30))
        const mostViewTours = await Tour.loadMostViewTours(last30days.toISOString().split('T')[0], today.toISOString().split('T')[0])
        console.log({last30days: last30days.toISOString().split('T')[0], lastUpdate: today.toISOString().split('T')[0]})
        return res.status(200).json(mostViewTours)
    } catch {
        return res.status(500).json(error)
    }
}))

module.exports = router