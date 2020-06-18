const express = require('express')
const faker = require('faker')
const bcrypt = require('bcrypt')
const User = require(global.appRoot + '/models/user')
const activity = require(global.appRoot + '/models/activity')
const Tour = require(global.appRoot + '/models/tour')
const Restaurant = require(global.appRoot + '/models/restaurant')
const { wrapAsync } = require(global.appRoot + '/utils')
const { calculateRating } = require('./user/util')
const userPlaceLog = require(global.appRoot + '/models/user_log/place')
const userTourLog = require(global.appRoot + '/models/user_log/tour')
const userRestaurantLog = require(global.appRoot + '/models/user_log/restaurant')

const router = express.Router()
router.post('/user', wrapAsync(async(req, res, next) => {
    try {
        for(let i=0; i<200;i++){
            const new_user = {
                name: faker.name.findName(),
                username: faker.internet.userName(),
                password: bcrypt.hashSync(faker.internet.password(), 10)
            }
            console.log(new_user)
            const savedUser = await User.insertUser(new_user)
        }
        return res.status(200).json('okkk')
    } catch(error) {
        console.log(error)
    }
}))

router.post('/avatar', wrapAsync(async(req, res, next) => {
    try {
        const user_ids = await User.findUsersMissingAvatar()
        for (const user of user_ids){
            url_img = faker.image.avatar(),
            await User.updateAvatar(url_img, user.id)
        }
        return res.status(200).json('okkk')
    } catch(error) {
        console.log(error)
    }
}))

router.post('/rating/place', wrapAsync(async(req, res, next) => {
    try{
        for(let i=0;i<5000;i++){
            const tzoffset = new Date().getTimezoneOffset() * 60000;
            const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
            const info = {
                user_id: faker.random.number({min:1, max:1092}),
                date: lastUpdate,
                rating: faker.random.number({min:1, max:5}),
                place_id: faker.random.number({min:117, max:452})
            }
            console.log(info)
            const place = await activity.loadDetailById(info.place_id)
            if(place.length ===0){
                continue
            }
            const review = await activity.loadReviewByPlaceId(info.place_id)
            const alreadyReviewed = await activity.checkIfUserAlreadyReview(info.place_id, info.user_id)
            let ratingList = []
            if(alreadyReviewed.length===0){
                await activity.insertRating(info)
                ratingList = calculateRating(review, 5-info.rating, 0)
                await activity.updateReview(ratingList.join(';'), info.place_id)
            } else {
                console.log('duplicated')
            }
        }
    } catch(error){
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/rating/tour', wrapAsync(async(req, res, next) => {
    try{
        for(let i=0;i<5000;i++){
            const tzoffset = new Date().getTimezoneOffset() * 60000;
            const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
            const info = {
                user_id: faker.random.number({min:1, max:1092}),
                date: lastUpdate,
                rating: faker.random.number({min:1, max:5}),
                tour_id: faker.random.number({min:1, max:233})
            }
            console.log(info)
            const tour = await Tour.findTourById(info.tour_id)
            if(tour.length ===0){
                continue
            }
            const review = await Tour.loadReviewByTourId(info.tour_id)
            const alreadyReviewed = await Tour.checkIfUserAlreadyReview(info.tour_id, info.user_id)
            let ratingList = []
            if(alreadyReviewed.length===0){
                await Tour.insertRating(info)
                ratingList = calculateRating(review, 5-info.rating, 0)
                await Tour.updateReview(ratingList.join(';'), info.tour_id)
            } else {
                console.log('duplicated')
            }
        }
    } catch(error){
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/rating/restaurant', wrapAsync(async(req, res, next) => {
    try{
        for(let i=0;i<5000;i++){
            const tzoffset = new Date().getTimezoneOffset() * 60000;
            const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
            const info = {
                user_id: faker.random.number({min:1, max:1092}),
                date: lastUpdate,
                rating: faker.random.number({min:1, max:5}),
                res_id: faker.random.number({min:1, max:532})
            }
            console.log(info)
            const place = await Restaurant.findRestaurantById(info.res_id)
            if(place.length ===0){
                continue
            }
            const review = await Restaurant.loadReviewByResId(info.res_id)
            const alreadyReviewed = await Restaurant.checkIfUserAlreadyReview(info.res_id, info.user_id)
            let ratingList = []
            if(alreadyReviewed.length===0){
                await Restaurant.insertRating(info)
                ratingList = calculateRating(review, 5-info.rating, 0)
                await Restaurant.updateReview(ratingList.join(';'), info.res_id)
            } else {
                console.log('duplicated')
            }
        }
    } catch(error){
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/log/place', wrapAsync(async(req, res, next) => {
    try {
        for (let i=0;i<5000;i++){
            const tzoffset = new Date().getTimezoneOffset() * 60000;
            const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
            const user_id = faker.random.number({min:1, max:1092})
            const place_id = faker.random.number({min:117, max:452})
            // console.log({place_id, user_id, lastUpdate, event: 'VIEW_DETAIL'})
            const savedPlace = await activity.findPlacesById(place_id)
            const savedUser = await User.findById(user_id)
            if(!savedPlace.length || !savedUser.length){
                continue
            }
            await userPlaceLog.insertUserLog(place_id, user_id, lastUpdate, 'VIEW_DETAIL')
        }
        return res.status(200).json('okkk')
    } catch(error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/log/tour', wrapAsync(async(req, res, next) => {
    try {
        for (let i=0;i<5000;i++){
            const tzoffset = new Date().getTimezoneOffset() * 60000;
            const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
            const user_id = faker.random.number({min:1, max:1092})
            const tour_id = faker.random.number({min:1, max:233})
            const savedTour = await Tour.findTourById(tour_id)
            const savedUser = await User.findById(user_id)
            if(!savedTour.length || !savedUser.length){
                continue
            }
            await userTourLog.insertUserLog(tour_id, user_id, lastUpdate, 'VIEW_DETAIL')
        }
        return res.status(200).json('okkk')
    } catch(error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/log/restaurant', wrapAsync(async(req, res, next) => {
    try {
        for (let i=0;i<5000;i++){
            const tzoffset = new Date().getTimezoneOffset() * 60000;
            const lastUpdate = new Date(Date.now() - tzoffset).toISOString().slice(0, 19).replace('T', ' ')
            const user_id = faker.random.number({min:1, max:1092})
            const restaurant_id = faker.random.number({min:1, max:532})
            const savedRestaurant = await Restaurant.findRestaurantById(restaurant_id)
            const savedUser = await User.findById(user_id)
            if(!savedRestaurant.length || !savedUser.length){
                continue
            }
            await userRestaurantLog.insertUserLog(restaurant_id, user_id, lastUpdate, 'VIEW_DETAIL')
        }
        return res.status(200).json('okkk')
    } catch(error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

module.exports = router