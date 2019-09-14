const express = require('express')
const cheerio = require('cheerio')
const request = require('request')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()

const Activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

const url = 'https://www.tripadvisor.com.vn'

const getWebsiteContent = async (url_hoian) => {
  try {
    const listUrl = []
    const response = await axios.get(url_hoian)
    const $ = cheerio.load(response.data)
    $('.attraction_element').map((i, el) => {
        const url_detail = $(el).find('a').attr('href')
        listUrl.push(url + url_detail.replace(/\n/g, ''))
    })
    return listUrl
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

const getDetail = async (url, type) => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url + '#photos;aggregationId=&albumid=101&filter=7').then(async() => {
      page.content().then(async(content) =>{
        const $ = cheerio.load(content)
        const name = $('#HEADING').text()
        const thumbnail = $('.attractions_large').find('img').attr('src')
        const rating = $('.ratingContainer').find('span').attr('alt')
        const review = $('.ratingContainer').text()
        const ranking = $('.popIndexContainer').text()
        const address = $('.attractionsBLInfo').find('.detail ').text()
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
          thumbnail: thumbnail,
          rating: parseFloat(rating.split(" ")[0].replace(",", ".")),
          review: parseInt(review.split(" ")[0]),
          comment: comment,
          images: images,
          type: type,
          ranking: ranking,
          address: address
        })
        await detail.save()
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
    const src = $(el).find('.fillSquare').find('img').attr('src')
    listImages.push(src)
  })
  return listImages
}

/*lấy dánh sách các địa điểm theo nhóm*/
router.get('/getActivitiesLists', wrapAsync(async(req, res, next) => {
  const sightSeeing = await getWebsiteContent(url + '/Attractions-g298082-Activities-c47-t163-Hoi_An_Quang_Nam_Province.html')
  const maturalPark = await getWebsiteContent(url + '/Attractions-g298082-Activities-c57-Hoi_An_Quang_Nam_Province.html')
  const shopping = await getWebsiteContent(url + '/Attractions-g298082-Activities-c26-Hoi_An_Quang_Nam_Province.html')
  const scenic = await getWebsiteContent(url + '/Attractions-g298082-Activities-c47-Hoi_An_Quang_Nam_Province.html')
  const history = await getWebsiteContent(url + '/Attractions-g298082-Activities-c47-t17-Hoi_An_Quang_Nam_Province.html')
  const museum = await getWebsiteContent(url + '/Attractions-g298082-Activities-c49-Hoi_An_Quang_Nam_Province.html')
  const religion = await getWebsiteContent(url + '/Attractions-g298082-Activities-c47-t10-Hoi_An_Quang_Nam_Province.html')
  const artroom = await getWebsiteContent(url + '/Attractions-g298082-Activities-c49-t1-Hoi_An_Quang_Nam_Province.html')
  res.status(200).send({
    sightSeeing: sightSeeing,
    maturalPark: maturalPark,
    shopping: shopping,
    scenic: scenic,
    history: history,
    museum: museum,
    religion: religion,
    artroom: artroom
  })
}))

router.post('/saveDetail', wrapAsync(async(req, res, next) => {
  const { link, type } = req.body
  await getDetail(link, type).then(() => {
    res.status(200).send("")
  })
}))

module.exports = router