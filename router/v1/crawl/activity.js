const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()

const activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')
const { getReviews, getDetailReview } = require('./utils')
const activityLinks = ["https://www.tripadvisor.com//Attraction_Review-g298082-d12594260-Reviews-Escape_IQ_Hoi_An-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19077328-Reviews-Writeyourjourney-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d17535969-Reviews-Sam_Sam_Cloth_Shop-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19466381-Reviews-Art_Food_Culture-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d10085029-Reviews-Pottery_Tour-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19432490-Reviews-ECO_NAIL_SPA-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19513054-Reviews-Dung_Basket_Boat_Trip-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d15327510-Reviews-Phap_Gallery-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19176104-Reviews-LIT_decor-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d17585414-Reviews-Bong_Tailor-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d14096778-Reviews-The_Amazing_Race_Hoi_An-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d17844886-Reviews-Lantern_Shop_Hoa_Mai-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d15214279-Reviews-Local_tour_guide_in_Hoian-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d5122325-Reviews-Hoi_An_Cinema-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d18849206-Reviews-Locked_Hoi_An_Escape_Room-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d8322524-Reviews-Titan_Cyber_Game_Internet_Cafe-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19415295-Reviews-The_Little_GARDEN_Basket_boat_cooking_class-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19683172-Reviews-SAPO_Natural_Handmade_Soap_Hoi_An-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19492963-Reviews-Cherry_Spa-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19445360-Reviews-Miu_Beauty_Salon_Spa-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19346076-Reviews-Emerald_waters_spa-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19274876-Reviews-Triem_Tay_Bamboo_Village_Tours-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d19209809-Reviews-XUA_studio-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d17736986-Reviews-Be_Homies_Tour-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d17735744-Reviews-Mr_Vien_Lam-Hoi_An_Quang_Nam_Province.html","https://www.tripadvisor.com//Attraction_Review-g298082-d14191676-Reviews-Murder_Mystery_Hoi_An-Hoi_An_Quang_Nam_Province.html"]
const getDetail = async (url) => {
  try {
    const browser = await puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.setDefaultTimeout(0)
    await page.goto(url,{waitUntil: 'load',timeout:0}).then(async() => {
      page.content().then(async(content) =>{
        let $ = cheerio.load(content)
      
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
        
        var overview = $('.attractions-attraction-detail-about-card-AttractionDetailAboutCard__section--1_Efg').eq(1).text()
        if(overview == '') {
          overview = $('.attractions-supplier-profile-SupplierDescription__description--lzIK9').first().text()
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
        console.log({rating,review, ranking, kind_of_place, overview,duration, address, phone,review_detail, comments,images})
      })
    })
    //browser.close();
  } catch (error) {
    console.error(error)
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