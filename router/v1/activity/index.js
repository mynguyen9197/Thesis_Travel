const express = require('express')
const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    const activities = await Activity.find({}, {comment: 0, review: 0, address: 0, images: 0, ranking: 0})
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json(activities)
}))

router.get('/type=:type', wrapAsync(async(req, res, next) => {
    const { type } = req.params
    const activities = await Activity.find({type: type},{comment: 0, review: 0, address: 0, images: 0, ranking: 0})
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json(activities)
}))

router.get('/:id', wrapAsync(async(req, res, next) => {
    const { id } = req.params
    const activityDetail = await Activity.findById(id)
    if ( activityDetail === null ) {
        return res.status(404).send({error: 'Activity Was Not Found'})
    }
    return res.status(200).json(activityDetail)
}))

module.exports = router