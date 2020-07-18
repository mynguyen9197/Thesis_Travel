const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const Tour = require(global.appRoot + '/models/tour')
const { wrapAsync, getImageUrlAsLink } = require(global.appRoot + '/utils')

router.get('/', wrapAsync(async(req, res, next) => {
    try {
        const request_url = req.protocol + '://' + req.get('host')
        const activities = await Tour.loadAllTourActivities()
        if ( activities === null ) {
            return res.status(404).send({error: 'No Tour Was Found'})
        }
        const activity_ids = activities.map(x => x.id)
        const tours = await Tour.loadTourByActivityId(activity_ids)
        tours.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json({ activities, tours: tours })
    } catch (error) {
        console.log(error)
        return res.status(500).send(error.sqlMessage)
    }
}))

router.get('/filter', wrapAsync(async(req, res, next) => {
    const { search, activity_ids } = req.query
    const request_url = req.protocol + '://' + req.get('host')
    let tours = []
    if (!activity_ids && search) {
        tours = await Tour.findTourByName(search)
    } else if(activity_ids && search) {
        tours = await Tour.findTourByNameAndActivity(search, activity_ids)
    } else if (activity_ids && !search) {
        tours = await Tour.loadTourByActivityId(activity_ids)
    } else {
        return res.status(500).send({error: 'No Tour Was Found'})
    }
    if(tours.length == 0){
        return res.status(404).send({error: 'No Tour Was Found'})
    }
    tours.map(tour => {
        tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
    })
    return res.status(200).json({ tours })
}))

router.get('/tour_detail/:tour_id', wrapAsync(async(req, res, next) => {
    try {
        const { tour_id } = req.params
        const request_url = req.protocol + '://' + req.get('host')
        const tour_detail = await Tour.findTourById(tour_id)
        if(!tour_detail.length){
            return res.status(404).json('Tour is not found')
        }
        tour_detail[0].thumbnail = getImageUrlAsLink(request_url, tour_detail[0].thumbnail)
        let images = await Tour.loadImagesByTourId(tour_id)
        images.map(image => {
            image.address = getImageUrlAsLink(request_url, image.address)
        })
        const comments = await Tour.loadCommentsByTourId(tour_id)
        comments.map(comment => {
            comment.avatar = getImageUrlAsLink(request_url, comment.avatar)
        })
        const tourism = await Tour.findTourismById(tour_detail[0].tourism_id)
        const bearerHeader = req.headers['authorization']
        if(bearerHeader){
            const token = bearerHeader.split(' ')[1]
            const decoded = jwt.verify(token, 'RESTFULAPIs')
            if(decoded){
                const rating = await Tour.checkIfUserAlreadyReview(tour_id, decoded.id)
                return res.status(200).json({tour_detail, images, comments, tourism, rating: rating[0]})
            }
        }
        return res.status(200).send({tour_detail, images, comments, tourism})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/most-viewed', wrapAsync(async(req, res, next) => {
    try{
        const request_url = req.protocol + '://' + req.get('host')
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now() - tzoffset)
        let last30days = new Date(Date.now() - tzoffset)
        last30days.setDate(new Date(today.getDate() - 30))
        const { search, activity_ids } = req.query
        const from = last30days.toISOString().split('T')[0]
        const to = today.toISOString().split('T')[0]
        let tours = []
        if (!activity_ids && search) {
            tours = await Tour.findMostViewedTourByName(search, from, to)
        } else if(activity_ids && search) {
            tours = await Tour.findMostViewedTourByNameAndActivity(search, activity_ids, from, to)
        } else if (activity_ids && !search) {
            tours = await Tour.loadMostViewedTourByActivityId(activity_ids, from, to)
        } else {
            return res.status(500).send({error: 'No Tour Was Found'})
        }
        if(tours.length == 0){
            return res.status(404).send({error: 'No Tour Was Found'})
        }
        tours.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json({tours})
    } catch(error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/cheapest', wrapAsync(async(req, res, next) => {
    try{
        const { search, activity_ids } = req.query
        const request_url = req.protocol + '://' + req.get('host')
        let tours = []
        if (!activity_ids && search) {
            tours = await Tour.findCheapestTourByName(search)
        } else if(activity_ids && search) {
            tours = await Tour.findCheapestTourByNameAndActivity(search, activity_ids)
        } else if (activity_ids && !search) {
            tours = await Tour.loadCheapestTourByActivityId(activity_ids)
        } else {
            return res.status(500).send({error: 'No Tour Was Found'})
        }
        if(tours.length == 0){
            return res.status(404).send({error: 'No Tour Was Found'})
        }
        tours.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json({tours})
    } catch (error){
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/most-expensive', wrapAsync(async(req, res, next) => {
    try{
        const request_url = req.protocol + '://' + req.get('host')
        const { search, activity_ids } = req.query
        let tours = []
        if (!activity_ids && search) {
            tours = await Tour.findMostExpensiveTourByName(search)
        } else if(activity_ids && search) {
            tours = await Tour.findMostExpensiveTourByNameAndActivity(search, activity_ids)
        } else if (activity_ids && !search) {
            tours = await Tour.loadMostExpensiveTourByActivityId(activity_ids)
        } else {
            return res.status(500).send({error: 'No Tour Was Found'})
        }
        if(tours.length == 0){
            return res.status(404).send({error: 'No Tour Was Found'})
        }
        tours.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json({tours})
    } catch(error) {
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/highest-rating', wrapAsync(async(req, res, next) => {
    try {
        const request_url = req.protocol + '://' + req.get('host')
        const tours = await Tour.loadTopRating()
        tours.map(tour => {
            tour.thumbnail = getImageUrlAsLink(request_url, tour.thumbnail)
        })
        return res.status(200).json(tours)
    } catch(error) {
        console.log(error)
        return res.status(500).json({error: error.sqlMessage})
    }
}))

module.exports = router