const express = require('express')
const router = express.Router()

const { wrapAsync } = require(global.appRoot + '/utils')
const Restaurant = require(global.appRoot + '/models/restaurant')

router.get('/', wrapAsync(async(req, res, next) => {
    const cuisines = await Restaurant.loadAllCuisines()
    const features = await Restaurant.loadAllFeatures()
    const foodTypes = await Restaurant.loadAllFoodType()
    const meals = await Restaurant.loadAllFoodMeal()

    const listRestaurants = await Restaurant.loadTop20ByRating()

    res.status(200).send({cuisines, features, foodTypes, meals, listRestaurants})
}))

router.get('/filter', wrapAsync(async(req, res, next) => {
    const { search, cuisines, features, foodTypes, meals } = req.query
    let restaurant = []
    if (!activity_ids && search) {
        restaurant = await Activity.findPlaceByName(search)
    } else if(activity_ids && search) {
        restaurant = await Activity.findPlaceByNameAndActivity(search, activity_ids)
    } else if (activity_ids && !search) {
        restaurant = await Activity.loadPlacesByActivityId(activity_ids)
    } else {
        return res.status(500).send({error: 'Please add filter or search'})
    }
    if(restaurant.length == 0){
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json({places: restaurant})
}))

module.exports = router