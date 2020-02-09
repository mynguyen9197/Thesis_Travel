const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const activity = require(global.appRoot + '/models/activity')
const userLog = require(global.appRoot + '/models/user-log')

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

router.post("/tracking", wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const existingLog = await activity.findUserLog(placeid, decoded.id)
        const lastUpdate = new Date().toISOString().slice(0, 19).replace('T', ' ')
        if(existingLog.length == 0){
            const savedLog = await activity.insertUserLog(placeid, decoded.id, lastUpdate)
            return res.status(200).json({id: savedLog.insertId, message: 'insert'})
        }
        await activity.updateUserLog(placeid, decoded.id, existingLog[0].times + 1, lastUpdate)
        return res.status(200).json({id: existingLog[0].id, message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router