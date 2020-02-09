const express = require('express')
const router = express.Router()

const tour = require(global.appRoot + '/models/tour')
const { wrapAsync } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const activities = await tour.loadAllTourActivities()
        const tours = await tour.loadInfoAllTours()
        return res.status(200).json({activities, tours})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/:tourid', wrapAsync(async(req, res, next) => {
    try {
        const { tourid } = req.params
        const activities = await tour.loadAllTourActivities()
        const selectedTour = await tour.findTourById(tourid)
        const images = await tour.loadImagesByTourId(tourid)
        return res.status(200).json({activities, selectedTour, images})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/', wrapAsync(async(req, res, next) => {
    try {
        const { tour } = req.body
        const savedTour = await tour.insertTour(tour)
        return res.status(201).json({ id: savedTour.insertedId, message: 'insert'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/', wrapAsync(async(req, res, next) => {
    try {
        const tour = req.body
        const savedTour = await tour.updateTour(tour)
        return res.status(202).json({ id: savedTour.insertedId, message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.delete('/', wrapAsync(async(req, res, next) => {
    try {
        const tour = req.body
        const savedTour = await tour.deactivate(tour)
        return res.status(204).json({ id: savedTour.insertedId, message: "delete"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

module.exports = router