const express = require('express')
const multer = require('multer')

const router = express.Router()

const place = require(global.appRoot + '/models/activity')
const { wrapAsync, getImageUrlAsLink } = require(global.appRoot + '/utils')
const { removeExistedImages } = require('./utils')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './place_images')
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
        const categories = await place.loadAllCategories()
        const activities = await place.loadAllActivities()
        const places = await place.loadAllPlaces()
        const request_url = req.protocol + '://' + req.get('host')
        places.map(place => {
            place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
        })
        return res.status(200).json({categories, activities, places})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.get('/addnew', wrapAsync(async(req, res, next) => {
    try {
        const categories = await place.loadAllCategories()
        const activities = await place.loadAllActivities()
        return res.status(200).json({categories, activities})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
}))

router.get('/detail/:placeid', wrapAsync(async(req, res, next) => {
    try {
        const { placeid } = req.params
        const activities = await place.loadAllActivities()
        const request_url = req.protocol + '://' + req.get('host')
        let selectedPlace = await place.loadDetailById(placeid)
        if(!selectedPlace.length){
            return res.status(404).json("Place is not found")
        }
        selectedPlace = selectedPlace[0]
        selectedPlace.thumbnail = await getImageUrlAsLink(request_url, selectedPlace.thumbnail)
        const images = await place.loadImagesByPlaceId(placeid)
        images.map(async(image) => {
            image.address = await getImageUrlAsLink(request_url, image.address)
        })
        const kind_of_place = await place.loadActivityByPlaceId(placeid)
        return res.status(200).json({activities, selectedPlace, images, kind_of_place})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/', upload.fields([{ name: 'images' }, { name: 'thumbnail', maxCount: 1 }]), wrapAsync(async(req, res, next) => {
    try {
        const { name, about, duration, open_hour, address, phone } = req.body
        const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0].path : null
        let images = req.files['images'] ? req.files['images'].map(image => image.path) : null
        const newPlace = {
            name, about, duration, open_hour, address, thumbnail: thumbnail? thumbnail.replace('\\', '/'): '', phone
        }
        const isExisted = await place.findAllPlaceByName(name)
        if(isExisted.length){
            return res.status(409).json({message: 'This name is existing'})
        }
        const savedPlace = await place.addNewPlace(newPlace)
        console.log("inserted place: " + savedPlace.insertId)
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                    images[i] = images[i].replace('\\', '/')
                  await place.insertImage(images[i], savedPlace.insertId)
                }
            }
        }
        let kind_of_place = req.body.kind_of_place ? req.body.kind_of_place : []
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

router.put('/', upload.single('thumbnail'), wrapAsync(async(req, res, next) => {
    try {
        const { id, name, about, duration, open_hour, address, phone } = req.body
        const selectedPlace = await place.loadDetailById(id)
        if(!selectedPlace.length){
            return res.status(404).json("Place is not found")
        }
        let thumbnail = req.file ? req.file.path.replace('\\', '/') : null
        if(thumbnail == null){
            const existingImage = req.body.thumbnail
            if(existingImage){
                thumbnail = existingImage
            }
        }
        const editedPlace = { 
            id, name, about, duration, open_hour, address, phone, 
            thumbnail: thumbnail? thumbnail : selectedPlace[0].thumbnail }
        await place.updatePlace(editedPlace)
        if(req.file && req.file.path){
            await place.insertImage(thumbnail, id)
        }
        let kind_of_place = req.body.kind_of_place
        if(kind_of_place != null && kind_of_place.length){
            let previousKinds = await place.loadActivityByPlaceId(editedPlace.id)
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

router.put('/update-images', upload.array('images'), wrapAsync(async(req, res, next) => {
    try {
        const place_id = req.body.id
        const selectedPlace = await place.loadDetailById(place_id)
        if(!selectedPlace.length){
            return res.status(404).json("Place is not found")
        }
        const existingImages = await place.loadImagesByPlaceId(place_id)
        if(existingImages.length){
            const ids = existingImages.map(img => img.id)
            await place.deactivateImage(ids)
        }
        let images = req.files ? req.files.map(image => image.path) : null
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                    images[i] = images[i].replace('\\', '/')
                    await place.insertImage(images[i], place_id)
                }
            }
        }
        const { existedImages } = req.body
        if(existedImages){
            for(let i=0; i<existedImages.length;i++){
                if(existedImages[i] != null){
                  await place.insertImage(existedImages[i], place_id)
                }
            }
        }
        return res.status(200).json('update images successfully')
    } catch(error){
        console.log(error)
        return res.status(500).json('There is something wrong')
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

router.get('/filter', wrapAsync(async(req, res, next) => {
    const { search, activity_ids, status } = req.query
    let places = []
    if (!activity_ids && search) {
        places = await place.findAllPlaceByName(search)
    } else if(activity_ids && search) {
        places = await place.findAllPlaceByNameAndActivity(search, activity_ids)
    } else if (activity_ids && !search) {
        places = await place.loadAllPlacesByActivityId(activity_ids)
    } else {
        return res.status(500).send({error: 'No Place Was Found'})
    }
    
    if(status === 'active'){
        places = places.filter(x => x.is_active === 1)
    } else if(status === 'inactive'){
        places = places.filter(x => x.is_active === 0)
    }
    if(places.length == 0){
        return res.status(404).send({error: 'No Place Was Found'})
    }
    const request_url = req.protocol + '://' + req.get('host')
    places.map(place => {
        place.thumbnail = getImageUrlAsLink(request_url, place.thumbnail)
    })
    return res.status(200).json({places})
}))

module.exports = router