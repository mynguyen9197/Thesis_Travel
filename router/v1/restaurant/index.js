const express = require('express')
const router = express.Router()

const { wrapAsync } = require(global.appRoot + '/utils')
router.get('/', wrapAsync(async(req, res, next) => {
    res.status(200).send('Restaurant')
}))

module.exports = router