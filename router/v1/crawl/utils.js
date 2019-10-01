
const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')

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

const getDetailReview = async(html) => {
    const review_detail = []
    const $ = cheerio.load(html) 
    $('.row_num').map((i, el) => {
        review_detail.push($(el).text())
    })
    return review_detail.join(';')
}

module.exports = {
    getActivityLinks, 
    getLinksPage,
    getReviews,
    getDetailReview
}