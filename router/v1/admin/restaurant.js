const express = require('express')
const router = express.Router()

const restaurant = require(global.appRoot + '/models/restaurant')
const { wrapAsync } = require(global.appRoot + '/utils')
const { removeExistedImages } = require('./utils')

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

router.get('/addnew', wrapAsync(async(req, res, next) => {
    try {
        const cuisines = await restaurant.loadAllCuisines()
        const features = await restaurant.loadAllFeatures()
        const foodTypes = await restaurant.loadAllFoodType()
        const meals = await restaurant.loadAllFoodMeal()

        return res.status(200).json({cuisines, features, foodTypes, meals})
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
        const { newRestaurant } = req.body
        const { name, about, thumbnail, open_hour, address, phone, from, to, images } = newRestaurant
        const rest = {
            name, about, thumbnail, open_hour, address, phone, from, to, kind: newRestaurant.foodTypes.map(x => x.name).join(", "), 
            meals: newRestaurant.meals.map(x => x.name).join(", "), features: newRestaurant.features.map(x => x.name).join(", "), images
        }
        const savedRestaurant = await restaurant.insertNewRestaurant(rest)
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                  await restaurant.insertImage(images[i], savedRestaurant.insertId)
                }
            }
        }
        
        let cuisines = newRestaurant.cuisines.map(x => x.id)
        cuisines = cuisines.filter((value, index) => cuisines.indexOf(value) == index)
        for(let i=0;i<cuisines.length;i++){
            if(cuisines[i] > 0){
                await restaurant.insertCuisineRestaurant(cuisines[i], savedRestaurant.insertId)
            }
        }
        
        let foodTypes = newRestaurant.foodTypes.map(x => x.id)
        foodTypes = foodTypes.filter((value, index) => foodTypes.indexOf(value) == index)
        for(let i=0;i<foodTypes.length;i++){
            if(foodTypes[i] > 0){
                await restaurant.insertFoodTypeRestaurant(foodTypes[i], savedRestaurant.insertId)
            }
        }
            
        let meals = newRestaurant.meals.map(x => x.id)
        meals = meals.filter((value, index) => meals.indexOf(value) == index)
        for(let i=0;i<meals.length;i++){
            if(meals[i] > 0){
                await restaurant.insertMealRestaurant(meals[i], savedRestaurant.insertId)
            }
        }
            
        let features = newRestaurant.features.map(x => x.id)
        features = features.filter((value, index) => features.indexOf(value) == index)
        for(let i=0;i<features.length;i++){
            if(features[i] > 0){
                await restaurant.insertFeatureRestaurant(features[i], savedRestaurant.insertId)
            }
        }
        
        return res.status(201).json({ id: savedRestaurant.insertedId, message: 'insert'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/', wrapAsync(async(req, res, next) => {
    try {
        const { editedRestaurant } = req.body
        const { id, name, about, thumbnail, open_hour, address, phone, from, to, images } = editedRestaurant
        const rest = {
            id, name, about, thumbnail, open_hour, address, phone, from, to, kind: editedRestaurant.foodTypes.map(x => x.name).join(", "), 
            meals: editedRestaurant.meals.map(x => x.name).join(", "), features: editedRestaurant.features.map(x => x.name).join(", "), images
        }
        await restaurant.updateRestaurant(rest)
        const newImages = editedRestaurant.images
        if(newImages != null){
            const existedImages = await restaurant.loadImagesByRestaurantId(editedRestaurant.id)
            const {previousImages, images} = await removeExistedImages(existedImages, newImages)
            if(images != null){
                for(let i=0; i<images.length;i++){
                    if(images[i] != null){
                      await restaurant.insertImage(images[i], editedRestaurant.id)
                    }
                }
            }
            if(previousImages.length > 0){
                const ids = previousImages.map(x => x.id)
                await restaurant.deactivateImage(ids)
            }
        }
        
        const cuisines = editedRestaurant.cuisines.map(x => x.id)
        if(cuisines != null){
            let previousKinds = await restaurant.loadCuisineByRestId(editedRestaurant.id)
            for(let i =0;i<cuisines.length;i++){
                let isExisted = false;
                for(let j=0;j<previousKinds.length;j++){
                    if(previousKinds[j].cuisine_id == cuisines[i]){
                        isExisted = true;
                    }
                }
                if(!isExisted){
                    await restaurant.insertCuisineRestaurant(cuisines[i], editedRestaurant.id)
                }
            }
        }
        
        const foodTypes = editedRestaurant.foodTypes.map(x => x.id)
        if(foodTypes != null){
            let previousKinds = await restaurant.loadFoodTypeByRestId(editedRestaurant.id)
            for(let i =0;i<foodTypes.length;i++){
                let isExisted = false;
                for(let j=0;j<previousKinds.length;j++){
                    if(previousKinds[j].type_id == foodTypes[i]){
                        isExisted = true;
                    }
                }
                if(!isExisted){
                    await restaurant.insertFoodTypeRestaurant(foodTypes[i], editedRestaurant.id)
                }
            }
        }
            
        const meals = editedRestaurant.meals.map(x => x.id)
        if(meals != null){
            let previousKinds = await restaurant.loadMealByRestId(editedRestaurant.id)
            for(let i =0;i<meals.length;i++){
                let isExisted = false;
                for(let j=0;j<previousKinds.length;j++){
                    if(previousKinds[j].type_id == meals[i]){
                        isExisted = true;
                    }
                }
                if(!isExisted){
                    await restaurant.insertMealRestaurant(meals[i], editedRestaurant.id)
                }
            }
        }
            
        const features = editedRestaurant.features.map(x => x.id)
        if(features != null){
            let previousKinds = await restaurant.loadFeatureByRestId(editedRestaurant.id)
            for(let i =0;i<features.length;i++){
                let isExisted = false;
                for(let j=0;j<previousKinds.length;j++){
                    if(previousKinds[j].type_id == features[i]){
                        isExisted = true;
                    }
                }
                if(!isExisted){
                    await restaurant.insertFeatureRestaurant(features[i], editedRestaurant.id)
                }
            }
        }
        return res.status(202).json({ message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.delete('/deactivate/:rest_id', wrapAsync(async(req, res, next) => {
    try {
        const {rest_id} = req.params
        await restaurant.deactivateRestaurant(rest_id)
        return res.status(200).json({ id: rest_id, message: "deactivated"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/activate/:rest_id', wrapAsync(async(req, res, next) => {
    try {
        const {rest_id} = req.params
        await restaurant.activateRestaurant(rest_id)
        return res.status(200).json({ id: rest_id, message: "activated"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

module.exports = router