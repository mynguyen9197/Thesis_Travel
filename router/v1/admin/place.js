const express = require('express')
const router = express.Router()

const place = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const categories = await place.loadAllCategories()
        const places = await place.loadAllPlaces()
        return res.status(200).json({categories, places})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.get('/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const activities = await place.loadAllCategories()
        const selectedPlace = await place.loadDetailById(placeid)
        const images = await place.loadImagesByPlaceId(placeid)
        return res.status(200).json({activities, selectedPlace, images})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/', wrapAsync(async(req, res, next) => {
    try {
        const { place } = req.body
        const savedPlace = await place.insertPlace(place)
        return res.status(201).json({ id: savedPlace.insertedId, message: 'insert'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/', wrapAsync(async(req, res, next) => {
    try {
        const { place } = req.body
        const savedPlace = await place.updatePlace(place)
        return res.status(202).json({ id: savedPlace.insertedId, message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.delete('/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const savedPlace = await place.deactivate(placeid)
        return res.status(204).json({ id: savedPlace.insertedId, message: "delete"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

module.exports = router