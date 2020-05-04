const express = require('express')
const router = express.Router()

const place = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')
const { removeExistedImages } = require('./utils')

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
        const activities = await place.loadAllActivities()
        const selectedPlace = await place.loadDetailById(placeid)
        const images = await place.loadImagesByPlaceId(placeid)
        const kind_of_place = await place.loadActivityByPlaceId(placeid)
        return res.status(200).json({activities, selectedPlace, images, kind_of_place})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/', wrapAsync(async(req, res, next) => {
    try {
        const { newPlace } = req.body
        const savedPlace = await place.addNewPlace(newPlace)
        const images = newPlace.images
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                  await place.insertImage(images[i], savedPlace.insertId)
                }
            }
        }
        let kind_of_place = newPlace.kind_of_place
        kind_of_place = kind_of_place.filter((value, index) => kind_of_place.indexOf(value) == index)
        for(let i=0;i<kind_of_place.length;i++){
            if(kind_of_place[i] != 0){
              await place.insertActivityPlace(kind_of_place[i], savedPlace.insertId)
            }
        }
        return res.status(201).json({ id: savedPlace.insertedId, message: 'insert'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/', wrapAsync(async(req, res, next) => {
    try {
        const { editedPlace } = req.body
        await place.updatePlace(editedPlace)
        const newImages = editedPlace.images
        if(newImages != null){
            const existedImages = await place.loadImagesByPlaceId(editedPlace.id)
            const {previousImages, images} = await removeExistedImages(existedImages, newImages)
            if(images != null){
                for(let i=0; i<images.length;i++){
                    if(images[i] != null){
                      await place.insertImage(images[i], editedPlace.id)
                    }
                }
            }
            if(previousImages.length > 0){
                const ids = previousImages.map(x => x.id)
                await place.deactivateImage(ids)
            }
        }
        const kind_of_place = editedPlace.kind_of_place
        if(kind_of_place != null){
            let previousKinds = await place.loadActivityByPlaceId(editedPlace.id)
            console.log(previousKinds)
            for(let i =0;i<previousKinds.length;i++){
                let isExisted = false;
                for(let j=0;j<kind_of_place.length;j++){
                    if(previousKinds[i].activity_id == kind_of_place[j]){
                        kind_of_place.splice(j, 1);
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
                console.log({ids, kind_of_place})
                await place.deactivateKindOfPlace(ids)
            }
            for(let i=0;i<kind_of_place.length;i++){
                if(kind_of_place[i] != 0){
                  await place.insertActivityPlace(kind_of_place[i], editedPlace.id)
                }
            }
        }
        return res.status(202).json({ id: editedPlace.id, message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.delete('/deactivate/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        await place.deactivatePlace(placeid)
        return res.status(200).json({ id: placeid, message: "deactivated"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/activate/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        await place.activatePlace(placeid)
        return res.status(200).json({ id: placeid, message: "activated"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

module.exports = router