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
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url + '#photos;aggregationId=&albumid=101&filter=7').then(async() => {
      page.content().then(async(content) =>{
        let $ = cheerio.load(content)
        const name = $('#HEADING').text()
        const thumbnail = $('.attractions_large').find('img').attr('src')
        const rating = $('.ratingContainer').find('span').attr('alt')
        const review = $('.ratingContainer').text()
        const ranking = $('.popIndexContainer').text()

        /*contact*/
        const address = $('.address').text()
        const phone = $('.phone').text()
        
        /*about */
        const allAbout = $('.attractions-attraction-detail-about-card-AttractionDetailAboutCard__section--1_Efg').text()

        let comment = {}
        let images = {}
        
        const kind_of_place = $('.attractionCategories').text().split(" More")[0].split(", ")
        
        const review_detail_html = $('.collapsibleContent').html()
        const review_detail = await getDetailReview(review_detail_html)
        
        const detail = {
          name: name,
          thumbnail: thumbnail,
          rating: parseFloat(rating.split(" ")[0].replace(",", ".")),
          review: parseInt(review.split(" ")[0]),
          ranking: ranking, 
          about: allAbout,
          review_detail: review_detail
        }
        const savedActivity= await activity.insertPlace(detail)
        
        const contact = {
          address: address,
          phone: phone,
          place_id: savedActivity.insertId
        }
        await activity.insertContact(contact)

        const reviews_html = $('.listContainer').html()
        await getReviews(reviews_html).then((result) => {
          comment = result
        })
        for(let i=0; i<comment.length;i++){
          if(comment[i] != null){
            await activity.insertComment(comment[i], savedActivity.insertId)
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

        let listKinds = await activity.loadAllKinds()
        listKinds = listKinds.map(x => x.name)
        for(let i=0;i<kind_of_place.length;i++){
          const index = listKinds.indexOf(kind_of_place[i])
          if(index != -1){
            await activity.insertActivityPlace(index + 1, savedActivity.insertId)
          }
        }
      })
    })
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