
const cheerio = require('cheerio')
const axios = require('axios')

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

const getLinksPerPage = async (url_hoian, clas) => {
  try {
    const listUrl = []
    const response = await axios.get(url_hoian)
    const $ = cheerio.load(response.data)
    $(clas).map((i, el) => {
        const url_detail = $(el).find('a').attr('href')
        listUrl.push(url + url_detail.replace(/\n/g, ''))
    })
    return listUrl
  } catch (error) {
    console.error(error)
  }
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

module.exports = {
    getLinksPerPage, 
    getLinksPage,
    getReviews,
    getDetailReview
}