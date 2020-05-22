const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const activity = require(global.appRoot + '/models/activity')
const userPlaceLog = require(global.appRoot + '/models/user_log/place')

const { wrapAsync } = require(global.appRoot + '/utils')
const { calculateRating } = require('./util')

router.post("/comment", wrapAsync(async(req, res, next) => {
    const { comment, placeid } = req.body
    const decoded = jwt.verify(req.token, 'RESTFULAPIs')
    const savedComment = await activity.insertComment(comment, placeid, decoded.id)
    res.status(200).json({id: savedComment.insertId})
}))

router.post("/review", wrapAsync(async(req, res, next) => {
    try {
        const { placeid, date, rating } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const review = await activity.loadReviewByPlaceId(placeid)
        const alreadyReviewed = await activity.checkIfUserAlreadyReview(placeid, decoded.id)
        const info = {
            user_id: decoded.id,
            date: date.toString(),
            rating: rating + 1,
            place_id: placeid
        }
        let savedId = decoded.id
        let action = ''
        let ratingList = []
        if(alreadyReviewed.length){
            await activity.updateRating(info)
            action = 'update'
            ratingList = calculateRating(review, 4-rating, 5-alreadyReviewed[0].rating)
        } else {
            const saveRating = await activity.insertRating(info)
            action = 'insert'
            savedId = saveRating.insertId
            ratingList = calculateRating(review, 4-rating, 0)
        }
        await activity.updateReview(ratingList.join(';'), placeid)
        return res.status(200).json({savedId, placeid, message: action})
    } catch (error) {
        console.log(error)
    }
}))

router.post("/viewdetail", wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
        const savedLog = await userPlaceLog.insertUserLog(placeid, decoded.id, lastUpdate, 'VIEW_DETAIL')
        return res.status(200).json({id: savedLog.insertId})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post("/filter", wrapAsync(async(req, res, next) => {
    try {
        const { categories } = req.body
        if(categories.length == 0){
            return res.status(404).json('no category was found')
        }
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        let cat_as_list = []
        categories.forEach(category => {
            cat_as_list.push(category)
        })
        const cat_as_tring = cat_as_list.join(' ')
        const event_type = 'FILTER: ' + cat_as_tring
        const savedLog = await userPlaceLog.insertUserLog(null, decoded.id, lastUpdate, event_type)
        console.log('inserted: ' + savedLog.insertId)
        return res.status(200).json(cat_as_tring)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router