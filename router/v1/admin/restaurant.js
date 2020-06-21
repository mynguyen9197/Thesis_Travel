const express = require('express')
const multer = require('multer')
const router = express.Router()

const restaurant = require(global.appRoot + '/models/restaurant')
const { wrapAsync, getImageUrlAsLink } = require(global.appRoot + '/utils')
const { removeExistedImages } = require('./utils')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './restaurant_images')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()  + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    } else{
        cb(null, false)
    }
}

const upload = multer({ 
    storage: storage,
    limits : {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const cuisines = await restaurant.loadAllCuisines()
        const features = await restaurant.loadAllFeatures()
        const foodTypes = await restaurant.loadAllFoodType()
        const meals = await restaurant.loadAllFoodMeal()

        const listRestaurants = await restaurant.loadAllRestaurant()
        const request_url = req.protocol + '://' + req.get('host')
        listRestaurants.map(restaurant => {
            restaurant.thumbnail = getImageUrlAsLink(request_url, restaurant.thumbnail)
        })
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

router.get('/detail/:restid', wrapAsync(async(req, res, next) => {
    try {
        const { restid } = req.params
        const cuisines = await restaurant.loadAllCuisines()
        const features = await restaurant.loadAllFeatures()
        const foodTypes = await restaurant.loadAllFoodType()
        const meals = await restaurant.loadAllFoodMeal()

        const request_url = req.protocol + '://' + req.get('host')
        let selectedRestaurant = await restaurant.findRestaurantById(restid)
        if(!selectedRestaurant.length){
            return res.status(404).json("Restaurant is not found")
        }
        selectedRestaurant = selectedRestaurant[0]
        selectedRestaurant.thumbnail = await getImageUrlAsLink(request_url, selectedRestaurant.thumbnail)
        const images = await restaurant.loadImagesByRestaurantId(restid)
        images.map(async(image) => {
            image.address = await getImageUrlAsLink(request_url, image.address)
        })
        const kind_meal = await restaurant.findMealsByResId(restid)
        const kind_feature = await restaurant.findFeaturesByResId(restid)
        const kind_food = await restaurant.findFoodTypesByResId(restid)
        const kind_cuisine = await restaurant.findCuisinesByResId(restid)
        return res.status(200).json({cuisines, features, foodTypes, meals, selectedRestaurant, images, kind_cuisine, kind_feature, kind_food, kind_meal})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/', upload.fields([{ name: 'images' }, { name: 'thumbnail', maxCount: 1 }]), wrapAsync(async(req, res, next) => {
    try {
        const { name, about, open_hour, address, phone, from, to, foodTypes, meals, features, cuisines } = req.body
        const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0].path : null
        let images = req.files['images'] ? req.files['images'].map(image => image.path) : null
        const rest = {
            name, about, open_hour, address, phone, from, to,
            thumbnail: thumbnail? thumbnail.substr(0, 17) + '\\' + thumbnail.substr(17): ''
        }
        const isExisted = await restaurant.findResByName(name)
        if(isExisted.length){
            return res.status(409).json({message: 'This name is existing'})
        }
        const savedRestaurant = await restaurant.insertNewRestaurant(rest)
        console.log("saved restaurant: " + savedRestaurant.insertId)
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                    images[i] = images[i].substr(0, 17) + '\\' + images[i].substr(17)
                    await restaurant.insertImage(images[i], savedRestaurant.insertId)
                }
            }
        }
        
        const cuisines_ids = cuisines ? cuisines.filter((value, index) => cuisines.indexOf(value) == index) : []
        for(let i=0;i<cuisines_ids.length;i++){
            if(cuisines_ids[i] > 0){
                await restaurant.insertCuisineRestaurant(cuisines_ids[i], savedRestaurant.insertId)
            }
        }
        
        const foodTypes_ids = foodTypes ? foodTypes.filter((value, index) => foodTypes.indexOf(value) == index) : []
        for(let i=0;i<foodTypes_ids.length;i++){
            if(foodTypes_ids[i] > 0){
                await restaurant.insertFoodTypeRestaurant(foodTypes_ids[i], savedRestaurant.insertId)
            }
        }
            
        const meals_ids = meals ? meals.filter((value, index) => meals.indexOf(value) == index) : []
        for(let i=0;i<meals_ids.length;i++){
            if(meals_ids[i] > 0){
                await restaurant.insertMealRestaurant(meals_ids[i], savedRestaurant.insertId)
            }
        }
            
        const features_ids = features ? features.filter((value, index) => features.indexOf(value) == index) : []
        for(let i=0;i<features_ids.length;i++){
            if(features_ids[i] > 0){
                await restaurant.insertFeatureRestaurant(features_ids[i], savedRestaurant.insertId)
            }
        }
        
        return res.status(201).json({ id: savedRestaurant.insertedId, message: 'insert'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/', upload.single('thumbnail'), wrapAsync(async(req, res, next) => {
    try {
        const { id, name, about, open_hour, address, phone, from, to, foodTypes, meals, features, cuisines } = req.body
        const selectedRestaurant = await restaurant.findRestaurantById(id)
        if(!selectedRestaurant.length){
            return res.status(404).json("Restaurant is not found")
        }
        const thumbnail = req.file ? req.file.path : req.body.thumbnail ? req.body.thumbnail : null
        const rest = {
            id, name, about, open_hour, address, phone, from, to,
            thumbnail: thumbnail? thumbnail.substr(0, 12) + '\\' + thumbnail.substr(12): selectedRestaurant[0].thumbnail
        }
        await restaurant.updateRestaurant(rest)
        
        if(cuisines != null){
            let previousKinds = await restaurant.loadCuisineByRestId(id)
            for(let i =0;i<previousKinds.length;i++){
                let isExisted = false;
                for(let j=0;j<cuisines.length;j++){
                    if(previousKinds[i].cuisine_id == cuisines[j]){
                        cuisines.splice(j, 1);
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
                await restaurant.deactivateCuisineOfRestaurant(ids)
            }
            for(let i=0;i<cuisines.length;i++){
                if(cuisines[i] != 0){
                    await restaurant.insertCuisineRestaurant(cuisines[i], id)
                }
            }
        }
        
        if(foodTypes != null){
            let previousKinds = await restaurant.loadFoodTypeByRestId(id)
            for(let i =0;i<previousKinds.length;i++){
                let isExisted = false;
                for(let j=0;j<foodTypes.length;j++){
                    if(previousKinds[i].type_id == foodTypes[j]){
                        foodTypes.splice(j, 1);
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
                await restaurant.deactivateFTOfRestaurant(ids)
            }
            for(let i=0;i<foodTypes.length;i++){
                if(foodTypes[i] != 0){
                    await restaurant.insertFoodTypeRestaurant(foodTypes[i], id)
                }
            }
        }
            
        if(meals != null){
            let previousKinds = await restaurant.loadMealByRestId(id)
            for(let i =0;i<previousKinds.length;i++){
                let isExisted = false;
                for(let j=0;j<meals.length;j++){
                    if(previousKinds[i].type_id == meals[j]){
                        meals.splice(j, 1);
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
                await restaurant.deactivateMealsOfRestaurant(ids)
            }
            for(let i=0;i<meals.length;i++){
                if(meals[i] != 0){
                    await restaurant.insertMealRestaurant(meals[i], id)
                }
            }
        }
            
        if(features != null){
            let previousKinds = await restaurant.loadFeatureByRestId(id)
            for(let i =0;i<previousKinds.length;i++){
                let isExisted = false;
                for(let j=0;j<features.length;j++){
                    if(previousKinds[i].type_id == features[j]){
                        features.splice(j, 1);
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
                await restaurant.deactivateFeaturesOfRestaurant(ids)
            }
            for(let i=0;i<features.length;i++){
                if(features[i] != 0){
                    await restaurant.insertFeatureRestaurant(features[i], id)
                }
            }
        }
        return res.status(202).json({ message: 'update'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.put('/update-images', upload.array('images'), wrapAsync(async(req, res, next) => {
    try {
        const res_id = req.body.id
        const selectedRestaurant = await restaurant.findRestaurantById(res_id)
        if(!selectedRestaurant.length){
            return res.status(404).json("Restaurant is not found")
        }
        const existingImages = await restaurant.loadImagesByRestaurantId(res_id)
        if(existingImages.length){
            const ids = existingImages.map(img => img.id)
            await restaurant.deactivateImage(ids)
        }
        let images = req.files ? req.files.map(image => image.path) : null
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                    images[i] = images[i].substr(0, 17) + '\\' + images[i].substr(17)
                    await restaurant.insertImage(images[i], res_id)
                }
            }
        }
        const { existedImages } = req.body
        if(existedImages){
            for(let i=0; i<existedImages.length;i++){
                if(existedImages[i] != null){
                    await restaurant.insertImage(existedImages[i], res_id)
                }
            }
        }
        return res.status(200).json('update images successfully')
    } catch(error){
        console.log(error)
        return res.status(500).json('There is something wrong')
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

router.get('/lookup', wrapAsync(async(req, res, next) => {
    try {
        const { search, cuisines, features, foodtypes, meals } = req.query
        let restaurants = []
        if (cuisines) {
            const byCuisines = await restaurant.findResByNameCuisines(search, cuisines)
            restaurants = disListRestaurant(restaurants, byCuisines)
        } else if(features) {
            const byFeatures = await restaurant.findResByNameFeatures(search, features)
            restaurants = disListRestaurant(restaurants, byFeatures)
        } else if (foodtypes) {
            const byFoodTypes = await restaurant.findResByNameFoodTypes(search, foodtypes)
            restaurants = disListRestaurant(restaurants, byFoodTypes)
        } else if(meals) {
            const byMeals = await restaurant.findResByNameMeals(search, meals)
            restaurants = disListRestaurant(restaurants, byMeals)
        } else if(search) {
            const byNameOnly = await restaurant.findResByName(search)
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