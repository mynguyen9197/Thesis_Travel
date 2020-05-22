const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const restaurant = require(global.appRoot + '/models/restaurant')
const userRestaurantLog = require(global.appRoot + '/models/user_log/restaurant')

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

router.post("/viewdetail", wrapAsync(async(req, res, next) => {
    try {
        const { restid } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
        const savedLog = await userRestaurantLog.insertUserLog(restid, decoded.id, lastUpdate, 'VIEW_DETAIL')
        return res.status(200).json({id: savedLog.insertId})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post("/filter", wrapAsync(async(req, res, next) => {
    try {
        const { cuisine, features, meals, foodtypes } = req.body.categories
        if(cuisine.length == 0 && features.length == 0 && meals.length == 0 && foodtypes.length == 0){
            return res.status(404).json('no category was found')
        }
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
        let cat_as_list = []
        cuisine.map(category => {
            const cuisine = 'c_' + category
            cat_as_list.push(cuisine)
        })
        features.map(category => {
            const feature = 'f_' + category
            cat_as_list.push(feature)
        })
        meals.map(category => {
            const meal = 'm_' + category
            cat_as_list.push(meal)
        })
        foodtypes.map(foodtype => {
            const event_type = 't_' + foodtype
            cat_as_list.push(event_type)
        })
        const cat_as_tring = cat_as_list.join(' ')
        console.log(cat_as_tring)
        const event_type = 'FILTER: ' + cat_as_tring
        const savedLog = await userRestaurantLog.insertUserLog(null, decoded.id, lastUpdate, event_type)
        return res.status(200).json({id: savedLog.id})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router