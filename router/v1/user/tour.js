const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const tour = require(global.appRoot + '/models/tour')
const userLog = require(global.appRoot + '/models/user-log')

const { wrapAsync } = require(global.appRoot + '/utils')
const { calculateRating } = require('./util')

router.post("/comment", wrapAsync(async(req, res, next) => {
    const { comment, tourid } = req.body
    const decoded = jwt.verify(req.token, 'RESTFULAPIs')
    const savedComment = await tour.insertComment(comment, tourid, decoded.id)
    res.status(200).json({id: savedComment.insertId})
}))

router.post("/review", wrapAsync(async(req, res, next) => {
    try {
        const { tourid, date, rating } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const review = await tour.loadReviewByTourId(tourid)
        const alreadyReviewed = await tour.checkIfUserAlreadyReview(tourid, decoded.id)
        const info = {
            user_id: decoded.id,
            date: date.toString(),
            rating: rating + 1,
            tour_id: tourid,
        }
        let savedId = decoded.id
        let action = ''
        let ratingList = []
        if(alreadyReviewed.length){
            await tour.updateRating(info)
            action = 'update'
            ratingList = calculateRating(review, 4-rating, 5-alreadyReviewed[0].rating)
        } else {
            const saveRating = await tour.insertRating(info)
            action = 'insert'
            savedId = saveRating.insertId
            ratingList = calculateRating(review, 4-rating, 0)
        }
        await tour.updateReview(ratingList.join(';'), tourid)
        return res.status(200).json({savedId, tourid, message: action})
    } catch (error) {
        console.log(error)
    }
}))

router.post("/tracking", wrapAsync(async(req, res, next) => {
    try {
        const { tourid } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const existingLog = await tour.findUserLog(tourid, decoded.id)
        const lastUpdate = new Date().toISOString().slice(0, 19).replace('T', ' ')
        if(existingLog.length == 0){
            const savedLog = await tour.insertUserLog(tourid, decoded.id, lastUpdate)
            return res.status(200).json({id: savedLog.insertId, message: 'insert'})
        }
        await tour.updateUserLog(tourid, decoded.id, existingLog[0].times + 1, lastUpdate)
        return res.status(200).json({id: existingLog[0].id, message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router