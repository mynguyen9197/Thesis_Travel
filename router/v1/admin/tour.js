const express = require('express')
const multer = require('multer')
const router = express.Router()

const tour = require(global.appRoot + '/models/tour')
const { wrapAsync, getImageUrlAsLink } = require(global.appRoot + '/utils')
const { removeExistedImages } = require('./utils')
const { static } = require('express')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './tour_images')
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
        const activities = await tour.loadAllTourActivities()
        const tours = await tour.loadInfoAllTours()
        const request_url = req.protocol + '://' + req.get('host')
        tours.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json({activities, tours})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/addnew', wrapAsync(async(req, res, next) => {
    try {
        const activities = await tour.loadAllTourActivities()
        const tourisms = await tour.getAllTourisms()
        return res.status(200).json({activities, tourisms})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/detail/:tourid', wrapAsync(async(req, res, next) => {
    try {
        const { tourid } = req.params
        const activities = await tour.loadAllTourActivities()
        const tourisms = await tour.getAllTourisms()
        const request_url = req.protocol + '://' + req.get('host')
        let selectedTour = await tour.findTourById(tourid)
        if(!selectedTour.length){
            return res.status(404).json("Tour is not found")
        }
        selectedTour = selectedTour[0]
        selectedTour.thumbnail = await getImageUrlAsLink(request_url, selectedTour.thumbnail)
        const images = await tour.loadImagesByTourId(tourid)
        images.map(async(image) => {
            image.address = await getImageUrlAsLink(request_url, image.address)
        })
        const kind_of_tour = await tour.loadActivityByTourId(tourid)
        return res.status(200).json({activities, selectedTour, images, kind_of_tour, tourisms})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.post('/', upload.fields([{ name: 'images' }, { name: 'thumbnail', maxCount: 1 }]), wrapAsync(async(req, res, next) => {
    try {
        const { name, price, overview, highlight, wtd, important_info, additional, cancel_policy, key_detail, advantage, duration, tourism_id } = req.body
        const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0].path : null
        let images = req.files['images'] ? req.files['images'].map(image => image.path) : null
        const newTour = {
            name, overview, price, highlight, wtd, important_info, additional, cancel_policy, key_detail, advantage, duration, 
            thumbnail: thumbnail? thumbnail.replace('\\', '/'): ''
        }
        const isExisted = await tour.findAllTourByName(name)
        if(isExisted.length){
            return res.status(409).json({message: 'This name is existing'})
        }
        const savedTour = await tour.insertNewTour(newTour, tourism_id)
        console.log("inserted tour: " + savedTour.insertId)
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                    images[i] = images[i].replace('\\', '/')
                  await tour.insertImage(images[i], savedTour.insertId)
                }
            }
        }
        let type = req.body.kind_of_tour ? req.body.kind_of_tour : []
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

router.put('/', upload.single('thumbnail'), wrapAsync(async(req, res, next) => {
    try {
        const { id, name, overview, price, hightlight, wtd, important_info, additional, cancel_policy, key_detail, advantage, duration, tourism_id } = req.body
        const selectedTour = await tour.findTourById(id)
        if(!selectedTour.length){
            return res.status(404).json("Tour is not found")
        }
        let thumbnail = req.file ? req.file.path.replace('\\', '/') : null
        if(thumbnail == null){
            const existingImage = req.body.thumbnail
            if(existingImage){
                thumbnail = existingImage
            }
        }
        const editedTour = { 
            id, name, overview, price, hightlight, wtd, important_info, additional, cancel_policy, key_detail, advantage, duration, tourism_id,
            thumbnail: thumbnail? thumbnail: selectedTour[0].thumbnail }
        await tour.updateTour(editedTour)
        if(req.file && req.file.path){
            await tour.insertImage(thumbnail, id)
        }
        const kind_of_tour = req.body.kind_of_tour
        if(kind_of_tour != null && kind_of_tour.length){
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
                    if(kind_of_tour[i]){
                        await tour.insertActivityTour(editedTour.id, kind_of_tour[i])
                    }
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
        const tour_id = req.body.id
        const selectedTour = await tour.findTourById(tour_id)
        if(!selectedTour.length){
            return res.status(404).json("Tour is not found")
        }
        const existingImages = await tour.loadImagesByTourId(tour_id)
        if(existingImages.length){
            const ids = existingImages.map(img => img.id)
            await tour.deactivateImage(ids)
        }
        let images = req.files ? req.files.map(image => image.path) : null
        if(images != null){
            for(let i=0; i<images.length;i++){
                if(images[i] != null){
                    images[i] = images[i].replace('\\', '/')
                    await tour.insertImage(images[i], tour_id)
                }
            }
        }
        const { existedImages } = req.body
        if(existedImages){
            for(let i=0; i<existedImages.length;i++){
                if(existedImages[i] != null){
                    await tour.insertImage(existedImages[i], tour_id)
                }
            }
        }
        return res.status(200).json('update images successfully')
    } catch(error){
        console.log(error)
        return res.status(500).json('There is something wrong')
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

router.get('/filter', wrapAsync(async(req, res, next) => {
    const { search, activity_ids, status } = req.query
    let tours = []
    if (!activity_ids && search) {
        tours = await tour.findAllTourByName(search)
    } else if(activity_ids && search) {
        tours = await tour.findAllTourByNameAndActivity(search, activity_ids)
    } else if (activity_ids && !search) {
        tours = await tour.loadAllTourByActivityId(activity_ids)
    } else {
        return res.status(500).send({error: 'Please add filter or search'})
    }
    
    if(status === 'active'){
        tours = tours.filter(x => x.is_active === 1)
    } else if(status === 'inactive'){
        tours = tours.filter(x => x.is_active === 0)
    }
    if(tours.length == 0){
        return res.status(404).send({error: 'No Activity Was Found'})
    }
    return res.status(200).json({ tours })
}))

module.exports = router