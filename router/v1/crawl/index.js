const express = require('express')

const router = express.Router()

const { wrapAsync } = require(global.appRoot + '/utils')
const { getLinksPage, getActivityLinks } = require('./utils')

router.use('/activity', require('./activity'))
router.use('/tour', require('./tour'))

router.get('/getpages/:url', wrapAsync(async(req, res, next) => {
    const pageLinks = await getLinksPage(req.params.url)
    let activityLinks = []
    for(let i=0; i<pageLinks.length;i++){
      const activityLink = await getActivityLinks(pageLinks[i])
      activityLinks = activityLinks.concat(activityLink)
    }
    res.status(200).send({activityLinks: activityLinks, count:activityLinks.length})
}))

module.exports = router