const express = require('express')
const cheerio = require('cheerio')
const request = require('request')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

const url = 'https://www.tripadvisor.com.vn'
const listUrl = []

const getWebsiteContent = async (url_hoian) => {
  try {
    const response = await axios.get(url_hoian)
    const $ = cheerio.load(response.data)
    $('.attraction_element').map((i, el) => {
        const url_detail = $(el).find('a').attr('href')
        listUrl.push(url + url_detail.replace(/\n/g, ''))
    })
    console.log(listUrl)
  } catch (error) {
    console.error(error)
  }
}

  const getReviews = async(html) => {  
  const $ = cheerio.load(html) 
  const review_comment = []
  $('.review-container').map((i, el) => {
    const quote = $(el).find('a').text()
    const review_text = $(el).find('.partial_entry').text()
    const commet = {
      quote: quote,
      review_text: review_text
    }
    review_comment.push(commet)
  })
  return review_comment
}

const getDetail = async (url) => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url + '#photos;aggregationId=&albumid=101&filter=7').then(async() => {
      page.content().then(async(content) =>{
        const $ = cheerio.load(content)
        const name = $('#HEADING').text()
        const rating = $('.ratingContainer').find('span').attr('alt')
        const review = $('.ratingContainer').text()
        let comment = {}
        let images = {}

        const reviews_html = $('.listContainer').html()
        await getReviews(reviews_html).then((result) => {
          comment = result
        })

        const images_html = $('.photoGridBox').html()
        await getImages(images_html).then((result) => {
          images = result
        })
        
        const detail = new Activity({
          name: name,
          rating: parseFloat(rating.split(" ")[0]),
          review: parseInt(review.split(" ")[0]),
          comment: comment,
          images: images
        })
        await detail.save()
      })
    })
  } catch (error) {
    console.error(error)
  }
}

router.get('/', wrapAsync(async(req, res, next) => {
  await getDetail(url + '/Attraction_Review-g298082-d11963063-Reviews-Bay_Mau_Coconut_Forest-Hoi_An_Quang_Nam_Province.html')
}))

const getImages = async(html) => {

  const listImages = []
  const $ = cheerio.load(html)
    $('.albumGridItem').map(async(i, el) => {
      const src = $(el).find('.fillSquare').find('img').attr('src')
      listImages.push(src)
    })
    return listImages
}
module.exports = router