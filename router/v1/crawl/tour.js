const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()

const tour = require(global.appRoot + '/models/tour')
const { wrapAsync } = require(global.appRoot + '/utils')

const getDetail = async (url, type) => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url).then(async() => {
      page.content().then(async(content) =>{
        let $ = cheerio.load(content)
        const name = $('.h1').text()
        let listTours = await tour.findTourByName(name)
        listTours = listTours.map(x => x.id)
        let indexTour = 0
        if(listTours.length === 0){
          const supporter_name = $('.attractions-product-info-SupplierLink__linkBlock--2iDNq').find('a').text().replace(/'/g, "`").split("By: ")[1]
          let rating = $('.ui_poi_review_rating  ').length
          rating = parseFloat(rating[rating.length - 1])/10
          const review = $('.ui_poi_review_rating  ').find('a').text().split(' ')[0]
          const price = parseFloat($('.attractions-northstar-tour-planner-desktop-Header__mainPrice--1P3Ou').text().substring(1).replace(/,/g, ""))
          const overview = $('._2zqaS_NY').first().text().trim().replace(/'/g, "`")
          const listImg = []
          $('.media-media-carousel-MediaCarousel__carouselImage--SYdol').map((i, ele) => {
            listImg.push($(ele).find('img').attr('src'))
          })
          
          const listInfo = []
          $('._3Ilov_MC').map((i, el) => {
            listInfo.push($(el).html())
          })
          
          let tabs = []
          $('.tab-bars-tab-button-tab-button__tab--3I-DQ').map((i, el) => {
            const x =$(el).find('a').text()
            tabs.push(x)
          })
          
          const listKey = []
          let duration = ''
          $('.list').find('li').map((i, el) => {
            const key = $(el).text()
            if(key.includes('Duration')){
              duration = key.replace(/\n/g, '').trim().split(': ')[1]
            } else {
              listKey.push(key.replace(/\n/g, '').trim())
            }
          })
          
          const listAdvantage = []
          $('._1lrXOhKj').find('li').map((i, el) => {
            listAdvantage.push($(el).text())
          })

          const reviewdt = $('[data-test-target="reviews-tab"]').find  ('.location-review-review-list-parts-ReviewFilters__filters_wrap--y1t86').find('.ui_columns ').html()
          const review_detail = await getDetailReview(reviewdt)
          
          const comments = await getReviews($('[data-test-target="reviews-tab"]').html())
          
          let highlight, wtd, important_info, additional, cancel_policy, tourInfo=''
          if(tabs.includes('Highlights')){
            if(tabs[1] == 'Highlights'){
              console.log('clu1')
              highlight = await getHighLight(listInfo[0])
              wtd = await getWhatToDo(listInfo[1])
            } else {
              console.log('clu2')
              wtd = await getWhatToDo(listInfo[0])
              highlight = await getHighLight(listInfo[1])
            }
            important_info = await getImportantInfo(listInfo[2])
            additional = await getAdditional(listInfo[3])
            cancel_policy = await getCancelPolicy(listInfo[4])
            tourInfo = { 
              name, rating, review, price, overview, highlight: highlight.join("\n").replace(/'/g, "`"),
              wtd, important_info, additional: additional.join("\n").replace(/'/g, "`"), cancel_policy, key_detail: listKey.join("\n").replace(/'/g, "`"), advantage: listAdvantage.join("\n").replace(/'/g, "`"), thumbnail: listImg[0], duration, review_detail
            }
          } else {
            console.log('not invl')
            wtd = await getWhatToDo(listInfo[0])
            important_info = await getImportantInfo(listInfo[1])
            additional = await getAdditional(listInfo[2])
            cancel_policy = await getCancelPolicy(listInfo[3])
            
            tourInfo = { 
              name, rating, review, price, overview, highlight: '',
              wtd, important_info, additional: additional.join("\n").replace(/'/g, "`"), cancel_policy, key_detail: listKey.join("\n").replace(/'/g, "`"), advantage: listAdvantage.join("\n").replace(/'/g, "`"), thumbnail: listImg[0], duration, review_detail
            }
          }
          console.log(tourInfo)
          let listTourisms = await tour.findTourismByName(supporter_name)
          listTourisms = listTourisms.map(x => x.id)
          let index = 0
          if(listTourisms.length === 0){
            const savedTourism = await tour.insertTourism(supporter_name)
            index = savedTourism.insertId
          }else{
            index = listTourisms[0]
          }
          console.log(index)
          const savedTour = await tour.insertTour(tourInfo, index)
          indexTour = savedTour.insertId
          for(let i=0; i<listImg.length;i++){
            if(listImg[i] != null){
              await tour.insertImage(listImg[i], savedTour.insertId)
            }
          }
          for(let i=0; i<comments.length;i++){
            if(comments[i] != null){
              await tour.insertComment(comments[i], savedTour.insertId, null)
            }
          }
        }else{
          indexTour = listTours[0]
        }
        await tour.insertActivityTour(indexTour, type)
      })
    })
  } catch (error) {
    console.error(error)
  }
}

const getHighLight = async(html) => {
    const listHighLigh = []
    const $ = cheerio.load(html)
    $('ul._3uXYG-u5').find('li').map((i, el) => {
        listHighLigh.push($(el).text())
    })
    return listHighLigh
}

const getAdditional = async(html) => {
    const listAddition = []
    const $ = cheerio.load(html)
    $('._3uXYG-u5').find('ul').map((i, el) => {
        $(el).find('li').map((j, ele) => {
            listAddition.push($(ele).text())
        })
    })
    return listAddition
}

const getCancelPolicy = async(html) => {
    const $ = cheerio.load(html)
    return $(html).text()
}

const getWhatToDo = async(html) => {
    const $ = cheerio.load(html)
    return $(html).find('._1Thqkz6p').html()
}

const getImportantInfo = async(html) => {
    const $ = cheerio.load(html)
    return $(html).find('._1Thqkz6p').html()
}

const getDetailReview = async(html) => {
  const review_detail = []
  const $ = cheerio.load(html) 
  $('li').find('span').map((i, el) => {
      const val =$(el).text()
      if(!isNaN(val) && val != ''){
        review_detail.push(val)
      }
  })
  return review_detail.join(';')
}

const getReviews = async(html) => {  
  const $ = cheerio.load(html) 
  const review_comment = []
  $('.location-review-review-list-parts-SingleReview__mainCol--1hApa').map((i, el) => {
    const quote = $(el).find('a').text()
    const review_text = $(el).find('span').text()
    const commet = {
      quote: quote.replace(/'/g, "`"),
      content: review_text.replace(/'/g, "`")
    }
    review_comment.push(commet)
  })
  return review_comment
}

router.post('/saveDetail', wrapAsync(async(req, res, next) => {
  const { link, type } = req.body
  await getDetail(link, type).then(() => {
    return res.status(200).send("")
  })
}))

module.exports = router