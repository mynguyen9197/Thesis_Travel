const express = require('express')
const router = express.Router()

router.use('/tour',require('./tour'))
router.use('/restaurant', require('./restaurant'))
router.use('/place', require('./place'))

module.exports = router