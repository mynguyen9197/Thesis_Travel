const express = require('express')
const router = express.Router()

router.use('/', require('./main'))
router.use('/hotel', require('./hotel'))
router.use('/restaurant', require('./restaurant'))
router.use('/flight', require('./flight'))
router.use('/activity', require('./activity'))
router.use('/crawl', require('./crawl'))
router.use('/user', require('./user'))

module.exports = router