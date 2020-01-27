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
        const name = $('.IKwHbf8J').text()
        let existedTour = await tour.findTourByActivityName(name, type)
        if(existedTour.length > 0){
          console.log(name + ' already existed')
          return
        }
        let listTours = await tour.findTourByName(name)
        listTours = listTours.map(x => x.id)
        let indexTour = 0
        if(listTours.length === 0){
          const supporter_name = $('._3Wn58Cpp').text()
          let rating = $('.ui_poi_review_rating  ').length ? $('.ui_poi_review_rating  ').find('span').attr('class').split('_') : null
          rating = rating ? parseFloat(rating[rating.length - 1])/10 : 0
          const review = $('._82HNRypW').length ? $('._82HNRypW').text().split(' ')[0] : 0
          const price = parseFloat($('.attractions-northstar-tour-planner-desktop-Header__mainPrice--1P3Ou').text().substring(1).replace(/,/g, ""))
          const overview = $("div[data-tab='TABS_OVERVIEW']").text()
          const listImg = []
          $('.media-media-carousel-MediaCarousel__carouselImage--SYdol').map((i, ele) => {
            listImg.push($(ele).find('img').attr('src'))
          })
          
          const listInfo = []
          $('._3Ilov_MC').map((i, el) => {
            listInfo.push($(el).html())
          })
          
          let tabs = []
          $('._2H8zQEmE').find('.XIJ2_uUh').map((i, el) => {
            const x =$(el).text()
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
          
          const reviewhtml = $('[data-test-target="reviews-tab"]').length ? $('[data-test-target="reviews-tab"]').html() : null
          const reviewdt = reviewhtml ? $('[data-test-target="reviews-tab"]').find('.location-review-review-list-parts-ReviewFilters__filters_wrap--y1t86').find('.ui_columns ').html() : null
          const review_detail = reviewdt ? await getDetailReview(reviewdt) : ''
          
          const comments = reviewhtml ? await getReviews($('[data-test-target="reviews-tab"]').html()) : ''
          
          let highlight, wtd, important_info, additional, cancel_policy, tourInfo=''
          if(tabs.includes('Highlights')){
            if(tabs[1] == 'Highlights'){
              highlight = await getHighLight(listInfo[0])
              wtd = await getWhatToDo(listInfo[1])
            } else {
              wtd = await getWhatToDo(listInfo[0])
              highlight = await getHighLight(listInfo[1])
            }
            important_info = await getImportantInfo(listInfo[2])
            additional = await getAdditional(listInfo[3])
            cancel_policy = await getCancelPolicy(listInfo[4])
            tourInfo = { 
              name, rating, review, price, overview: overview.replace(/'/g, "`"), highlight: highlight.join("\n").replace(/'/g, "`"),
              wtd: wtd.replace(/'/g, "`"), important_info: important_info.replace(/'/g, "`"), additional: additional.join("\n").replace(/'/g, "`"), cancel_policy, key_detail: listKey.join("\n").replace(/'/g, "`"), advantage: listAdvantage.join("\n").replace(/'/g, "`"), thumbnail: listImg[0], duration, review_detail
            }
          } else {
            wtd = await getWhatToDo(listInfo[0])
            important_info = await getImportantInfo(listInfo[1])
            additional = await getAdditional(listInfo[2])
            cancel_policy = await getCancelPolicy(listInfo[3])
            
            tourInfo = { 
              name, rating, review, price, overview: overview.replace(/'/g, "`"), highlight: '',
              wtd: wtd.replace(/'/g, "`"), important_info: important_info.replace(/'/g, "`"), additional: additional.join("\n").replace(/'/g, "`"), cancel_policy, key_detail: listKey.join("\n").replace(/'/g, "`"), advantage: listAdvantage.join("\n").replace(/'/g, "`"), thumbnail: listImg[0], duration, review_detail
            }
          }
          
          /* save zone*/
          let listTourisms = await tour.findTourismByName(supporter_name)
          listTourisms = listTourisms.map(x => x.id)
          let index = 0
          if(listTourisms.length === 0){
            const savedTourism = await tour.insertTourism(supporter_name)
            index = savedTourism.insertId
          }else{
            index = listTourisms[0]
          }

          const savedTour = await tour.insertTour(tourInfo, index)
          indexTour = savedTour.insertId

          for(let i=0; i<listImg.length;i++){
            if(listImg[i] != null){
              await tour.insertImage(listImg[i], savedTour.insertId)
            }
          }
          for(let i=0; i<comments.length;i++){
            if(comments[i] != null){
              await tour.insertComment(comments[i], savedTour.insertId, Math.floor(Math.random() * 10) + 1)
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
    const review = parseFloat($(el).find('span').first().attr('class').split('_')[3])/10
    const quote = $(el).find('a').text()
    const review_text = $(el).find('q').find('span').text()
    const commet = {
      quote: quote.replace(/[^a-zA-Z0-9 ]/g,"").replace(/'/g, "`"),
      content: review_text.replace(/[^a-zA-Z0-9 ]/g,"").replace(/'/g, "`"),
      review, date: new Date().toISOString().split('T')[0]
    }
    review_comment.push(commet)
  })
  return review_comment
}

router.post('/saveDetail', wrapAsync(async(req, res, next) => {
  const { type } = req.body
  const list = [
    "https://www.tripadvisor.com//AttractionProductReview-g298082-d13822775-Lantern_Making_Class-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//AttractionProductReview-g298082-d19057625-Lantern_Making_and_Cooking_Class_Market_Lantern_Cooking_Class_Foot_massage-Hoi_An_.html",
        "https://www.tripadvisor.com//AttractionProductReview-g298082-d17564319-Cooking_with_Jolie_in_Hoi_An_and_Lantern_making_class_JHA4-Hoi_An_Quang_Nam_Provin.html",
        "https://www.tripadvisor.com//AttractionProductReview-g298082-d19099375-Traditional_Painting_Class-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//AttractionProductReview-g298082-d11469518-Half_Day_Heritage_Painting_Tour_from_Hoi_An_City-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//AttractionProductReview-g298082-d19621598-DEP_CHI_U_The_Hoi_An_Traditional_Footstep_Straw_Flip_Flops_Made_By_You-Hoi_An_Quan.html"
  ]
  for(let i=0; i<list.length; i++){
    await getDetail(list[i], type)
    console.log(i+1)
  }
}))

module.exports = router