const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()
//xong cai dong link nay thi lay tu si_mon lay xuong
const activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')
const { getReviews, getDetailReview } = require('./utils')
var detailArray = []
const imagesArray = []
const activityLinks = []
const getDetail = async (url) => {
  try {
    const browser = await puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.setDefaultTimeout(0)
    await page.goto(url,{waitUntil: 'load',timeout:0}).then(async() => {
      page.content().then(async(content) =>{
        let $ = cheerio.load(content)

        const name = $('.ui_header').first().text()
        var open_hour = ''
        if($('.dayRange').html()!=null) {
          open_hour = $('.dayRange').first().text() + '     ' + $('.timeRange').first().text()
        }
        var rating = $('.overallRating').first().text()
        if(rating=='') {
          rating=$('.ui_bubble_rating').first().attr('class')
        }

        var review = $('.seeAllReviews').last().text()
        if(review == '') {
          review = $('.reviewCount').last().text()
        }
        var ranking = $('.popIndexValidation').first().text()
        if(ranking=='') {
          ranking = $('.attractions-supplier-profile-SupplierProfile__ranking--_Aqq4').first().text()
        }

        var kind_of_place = $('.attractionCategories').first().text()
        if(kind_of_place == '') {
          kind_of_place = $('.attractions-supplier-profile-SupplierCategories__headerDetail--2Fk4B').first().text()
        }
        
        var about = $('.attractions-attraction-detail-about-card-AttractionDetailAboutCard__section--1_Efg').eq(1).text()
        if(about == '') {
          about = $('.attractions-supplier-profile-SupplierDescription__description--lzIK9').first().text()
        }

        let duration = $('.attractions-attraction-detail-about-card-AboutSection__sectionWrapper--3PMQg').last().text()

        var address = $('.address').first().text()
        if(address == '') {
          address = $('.attractions-contact-card-ContactCard__contactRow--3Ih6v').first().text()
        }

        const phone = $('.phone').first().text()
        
        const reviewdt = $('[data-test-target="reviews-tab"]').find('.location-review-review-list-parts-ReviewFilters__filters_wrap--y1t86').find('.ui_columns ').html()
        const review_detail = await getDetailReview(reviewdt)
        
        const comments = await getReviews($('[data-test-target="reviews-tab"]').html())
      
       
        var images = {}
        var thumbnail = {}
        console.log({name, about, thumbnail, rating,review, ranking,open_hour, duration,review_detail, address, phone, kind_of_place, comments,images})
        console.log(',')
      })
    })
    //browser.close();
  } catch (error) {
    console.error(error)
  }
}

const getImage = async (url) => {
  try {
    const browser = await puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.setDefaultTimeout(0)
    await page.goto(url+'#photos;aggregationId=&albumid=101&filter=7',{waitUntil: 'load',timeout:0}).then(async() => {
      page.content().then(async(content) =>{
        let $ = cheerio.load(content)
        var images = {}
        const images_html = $('.photoGridBox').html()
        if(images_html != null){
          if($('.albumGridItem').html() == null) {
            await getLessImages($('.inHeroList').html()).then((result)=> {
              images = result.filter(removeNullImage)
            })
          } else {
            await getImages(images_html).then((result) => {
              images = result.filter(removeNullImage)
            })
          }
        }
        console.log(images)
        console.log(',')
      })
    })
    //browser.close();
  } catch (error) {
    console.error(error)
  }
}

const joinImageandDetail = async(details, images) => { //viet lai ham nay cho no chuan ti, thuat toan long leo
  if(details.length!=images.length) {
    console.log({detailLength: details.length,imagesLenght: images.length})
    return
  }
  for(let i=0;i<details.length;i++) {
    details[i].thumbnail = images[i][0]
    details[i].images = images[i]
    savetoDB(details[i])
  }
}

const savetoDB = async (item) => {
  const detail = {
    name: item.name.replace(/'/g, "`"),
    rating: item.rating,
    review: item.review,
    ranking: item.ranking,
    about: item.about.replace(/'/g, "`"),
    duration: item.duration,
    address: item.address.replace(/'/g, "`"),
    thumbnail: item.thumbnail,
    review_detail: item.review_detail,
    open_hour: item.open_hour,
    phone: item.phone
  }
  const saveActivity = await activity.insertPlace(detail)

  for(let i=0;i<item.images.length;i++) {
    if(item.images[i]!=null) {
      await activity.insertImage(item.images[i],saveActivity.insertId)
    }
  }

  for(let i=0;i<item.comments.length;i++) {
    if(item.comments[i] != null){
      await activity.insertComment(item.comments[i], saveActivity.insertId, 5)
    }
  }

  const kindOfPlaceArray = item.kind_of_place.split(', ')
 
  for(let i=0;i<kindOfPlaceArray.length;i++){
   const act = await activity.loadActivityByName(kindOfPlaceArray[i])
    
    if(act[0]){
      const index = act[0].id
      await activity.insertActivityPlace(index, saveActivity.insertId)
    }
  }
}

function removeNullImage(image) {
  return image != undefined;
}

const getLessImages = async(html)=> {
  const listImages = []
  const $ = cheerio.load(html)
  $('.tinyThumb').map(async(i, el) => {
    listImages.push($(el).attr('data-bigurl'))
  })
  return listImages
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
  for(let i=0;i<activityLinks.length;i++) {
    await getDetail(activityLinks[i]).then(() => {
    })
  }
}))

module.exports = router