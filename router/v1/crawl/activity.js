const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()

const activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

const url = 'https://www.tripadvisor.com/'
const getLinksPage = async (url_category) => {
  try {
    const listPage = []
    const response = await axios.get(url + url_category + '.html')
    let $ = cheerio.load(response.data)
    const pages = $('.pageNumbers').html()
    listPage.push(url + url_category + '.html')
    if(pages != null){
      $ = cheerio.load(pages)
      $('a').map((i, el) => {
        const url_detail = $(el).attr('href')
        listPage.push(url + url_detail.replace(/\n/g, ''))
      })
    }
    return listPage
  } catch (error) {
    console.error(error)
  }
}

const getActivityLinks = async (url_hoian) => {
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
      quote: quote.replace(/'/g, "`"),
      content: review_text.replace(/'/g, "`")
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
        const aboutList = allAbout.split("Open Now")
        let open_hour = "", duration=""
        if(aboutList.length == 2){
          const more = aboutList[1].split("See all hours")
          open_hour = more[0]
          duration = more.length == 2 ? more[1] : ""
        }
        const about = aboutList[0]

        let comment = {}
        let images = {}
        
        const kind_of_place = $('.attractionCategories').text().split(" More")[0].split(", ")
        
        const detail = {
          name: name,
          thumbnail: thumbnail,
          rating: parseFloat(rating.split(" ")[0].replace(",", ".")),
          review: parseInt(review.split(" ")[0]),
          ranking: ranking, 
          about: about,
          open_hour: open_hour,
          duration: duration
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
        
        const review_detail_html = $('.collapsibleContent').html()
        let review_detail = []
        $ = cheerio.load(review_detail_html)
        $('.row_num').map((i, el) => {
          review_detail.push($(el).text())
        })
        await activity.insertReview(review_detail.join(';'), savedActivity.insertId)

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

router.get('/getpages/:url', wrapAsync(async(req, res, next) => {
  const pageLinks = await getLinksPage(req.params.url)
  let activityLinks = []
  for(let i=0; i<pageLinks.length;i++){
    const activityLink = await getActivityLinks(pageLinks[i])
    activityLinks = activityLinks.concat(activityLink)
  }
  res.status(200).send({activityLinks: activityLinks, count:activityLinks.length})
}))

router.post('/saveDetail', wrapAsync(async(req, res, next) => {
  const { link } = req.body
  await getDetail(link).then(() => {
    res.status(200).send("")
  })
}))

module.exports = router