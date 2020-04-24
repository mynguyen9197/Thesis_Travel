const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const tour = require(global.appRoot + '/models/tour')
const userTourLog = require(global.appRoot + '/models/user_log/tour')

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

router.post("/viewdetail", wrapAsync(async(req, res, next) => {
    try {
        const { tourid } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
        const savedLog = await userTourLog.insertUserLog(tourid, decoded.id, lastUpdate, 'VIEW_DETAIL')
        return res.status(200).json({id: savedLog.insertId})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post("/filter", wrapAsync(async(req, res, next) => {
    try {
        const { category } = req.body
        const event_type = 'FILTER: ' + category
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
        const savedLog = await userTourLog.insertUserLog(null, decoded.id, lastUpdate, event_type)
        return res.status(200).json({id: savedLog.insertId})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router