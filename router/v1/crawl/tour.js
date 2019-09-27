const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')

const router = express.Router()

const activity = require(global.appRoot + '/models/activity')
const { wrapAsync } = require(global.appRoot + '/utils')

const url = 'https://www.tripadvisor.com/'
const getDetail = async (url) => {
    
}

module.exports = router