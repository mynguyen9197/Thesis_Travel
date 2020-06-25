const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const { wrapAsync, getImageUrlAsLink } = require(global.appRoot + '/utils')
const Restaurant = require(global.appRoot + '/models/restaurant')

router.get('/', wrapAsync(async(req, res, next) => {
    const cuisines = await Restaurant.loadAllCuisines()
    const features = await Restaurant.loadAllFeatures()
    const foodTypes = await Restaurant.loadAllFoodType()
    const meals = await Restaurant.loadAllFoodMeal()

    const listRestaurants = await Restaurant.loadTop20ByRating()

    res.status(200).send({cuisines, features, foodTypes, meals, listRestaurants})
}))

router.get('/lookup', wrapAsync(async(req, res, next) => {
    try {
        const { search, cuisines, features, foodtypes, meals } = req.query
        let sql_search = search ? search: ''
        let restaurants = []
        if(cuisines || features || foodtypes || meals){
            if (cuisines) {
                const byCuisines = await Restaurant.findResByNameCuisines(sql_search, cuisines)
                restaurants = disListRestaurant(restaurants, byCuisines)
            }
            if(features) {
                const byFeatures = await Restaurant.findResByNameFeatures(sql_search, features)
                restaurants = disListRestaurant(restaurants, byFeatures)
            }
            if (foodtypes) {
                const byFoodTypes = await Restaurant.findResByNameFoodTypes(sql_search, foodtypes)
                restaurants = disListRestaurant(restaurants, byFoodTypes)
            } 
            if(meals) {
                const byMeals = await Restaurant.findResByNameMeals(sql_search, meals)
                restaurants = disListRestaurant(restaurants, byMeals)
            }
        }else if(sql_search) {
            const byNameOnly = await Restaurant.findResByName(sql_search)
            restaurants = disListRestaurant(restaurants, byNameOnly)
        } else {
            return res.status(500).send({error: 'Please add filter or search'})
        }
        if(restaurants.length == 0){
            return res.status(404).send({error: 'No Restaurant Was Found'})
        }
        return res.status(200).json({restaurants})
    } catch (error) {
        console.log(error)
    }
}))

router.get('/restaurant_detail/:id', wrapAsync(async(req, res, next) => {
    try {
        const { id } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const restaurant = await Restaurant.findRestaurantById(id)
        if(!restaurant.length){
            return res.status(404).json('Restaurant is not found')
        }
        restaurant[0].thumbnail = getImageUrlAsLink(request_url, restaurant[0].thumbnail)
        const images = await Restaurant.loadImagesByRestaurantId(id)
        images.map(image => {
            image.address = getImageUrlAsLink(request_url, image.address)
        })
        const comments = await Restaurant.loadCommentsByRestaurantId(id)
        comments.map(comment => {
            comment.avatar = getImageUrlAsLink(request_url, comment.avatar)
        })
        const bearerHeader = req.headers['authorization']
        if(bearerHeader){
            const token = bearerHeader.split(' ')[1]
            const decoded = jwt.verify(token, 'RESTFULAPIs')
            if(decoded){
                const rating = await Restaurant.checkIfUserAlreadyReview(id, decoded.id)
                return res.status(200).json({restaurant, images, comments, rating: rating[0]})
            }
        }
        return res.status(200).json({restaurant, images, comments})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/most-viewed', wrapAsync(async(req, res, next) => {
    try{
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now() - tzoffset)
        let last30days = new Date(Date.now() - tzoffset)
        last30days.setDate(new Date(today.getDate() - 30))
        const from = last30days.toISOString().split('T')[0]
        const to = today.toISOString().split('T')[0]
        const { search, cuisines, features, foodtypes, meals } = req.query
        let sql_search = search ? search : ''
        let restaurants = []
        if(cuisines || features || foodtypes || meals){
            if (cuisines) {
                const byCuisines = await Restaurant.findMostViewedResByNameCuisines(sql_search, cuisines, from, to)
                restaurants = disListRestaurant(restaurants, byCuisines)
            }
            if(features) {
                const byFeatures = await Restaurant.findMostViewedResByNameFeatures(sql_search, features, from, to)
                restaurants = disListRestaurant(restaurants, byFeatures)
            }
            if (foodtypes) {
                const byFoodTypes = await Restaurant.findMostViewedResByNameFoodTypes(sql_search, foodtypes, from, to)
                restaurants = disListRestaurant(restaurants, byFoodTypes)
            }
            if(meals) {
                const byMeals = await Restaurant.findMostViewResByNameMeals(sql_search, meals, from, to)
                restaurants = disListRestaurant(restaurants, byMeals)
            }
        } else if(sql_search) {
            const byNameOnly = await Restaurant.findMostViewedResByName(sql_search, from, to)
            restaurants = disListRestaurant(restaurants, byNameOnly)
        } else {
            return res.status(500).send({error: 'Please add filter or search'})
        }
        if(restaurants.length == 0){
            return res.status(404).send({error: 'No Restaurant Was Found'})
        }
        return res.status(200).json({restaurants})
    } catch {
        console.log(error)
        return res.status(500).json({error: error.sqlMessage})
    }
}))

router.get('/highest-rating', wrapAsync(async(req, res, next) => {
    try {
        const listRestaurants = await Restaurant.loadTopRating()
        return res.status(200).json(listRestaurants)
    } catch(error) {
        console.log(error)
        return res.status(500).json({error: error.sqlMessage})
    }
}))

function disListRestaurant(rests1, rests2){
    let result = []
    if(rests1.length == 0) {
        result = rests2.slice()
    }else {
        for (const item of rests2) {
            rests1.filter(x => x.id == item.id)
        }
        result = rests1
    }
    return result
}

module.exports = router