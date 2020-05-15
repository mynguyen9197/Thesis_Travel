const express = require('express')
const router = express.Router()

const tour = require(global.appRoot + '/models/tour')
const { wrapAsync } = require(global.appRoot + '/utils')
const { removeExistedImages } = require('./utils')

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

router.get('/addnew', wrapAsync(async(req, res, next) => {
    try {
        const activities = await tour.loadAllTourActivities()
        return res.status(200).json({activities})
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
        const { newTour } = req.body
        const savedTour = await tour.insertNewTour(newTour, newTour.tourism_id)
        const images = newTour.images
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                  await tour.insertImage(images[i], savedTour.insertId)
                }
            }
        }
        let type = newTour.kind_of_tour
        type = type.filter((value, index) => type.indexOf(value) == index)
        for(let i=0;i<type.length;i++){
            if(type[i] != 0){
                await tour.insertActivityTour(savedTour.insertId, type[i])
            }
        }
        return res.status(201).jsonp({ id: savedTour.insertedId, message: 'insert'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/', wrapAsync(async(req, res, next) => {
    try {
        const { editedTour } = req.body
        await tour.updateTour(editedTour)
        const newImages = editedTour.images
        if(newImages != null){
            const existedImages = await tour.loadImagesByTourId(editedTour.id)
            const {previousImages, images} = await removeExistedImages(existedImages, newImages)
            if(images != null){
                for(let i=0; i<images.length;i++){
                    if(images[i] != null){
                      await tour.insertImage(images[i], editedTour.id)
                    }
                }
            }
            if(previousImages.length > 0){
                const ids = previousImages.map(x => x.id)
                await tour.deactivateImage(ids)
            }
        }
        const kind_of_tour = editedTour.kind_of_tour
        if(kind_of_tour != null){
            let previousKinds = await tour.loadActivityByTourId(editedTour.id)
            for(let i =0;i<previousKinds.length;i++){
                let isExisted = false;
                for(let j=0;j<kind_of_tour.length;j++){
                    if(previousKinds[i].activity_id == kind_of_tour[j]){
                        kind_of_tour.splice(j, 1);
                        j--;
                        isExisted = true;
                    }
                }
                if(isExisted){
                    previousKinds.splice(i, 1);
                    i--;
                }
            }
            if(previousKinds.length > 0){
                const ids = previousKinds.map(x => x.id)
                await tour.deactivateKindOfTour(ids)
            }
            for(let i=0;i<kind_of_tour.length;i++){
                if(kind_of_tour[i] != 0){
                    await tour.insertActivityTour(editedTour.id, kind_of_tour[i])
                }
            }
        }
        return res.status(202).json({ message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.delete('/deactivate/:tour_id', wrapAsync(async(req, res, next) => {
    try {
        const { tour_id } = req.params
        await tour.deactivateTour(tour_id)
        return res.status(200).json({ id: tour_id, message: "deactivated"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/activate/:tour_id', wrapAsync(async(req, res, next) => {
    try {
        const { tour_id } = req.params
        await tour.activateTour(tour_id)
        return res.status(200).json({ id: tour_id, message: "activated"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

module.exports = router