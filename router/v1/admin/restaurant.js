const express = require('express')
const router = express.Router()

const restaurant = require(global.appRoot + '/models/restaurant')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const cuisines = await restaurant.loadAllCuisines()
        const features = await restaurant.loadAllFeatures()
        const foodTypes = await restaurant.loadAllFoodType()
        const meals = await restaurant.loadAllFoodMeal()

        const listRestaurants = await restaurant.loadAllRestaurant()
        return res.status(200).json({cuisines, features, foodTypes, meals, listRestaurants})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.get('/:restid', wrapAsync(async(req, res, next) => {
    try {
        const { restid } = req.params
        const cuisines = await restaurant.loadAllCuisines()
        const features = await restaurant.loadAllFeatures()
        const foodTypes = await restaurant.loadAllFoodType()
        const meals = await restaurant.loadAllFoodMeal()
        const selectedRestaurant = await restaurant.findRestaurantById(restid)
        const images = await restaurant.loadImagesByRestaurantId(restid)
        return res.status(200).json({cuisines, features, foodTypes, meals, selectedRestaurant, images})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/', wrapAsync(async(req, res, next) => {
    try {
        const restaurant = req.body
        const savedRestaurant = await restaurant.insertRestaurant(restaurant)
        return res.status(201).json({ id: savedRestaurant.insertedId, message: 'insert'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/', wrapAsync(async(req, res, next) => {
    try {
        const restaurant = req.body
        const savedRestaurant = await restaurant.updateRestaurant(restaurant)
        return res.status(202).json({ id: savedRestaurant.insertedId, message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.delete('/', wrapAsync(async(req, res, next) => {
    try {
        const restaurant = req.body
        const savedRestaurant = await restaurant.deactivate(restaurant)
        return res.status(204).json({ id: savedRestaurant.insertedId, message: "delete"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

module.exports = router