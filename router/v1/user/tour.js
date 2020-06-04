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
        if(alreadyReviewed.length){
            await tour.updateRating(info)
            action = 'update'
            let {ratingListAsString, averageRating} = calculateRating(review, 4-rating, 5-alreadyReviewed[0].rating)
            console.log({ratingListAsString, averageRating})
            await tour.updateReview(ratingListAsString, averageRating, tourid)
        } else {
            const saveRating = await tour.insertRating(info)
            action = 'insert'
            savedId = saveRating.insertId
            let {ratingListAsString, averageRating} = calculateRating(review, 4-rating, -1)
            console.log({ratingListAsString, averageRating})
            await tour.updateReview(ratingListAsString, averageRating, tourid)
        }
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
        const { categories } = req.body
        if(categories.length == 0){
            return res.status(404).json('no category was found')
        }
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
        let cat_as_list = []
        categories.map(category => {
            cat_as_list.push(category)
        })
        const cat_as_tring = cat_as_list.join(' ')
        const event_type = 'FILTER: ' + cat_as_tring
        const savedLog = await userTourLog.insertUserLog(null, decoded.id, lastUpdate, event_type)
        console.log('inserted: ' + savedLog.insertId)
        return res.status(200).json({})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router