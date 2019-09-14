const express = require('express')
const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')
router.get('/', wrapAsync(async(req, res, next) => {
    await Activity.find({}, {_id: 0, comment: 0}).then((result) => {
        res.status(200).send(result)
    })
}))

module.exports = router