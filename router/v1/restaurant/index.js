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

router.get('/restaurant_detail/:id', wrapAsync(async(req, res, next) => {
    try {
        const { id } = req.params
        const restaurant = await Restaurant.findRestaurantById(id)
        const images = await Restaurant.loadImagesByRestaurantId(id)
        const comments = await Restaurant.loadCommentsByRestaurantId(id)
        return res.status(200).json({restaurant, images, comments})
    } catch (error) {
        return res.status(500).send(error)
    }
}))

module.exports = router