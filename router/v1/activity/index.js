const express = require('express')
const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    const activities = await Activity.find({thumbnail: { $ne: null }}, {comment: 0, review: 0, address: 0, images: 0}).sort({ rating: -1 })
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json(activities)
}))

router.get('/type=:type', wrapAsync(async(req, res, next) => {
    const { type } = req.params
    const activities = await Activity.find({type: type,thumbnail: { $ne: null }},{comment: 0, review: 0, address: 0, images: 0}).sort({ rating: -1 })
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json(activities)
}))

router.get('/filter', wrapAsync(async(req, res, next) => {
    const types = req.query.type
    const activities = await Activity.find({type: {$in: types},thumbnail: { $ne: null }},{comment: 0, review: 0, address: 0, images: 0}).sort({ rating: -1 })
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    const result = []
    const map = new Map()
    for(const item of activities){
        if(!map.has(item.name)){
            map.set(item.name, true)
            result.push(item)
        }
    }
    return res.status(200).json(result)
}))

router.get('/search=:name/filter', wrapAsync(async(req, res, next) => {
    const types = req.query.type
    const { name } = req.params
    console.log({name, types})
    const activities = await Activity.find({type: {$in: types}, name: { $regex: name, $options: 'i' },thumbnail: { $ne: null }},{comment: 0, review: 0, address: 0, images: 0}).sort({ rating: -1 })
    if ( activities === null ) {
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    const result = []
    const map = new Map()
    for(const item of activities){
        if(!map.has(item.name)){
            map.set(item.name, true)
            result.push(item)
        }
    }
    return res.status(200).json(result)
}))

router.get('/detail/:placeid', wrapAsync(async(req, res, next) => {
    const { placeid } = req.params
    const place_detail = await Activity.loadDetailById(placeid)
    const images = await Activity.loadImagesByPlaceId(placeid)
    const comments = await Activity.loadCommentsByPlaceId(placeid)
    const contact = await Activity.loadContactByPlaceId(placeid)
    const review = await Activity.loadReviewByPlaceId(placeid)
    const kind = await Activity.loadKindOfActivityOfPlace(placeid)
    return res.status(200).send({place_detail: place_detail, images: images, comments: comments, contact: contact, review:review, kind: kind})
}))

module.exports = router