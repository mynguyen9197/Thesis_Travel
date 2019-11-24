const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require(global.appRoot + '/models/user')
const activity = require(global.appRoot + '/models/activity')
const tour = require(global.appRoot + '/models/tour')
const userLog = require(global.appRoot + '/models/user-log')

const { wrapAsync } = require(global.appRoot + '/utils')
router.post('/signup', wrapAsync(async(req, res, next) => {
    try {
        const {user} = req.body;
        if(user && Object.keys(user).length){
            const new_user = {
                name: user.name,
                username: user.username,
                password: bcrypt.hashSync(user.password, 10)
            }
            const savedUser = await User.insertUser(new_user)
            return res.status(200).json({id: savedUser.insertId})
        }
    } catch (error) {
        return res.status(500).json("This username has already been taken. Please try with another one!")
    }
}))

router.post('/login', wrapAsync(async(req, res, next) => {
    const {user} = req.body;
    if(user && Object.keys(user).length){
        const savedUser = await User.findByUsername(user)
        if(savedUser.length){
            const match = await bcrypt.compare(user.password, savedUser[0].password)
            if(!match){
                return res.status(401).send("Wrong password!")
            } else {
                const token = jwt.sign({ id: savedUser[0].id }, 'RESTFULAPIs', { expiresIn: 60 * 60 * 24  })
                return res.status(200).json({token: token})
            }
        } else {
            return res.status(401).send("User does not exist!")
        }
    }
    return res.status(400).json("User does not exist!")
}))

const verifyToken = ((req, res, next) => {
    const bearerHeader = req.headers['authorization']
    if(bearerHeader){
        const token = bearerHeader.split(' ')[1]
        if(token){
            req.token = token
            const decoded = jwt.verify(token, 'RESTFULAPIs')
            if(decoded){
                next()
                return
            }
        }
    } 
    return res.status(403).send("Do not have permission")
}) 

router.post("/place/comment", verifyToken, wrapAsync(async(req, res, next) => {
    const { comment, placeid } = req.body
    const decoded = jwt.verify(req.token, 'RESTFULAPIs')
    const savedComment = await activity.insertComment(comment, placeid, decoded.id)
    res.status(200).json({id: savedComment.insertId})
}))

router.post("/tour/comment", verifyToken, wrapAsync(async(req, res, next) => {
    const { comment, tourid } = req.body
    const decoded = jwt.verify(req.token, 'RESTFULAPIs')
    const savedComment = await tour.insertComment(comment, tourid, decoded.id)
    res.status(200).json({id: savedComment.insertId})
}))

router.post("/place/review", verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const { placeid, date, rating } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const review = await activity.loadReviewByPlaceId(placeid)
        const ratingList = calculateRating(review, rating)
        const savedReview = await activity.updateReview(ratingList.join(';'), placeid)
        const info = {
            user_id: decoded.id,
            date: date.toString(),
            rating: rating,
            rate_for: placeid,
            kind: 1
        }
        const saveRating = await userLog.insertRating(info)
        return res.status(200).json({id: saveRating.insertId, placeid: savedReview.insertId, message: 'insert successfully'})
    } catch (error) {
        console.log(error)
    }
}))

router.post("/tour/review", verifyToken, wrapAsync(async(req, res, next) => {
    try {
        const { tourid, date, rating } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const review = await tour.loadReviewByTourId(tourid)
        const ratingList = calculateRating(review, rating)
        const savedReview = await tour.updateReview(ratingList.join(';'), tourid)
        const info = {
            user_id: decoded.id,
            date: date.toString(),
            rating: rating,
            rate_for: tourid,
            kind: 2
        }
        const saveRating = await userLog.insertRating(info)
        return res.status(200).json({logid: saveRating.insertId, tourid: savedReview.insertId, message: 'insert successfully'})
    } catch (error) {
        console.log(error)
    }
    res.status(200).json({id: savedReview.insertId})
}))

function calculateRating(review, rating){
    let ratingList = Array(0, 0, 0, 0, 0)
    if(review[0].review_detail){
        ratingList = review[0].review_detail.split(";")
        ratingList[rating] = parseInt(ratingList[rating].replace(',', '')) + 1
        ratingList[rating] = ratingList[rating].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    } else {
        ratingList[rating] = 1
    }
    return ratingList
}

module.exports = router