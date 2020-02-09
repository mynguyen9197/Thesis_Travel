const express = require('express')
const router = express.Router()

const { verifyToken } = require(global.appRoot + '/utils')

router.use('/tour', verifyToken,require('./tour'))
router.use('/restaurant', verifyToken, require('./restaurant'))
router.use('/place', verifyToken, require('./place'))

module.exports = router