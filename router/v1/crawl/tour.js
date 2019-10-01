const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()

const tour = require(global.appRoot + '/models/tour')
const { wrapAsync } = require(global.appRoot + '/utils')
const { getReviews, getDetailReview } = require('./utils')

const getDetail = async (url, type) => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url).then(async() => {
      page.content().then(async(content) =>{
        let $ = cheerio.load(content)
        const name = $('.h1').text()
        const supporter_link = $('.attractions-product-info-SupplierLink__linkBlock--2iDNq').find('a').attr('href')
        const supporter_name = $('.attractions-product-info-SupplierLink__linkBlock--2iDNq').find('a').text()
        const rating = parseFloat($('.ui_poi_review_rating').find('span').attr('class').split("_")[3])/10.0
        const review = parseInt($('.ui_poi_review_rating').find('a').text().split(" ")[0])
        
        const price = parseFloat($('.attractions-northstar-tour-planner-desktop-Header__mainPrice--1P3Ou').text().substring(1).replace(/,/g, ""))
        const overview = $('.attractions-product-details-Overview__primaryHeader--1n8Ql').next().text()
        
        const listInfo = []
        $('.attractions-card-CollapsibleCard__content--2Ws8q').map((i, el) => {
            listInfo.push($(el).html())
        })
        const hightlight = await getHighLight(listInfo[0])
        const wtd = await getWhatToDo(listInfo[1])
        const important_info = await getImportantInfo(listInfo[2])
        const additional = await getAdditional(listInfo[3])
        const cancel_policy = await getCancelPolicy(listInfo[4])
        
        const review_detail_html = $('.collapsibleContent').html()
        const review_detail = await getDetailReview(review_detail_html)
        
        const reviews_html = $('.listContainer').html()
        let comment = {}
        await getReviews(reviews_html).then((result) => {
            comment = result
        })
        
        const listKey = []
        $('.list').find('li').map((i, el) => {
            listKey.push($(el).text().replace(/\n/g, '').trim())
        })
        
        const listAdvantage = []
        const advance = $('.attractions-booking-confidence-BookingConfidence__confidenceList--1bRsj').find('li').map((i, el) => {
            listAdvantage.push($(el).text())
        })
        const tour = { 
            name, rating, review, price, overview, hightlight: hightlight.join("\n"),
            wtd, important_info, additional: additional.join("\n"), cancel_policy, review_detail, key_detail: listKey.join("\n"), advantage: listAdvantage.join("\n")
        }
        const savedTour = await tour.insertTour(tour)
      })
    })
  } catch (error) {
    console.error(error)
  }
}

const getHighLight = async(html) => {
    const listHighLigh = []
    const $ = cheerio.load(html)
    $('ul.attractions-apd-root-ProductDetails__columnWrapList--2m35E').find('li').map((i, el) => {
        listHighLigh.push($(el).text())
    })
    return listHighLigh
}

const getAdditional = async(html) => {
    const listAddition = []
    const $ = cheerio.load(html)
    $('div.attractions-apd-root-ProductDetails__columnWrapList--2m35E').find('ul').map((i, el) => {
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
    return $('span').html()
}

const getImportantInfo = async(html) => {
    const $ = cheerio.load(html)
    return $('.ui_columns.is-desktop').html()
}

router.post('/saveDetail', wrapAsync(async(req, res, next) => {
  const { link, type } = req.body
  await getDetail(link, type).then(() => {
    res.status(200).send("")
  })
}))

module.exports = router