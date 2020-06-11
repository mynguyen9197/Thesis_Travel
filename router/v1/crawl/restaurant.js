const express = require('express')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')

const router = express.Router()

const { wrapAsync } = require(global.appRoot + '/utils')
const Restaurant = require(global.appRoot + '/models/restaurant')
const { getLinksPage, getLinksPerPage } = require('./utils')

const getDetail = async (url) => {
    try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(url + '#photos;aggregationId=&albumid=101&filter=7').then(async() => {
            page.content().then(async(content) =>{
                const $ = cheerio.load(content)  
                const name = $('.h1').text().replace(/'/g, "`")
                const existedRest = await Restaurant.findRestaurantByName(name)
                if(existedRest.length > 0) {
                  console.log(name + ' restaurant already exists')
                  return
                }
                let rating = $('.ratingContainer').find('span').first().attr('alt')
                if(rating){
                    rating = rating.split(" ")[0]
                }
                let reviewCount = $('.reviewCount').text()
                if(reviewCount){
                    reviewCount = reviewCount.split(" ")[0]
                }
                const ranking = $('.popIndexContainer').text()
                const type = $('.popIndexContainer').find('a').text().split(' in')[0]
                let kindList = []
                if(type){
                  kindList.push(type)
                }
                $('.header_links').find('a').map((i, el) => {
                    kindList.push($(el).text())
                })
                const address = $('.address').text()
                const phone = $('.phone').text()
                let open_hour = $('.clock').next().text()
                open_hour = open_hour ? open_hour.split('Open Now:')[1] : ''

                const images_html = $('.photoGridBox').html()
                let images = []
                if(images_html != null){
                    images = await getImages(images_html)
                }
                let more_rating = []
                $('.restaurants-detail-overview-cards-RatingsOverviewCard__ratingQuestionRow--5nPGK').map((i, el) => {
                  const rating_cls = $(el).find('span').eq(2).find('span').attr('class')
                  if(rating_cls){
                    more_rating.push(parseFloat(rating_cls.split('_')[3])/10)
                  }
                })

                const about = $('.restaurants-details-card-DesktopView__desktopAboutText--1VvQH').text().replace(/'/g, "`")

                let title_class = null, detail_class = null
                if($('.restaurants-detail-overview-cards-DetailsSectionOverviewCard__categoryTitle--2RJP_').length > 0){
                  title_class = '.restaurants-detail-overview-cards-DetailsSectionOverviewCard__categoryTitle--2RJP_'
                  detail_class = '.restaurants-detail-overview-cards-DetailsSectionOverviewCard__tagText--1OH6h'
                } else {
                  title_class = '.restaurants-details-card-TagCategories__categoryTitle--28rB6'
                  detail_class = '.restaurants-details-card-TagCategories__tagText--Yt3iG'
                }

                let details = [], titles = []
                $(title_class).map((i, el) =>{
                  if(el){
                    titles.push($(el).text())
                  }
                })
                $(detail_class).map((i, el) =>{
                  if(el){
                    details.push($(el).text())
                  }
                })

                const info = await getDetails(titles, details)
                
                const review_html = $('.choices').html()
                const user_review = await getDetailReview(review_html)

                const comment_html = $('.listContainer').html()
                const comments = await getComments(comment_html)
                
                const features = info.features
                const meals = info.meals
                const price = info.price
                const restaurant = {
                  name, thumbnail: images ? images[0] : null,
                  common_rating: rating.replace(',', ''), open_hour,
                  common_review: user_review, review_count: reviewCount.replace(',', ''),
                  ranking, address, phone, rating_detail: more_rating.join(";"),
                  from: price ? price.from : '', to: price ? price.to : '' , about, kind: kindList.join(', '), meals: meals ? meals.join(', ') : '', features: features ? features.join(', ') : ''
                }
                
                if(info.diets){
                  info.diets.map(x => {
                    kindList.push(x)
                  })
                  kindList = kindList.filter(onlyUnique)
                }

                //saving zone
                const savedRest = await Restaurant.insertRestaurant(restaurant)
                
                for(let i=0; i<comments.length;i++){
                  if(comments[i] != null){
                    await Restaurant.insertComment(comments[i], savedRest.insertId, Math.floor(Math.random() * 10) + 1)
                  }
                }

                for(let i=0; i<images.length;i++){
                  if(images[i] != null){
                    await Restaurant.insertImage(images[i], savedRest.insertId)
                  }
                }

                for(let i=0;i<cuisines.length;i++){
                  const cuisine = await Restaurant.findCuisineByName(cuisines[i])
                  if(cuisine[0]){
                    await Restaurant.insertCuisineRestaurant(cuisine[0].id, savedRest.insertId)
                  }else{
                    const savedCuisine = await Restaurant.insertCuisine(cuisines[i])
                    await Restaurant.insertCuisineRestaurant(savedCuisine.insertId, savedRest.insertId)
                  }
                }
                
                for(let i=0;i<kindList.length;i++){
                  const kind = await Restaurant.findFoodTypeByName(kindList[i])
                  if(kind[0]){
                    await Restaurant.insertFoodTypeRestaurant(kind[0].id, savedRest.insertId)
                  }
                }
                
                if(meals){
                  for(let i=0;i<meals.length;i++){
                    const meal = await Restaurant.findMealByName(meals[i])
                    if(meal[0]){
                      await Restaurant.insertMealRestaurant(meal[0].id, savedRest.insertId)
                    }
                  }
                }
                
                if(features){
                  for(let i=0;i<features.length;i++){
                    const feature = await Restaurant.findRestFeatureByName(features[i])
                    if(feature[0]){
                      await Restaurant.insertFeatureRestaurant(feature[0].id, savedRest.insertId)
                    }
                  }
                }
            })
        })
    } catch (error) {
        
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
    return listImages.filter(img => typeof img !== 'undefined')
}

const getDetailReview = async(html) => {
  const review_detail = []
  const $ = cheerio.load(html) 
  $('.row_num ').map((i, el) => {
      const val =$(el).text()
      if(!isNaN(val) && val != ''){
        review_detail.push(val)
      }
  })
  return review_detail.join(';')
}

const getComments = async(html) => {
  const comments = []
  const $ = cheerio.load(html) 
  $('.is-9').map((i, el) => {
      const review = parseFloat($(el).find('span').first().attr('class').split('_')[3])/10
      const date = $(el).find('.ratingDate').attr('title')
      const quote = $(el).find('.quote').text()
      const content = $(el).find('.partial_entry').text()
      const comment = {
        review: review, date: new Date(date).toISOString().split('T')[0], quote: quote.replace(/[^a-zA-Z0-9 ]/g,"").replace(/'/g, "`"), content: content.replace(/[^a-zA-Z0-9 ]/g,"").replace(/'/g, "`")
      }
      comments.push(comment)
  })
  return comments
}

const getDetails = async(titles, details) => {
  let price = cuisines = diets = meals = features = null
  for(let i=0;i<titles.length;i++){
    switch (titles[i]) {
      case 'CUISINES':
        cuisines = details[i].split(', ')
        break;
      case 'Meals':
        meals = details[i].split(', ')
        break;
      case 'Special Diets':
        diets = details[i].split(', ')
        break;
      case 'FEATURES':
        features = details[i].split(', ')
        break;
      case 'PRICE RANGE':
        price = {
          from: details[i].split(' - ')[0],
          to: details[i].split(' - ')[1]
        }
        break;
      default:
        break;
    }
  }
  return {
    price, cuisines, diets, meals, features
  }
}

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

router.post('/saveDetail', wrapAsync(async(req, res, next) => {
  const { link } = req.body
  const list = [
    "https://www.tripadvisor.com//Restaurant_Review-g298082-d4100845-Reviews-Kumquat_BBQ_Restaurant-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d2645497-Reviews-Hi_Restaurant-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d9855125-Reviews-Green_Heaven_Restaurant_Bar-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d8814820-Reviews-The_Hoian_Sincerity_Restaurant-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d2180297-Reviews-Lantern_Town_Restaurant-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d2409908-Reviews-Micasa_Restaurant-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d10331100-Reviews-Mamma_s_Gourmet_Cooking_Class_Fine_Dining_in_Authentic_Garden_Restaurant-Hoi_An_.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d13166606-Reviews-Old_Town_Bar_and_Bistro-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d13083898-Reviews-Golden_Nut_Hoi_An_Restaurant-Hoi_An_Quang_Nam_Province.html",
        "https://www.tripadvisor.com//Restaurant_Review-g298082-d1891091-Reviews-Bao_Han-Hoi_An_Quang_Nam_Province.html",
  ]
  for(let i=0; i<list.length; i++){
    await getDetail(list[i])
  }
}))

router.get('/getpages/:url', wrapAsync(async(req, res, next) => {
  const pageLinks = await getLinksPage(req.params.url)
  let activityLinks = []
  for(let i=0; i<pageLinks.length;i++){
    const activityLink = await getLinksPerPage(pageLinks[i], '.restaurants-list-ListCell__cellContainer--2mpJS')
    activityLinks = activityLinks.concat(activityLink)
  }
  res.status(200).send({activityLinks: activityLinks, count:activityLinks.length})
}))

router.get('/distribute', wrapAsync(async(req, res, next) => {
  try{
    const allRes = await Restaurant.loadAllFeaturesOfRes()
    for(let i=0;i<allRes.length;i++){
      const kinds = allRes[i].kind ? allRes[i].kind.split(', ') : []
      if(kinds.includes("$$ - $$$")){
        // console.log({kind: allRes[i].id})
        // await Restaurant.insertFoodTypeRestaurant(11, allRes[i].id)
      }
      else if(kinds.includes("$")){
        // console.log({kind: allRes[i].id})
        // await Restaurant.insertFoodTypeRestaurant(12, allRes[i].id)
      }
      else console.log({kind: allRes[i].id})
    }
    return res.status(200).json(allRes)
  }catch(error){
    console.log(error)
  }
}))
  
module.exports = router