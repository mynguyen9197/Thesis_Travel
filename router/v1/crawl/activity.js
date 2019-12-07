const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()

const activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')
const { getReviews, getDetailReview } = require('./utils')

const getDetail = async (url) => {
  try {
    const browser = await puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.goto(url + '#photos;aggregationId=&albumid=101&filter=7').then(async() => {
      page.content().then(async(content) =>{
        let $ = cheerio.load(content)
        const name = $('.ui_header').first().text()
        const foundName = await activity.loadByName(name)
        if(foundName.length !== 0) return
        let rating = $('.ui_header').first().next().find('span').attr('class').split('_')
        rating = parseFloat(rating[rating.length - 1])/10
        console.log(rating)
        const review = $('.ui_header').first().next().find('span').eq(1).text().split(' ')[0]
        const ranking = $('.ui_header').parent().next().find('span').first().text()
        const kind_of_place = $('.ui_header').parent().next().find('span').eq(2).text().split(', ')
        const overview = $('.attractions-attraction-review-atf-overview-card-AttractionReviewATFOverviewCard__section--2uMTX').children('span').text()
        console.log({review, ranking, kind_of_place, overview})
        let duration = $('.attractions-attraction-detail-about-card-AboutSection__sectionWrapper--3PMQg').text()
        if(duration){
          duration = duration.split(':')[1]
        }

        let address = $('.attractions-attraction-review-atf-overview-card-Address__address_container--GORbF').text()
        if(address){
          address = address.split(':')[1]
        }

        let thumbnail = $('._1DZ3tIGJ').first().find('div').css('background-image')
        thumbnail = thumbnail.replace('url(','').replace(')','').replace(/\"/gi, "")
        
        /*contact*/
        const phone = $('.phone').first().text()
        
        let comment = {}
        let images = {}
        
        const reviewdt = $('[data-test-target="reviews-tab"]').find('.location-review-review-list-parts-ReviewFilters__filters_wrap--y1t86').find('.ui_columns ').html()
        const review_detail = await getDetailReview(reviewdt)
        
        const detail = {
          name: name.replace(/'/g, "`"),
          rating, review,
          ranking: ranking, 
          about: overview.replace(/'/g, "`"),
          duration, address,
          thumbnail, phone,
          review_detail: review_detail
        }
        const savedActivity= await activity.insertPlace(detail)
        
        const comments = await getReviews($('[data-test-target="reviews-tab"]').html())
        //console.log({review_detail, comments})
        for(let i=0; i<comment.length;i++){
          if(comment[i] != null){
            await activity.insertComment(comment[i], savedActivity.insertId, 5)
          }
        }
        
        const images_html = $('.photoGridBox').html()
        if(images_html != null){
          await getImages(images_html).then((result) => {
            images = result
          })
          for(let i=0; i<images.length;i++){
            if(images[i] != null){
              await activity.insertImage(images[i], savedActivity.insertId)
            }
          }
        }
        //console.log(images)

        for(let i=0;i<kind_of_place.length;i++){
          const act = await activity.loadActivityByName(kind_of_place[i])
          if(act[0]){
            const index = act[0].id
            await activity.insertActivityPlace(index, savedActivity.insertId)
          }
        }
      })
    })
    browser.close();
  } catch (error) {
    console.error(error)
  }
}

const getImages = async(html) => {
  const listImages = []
  const $ = cheerio.load(html)
  $('.albumGridItem').map(async(i, el) => {
    if($(el).find('.fillSquare') != null){
      if($(el).find('.fillSquare').find('img') != null){
        const src = $(el).find('.fillSquare').find('img').attr('src')
        listImages.push(src)
      }
    }
  })
  return listImages
}

router.post('/saveDetail', wrapAsync(async(req, res, next) => {
  const { link } = req.body
  await getDetail(link).then(() => {
    res.status(200).send("")
  })
}))

module.exports = router