const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const restaurant = require(global.appRoot + '/models/restaurant')
const userLog = require(global.appRoot + '/models/user-log')

const { wrapAsync } = require(global.appRoot + '/utils')
const { calculateRating } = require('./util')

router.post("/comment", wrapAsync(async(req, res, next) => {
    const { comment, restid } = req.body
    const decoded = jwt.verify(req.token, 'RESTFULAPIs')
    const savedComment = await restaurant.insertComment(comment, restid, decoded.id)
    res.status(200).json({id: savedComment.insertId})
}))

router.post("/review", wrapAsync(async(req, res, next) => {
    try {
        const { restid, date, rating } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const review = await restaurant.loadReviewByResId(restid)
        const alreadyReviewed = await restaurant.checkIfUserAlreadyReview(restid, decoded.id)
        const info = {
            user_id: decoded.id,
            date: date.toString(),
            rating: rating + 1,
            res_id: restid,
        }
        let savedId = decoded.id
        let action = ''
        let ratingList = []
        if(alreadyReviewed.length){
            saveRating = await restaurant.updateRating(info)
            action = 'update'
            ratingList = calculateRating(review, 4-rating, 5-alreadyReviewed[0].rating)
        } else {
            const saveRating = await restaurant.insertRating(info)
            action = 'insert'
            savedId = saveRating.insertId
            ratingList = calculateRating(review, 4-rating, 0)
        }
        await restaurant.updateReview(ratingList.join(';'), restid)
        return res.status(200).json({savedId, restid,  message: action})
    } catch (error) {
        console.log(error)
    }
}))

router.post("/tracking", wrapAsync(async(req, res, next) => {
    try {
        const { restid } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const existingLog = await restaurant.findUserLog(restid, decoded.id)
        const lastUpdate = new Date().toISOString().slice(0, 19).replace('T', ' ')
        if(existingLog.length == 0){
            const savedLog = await restaurant.insertUserLog(restid, decoded.id, lastUpdate)
            return res.status(200).json({id: savedLog.insertId, message: 'insert'})
        }
        await restaurant.updateUserLog(restid, decoded.id, existingLog[0].times + 1, lastUpdate)
        return res.status(200).json({id: existingLog[0].id, message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router