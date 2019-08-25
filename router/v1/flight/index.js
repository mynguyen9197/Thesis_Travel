const express = require('express')
const unirest = require('unirest')
const router = express.Router()

const { wrapAsync } = require(global.appRoot + '/utils')

const server = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/"
const broweQuotes = "browsequotes/v1.0/"
const host = "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com"
const key = "54212140bemsh8317ce05033068ep1b52b7jsn410e1fec9060"
const content_type = "application/x-www-form-urlencoded"

function getSession(){
    return new Promise((resolve, reject) => {
        unirest.post(server + "pricing/v1.0")
                .headers({ "X-RapidAPI-Host": host, "X-RapidAPI-Key": key, "Content-Type": content_type })
                .send("inboundDate=2019-09-10")
                .send("cabinClass=premiumeconomy")
                .send("children=0")
                .send("infants=0")
                .send("country=VN")
                .send("currency=VND")
                .send("locale=vi-VN")
                .send("originPlace=SGN-sky")
                .send("destinationPlace=DAD-sky")
                .send("outboundDate=2019-09-01")
                .send("adults=1")
                .end(function (result) {
                    return resolve(result.headers.location)
                });
    })
}

router.post('/getSessionResult', wrapAsync(async(req, res, next) => {
    getSession().then((result) => {
        const sessionKey = result.split("/").pop();
        unirest.get(server + "pricing/uk2/v1.0/" + sessionKey + "?pageIndex=0&pageSize=10")
        .headers({ "X-RapidAPI-Host": host, "X-RapidAPI-Key": key })
        .end(function (resp) {
            res.status(resp.status).send(resp.body)
        })
    })
}))

router.get('/', wrapAsync(async(req, res, next) => {
    res.status(200).send('Flight')
}))

router.get('/cheapest', wrapAsync(async(req, res, next) => {
    unirest.get(server + broweQuotes + "VN/VND/vi-VN/SGN-sky/DAD-sky/2019-09-01?inboundpartialdate=2019-12-01")
            .headers({ "X-RapidAPI-Host": host, "X-RapidAPI-Key": key })
            .end(function (result) {
                res.status(result.status).send(result.body)
        });
}))

module.exports = router