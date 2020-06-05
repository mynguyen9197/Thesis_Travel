const express = require('express')
const router = express.Router()

const { wrapAsync, getImageUrlAsObject, getAvatarUrlAsObject } = require(global.appRoot + '/utils')
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
        let restaurants = []
        if (cuisines) {
            const byCuisines = await Restaurant.findResByNameCuisines(search, cuisines)
            restaurants = disListRestaurant(restaurants, byCuisines)
        } else if(features) {
            const byFeatures = await Restaurant.findResByNameFeatures(search, features)
            restaurants = disListRestaurant(restaurants, byFeatures)
        } else if (foodtypes) {
            const byFoodTypes = await Restaurant.findResByNameFoodTypes(search, foodtypes)
            restaurants = disListRestaurant(restaurants, byFoodTypes)
        } else if(meals) {
            const byMeals = await Restaurant.findResByNameMeals(search, meals)
            restaurants = disListRestaurant(restaurants, byMeals)
        } else if(search) {
            const byNameOnly = await Restaurant.findResByName(search)
            restaurants = disListRestaurant(restaurants, byNameOnly)
        } else {
            return res.status(500).send({error: 'Please add filter or search'})
        }
        if(restaurants.length == 0){
            return res.status(404).send({error: 'No Restaurant Was Found'})
        }
        return res.status(200).json({restaurants, count: restaurants.length})
    } catch (error) {
        console.log(error)
    }
}))

router.get('/restaurant_detail/:id', wrapAsync(async(req, res, next) => {
    try {
        const { id } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const restaurant = await Restaurant.findRestaurantById(id)
        const images = await Restaurant.loadImagesByRestaurantId(id)
        images.map(image => getImageUrlAsObject(request_url, image))
        const comments = await Restaurant.loadCommentsByRestaurantId(id)
        comments.map(comment => getAvatarUrlAsObject(request_url, comment))
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
        const mostViewRestaurants = await Restaurant.loadMostViewRestaurants(last30days.toISOString().split('T')[0], today.toISOString().split('T')[0])
        console.log({last30days: last30days.toISOString().split('T')[0], lastUpdate: today.toISOString().split('T')[0]})
        return res.status(200).json(mostViewRestaurants)
    } catch {
        console.log(error)
        return res.status(500).json({error: error.sqlMessage})
    }
}))

router.get('/highest-rating', wrapAsync(async(req, res, next) => {
    try{
        const listRestaurants = await Restaurant.loadTopRating()
        console.log({listRestaurants})
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