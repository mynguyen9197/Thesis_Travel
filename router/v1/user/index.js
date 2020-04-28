const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require(global.appRoot + '/models/user')
const Place = require(global.appRoot + '/models/user_log/place')
const Tour = require(global.appRoot + '/models/user_log/tour')
const Restaurant = require(global.appRoot + '/models/user_log/restaurant')

const { wrapAsync, verifyToken } = require(global.appRoot + '/utils')
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
                const token = jwt.sign({ id: savedUser[0].id, role: savedUser[0].role }, 'RESTFULAPIs', { expiresIn: 60 * 60 * 24  })
                return res.status(200).json({token: token, role: savedUser[0].role})
            }
        } else {
            return res.status(401).send("User does not exist!")
        }
    }
    return res.status(400).json("User does not exist!")
}))

router.get('/history', verifyToken, wrapAsync(async(req, res, next) => {
    const decoded = jwt.verify(req.token, 'RESTFULAPIs')
    const recentPlaces = await Place.getRecentActivities(decoded.id)
    const recentTours = await Tour.getRecentActivities(decoded.id)
    const recentRestaurants = await Restaurant.getRecentActivities(decoded.id)
    return res.status(200).json({places: recentPlaces, tours: recentTours, restaurants: recentRestaurants})
}))

router.use('/place', verifyToken, require('./place'))
router.use('/tour', verifyToken, require('./tour'))
router.use('/restaurant', verifyToken, require('./restaurant'))

module.exports = router