const express = require('express')
const router = express.Router()

router.use('/', require('./main'))
router.use('/hotel', require('./hotel'))
router.use('/restaurant', require('./restaurant'))
router.use('/flight', require('./flight'))

module.exports = router