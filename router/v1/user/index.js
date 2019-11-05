const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require(global.appRoot + '/models/user')
const activity = require(global.appRoot + '/models/activity')
const tour = require(global.appRoot + '/models/tour')

const { wrapAsync } = require(global.appRoot + '/utils')
router.post('/signup', wrapAsync(async(req, res, next) => {
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
    return res.status(400).json("User does not exist")
}))

router.post('/login', wrapAsync(async(req, res, next) => {
    const {user} = req.body;
    if(user && Object.keys(user).length){
        const savedUser = await User.findByUsername(user)
        if(savedUser.length){
            const match = await bcrypt.compare(user.password, savedUser[0].password)
            if(!match){
                return res.status(401).send("Wrong password")
            } else {
                const token = jwt.sign({ id: savedUser[0].id }, 'RESTFULAPIs', { expiresIn: 60 * 60 * 24  })
                return res.status(200).json({token: token})
            }
        } else {
            return res.status(401).send("Wrong username")
        }
    }
    return res.status(400).json("User does not exist")
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
    const { review, placeid } = req.body
    const savedReview = await activity.updateReview(review, placeid)
    res.status(200).json({id: savedReview.insertId})
}))

router.post("/tour/review", verifyToken, wrapAsync(async(req, res, next) => {
    const { review, tourid } = req.body
    const savedReview = await tour.updateReview(review, tourid)
    res.status(200).json({id: savedReview.insertId})
}))

module.exports = router