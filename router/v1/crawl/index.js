const express = require('express')
const router = express.Router()

router.use('/activity', require('./activity'))
router.use('/tour', require('./tour'))

module.exports = router