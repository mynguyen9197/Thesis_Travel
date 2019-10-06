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
          const rating = null
          const review = null
          
          const price = parseFloat($('.attractions-northstar-tour-planner-desktop-Header__mainPrice--1P3Ou').text().substring(1).replace(/,/g, ""))
          const overview = $('.attractions-product-details-Overview__primaryHeader--1n8Ql').next().text().replace(/'/g, "`")
  
          const listImg = []
          $('.media-media-carousel-MediaCarousel__carouselImage--SYdol').map((i, ele) => {
            listImg.push($(ele).find('img').attr('src'))
          })
  
          const listInfo = []
          $('.attractions-card-CollapsibleCard__content--2Ws8q').map((i, el) => {
              listInfo.push($(el).html())
          })
          /* const highlight = await getHighLight(listInfo[0])
          const wtd = await getWhatToDo(listInfo[1])
          const wtd = await getWhatToDo(listInfo[0])
          const highlight = await getHighLight(listInfo[1])
          const important_info = await getImportantInfo(listInfo[2])
          const additional = await getAdditional(listInfo[3])
          const cancel_policy = await getCancelPolicy(listInfo[4]) */
          
          const listKey = []
          $('.list').find('li').map((i, el) => {
              listKey.push($(el).text().replace(/\n/g, '').trim())
          })
          
          const listAdvantage = []
          const advance = $('.attractions-booking-confidence-BookingConfidence__confidenceList--1bRsj').find('li').map((i, el) => {
              listAdvantage.push($(el).text())
          })
  
          const wtd = await getWhatToDo(listInfo[0])
          const important_info = await getImportantInfo(listInfo[1])
          const additional = await getAdditional(listInfo[2])
          const cancel_policy = await getCancelPolicy(listInfo[3])
          const tourInfo = { 
            name, rating, review, price, overview, highlight: '',
            wtd, important_info, additional: additional.join("\n").replace(/'/g, "`"), cancel_policy, key_detail: listKey.join("\n").replace(/'/g, "`"), advantage: listAdvantage.join("\n").replace(/'/g, "`"), thumbnail: listImg[0]
          }
          /* const tourInfo = { 
              name, rating, review, price, overview, highlight: highlight.join("\n").replace(/'/g, "`"),
              wtd, important_info, additional: additional.join("\n").replace(/'/g, "`"), cancel_policy, key_detail: listKey.join("\n").replace(/'/g, "`"), advantage: listAdvantage.join("\n").replace(/'/g, "`"), thumbnail: listImg[0]
          } */
          
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
        }else{
          indexTour = listTours[0]
        }
        await tour.insertTourKind(indexTour, type)
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