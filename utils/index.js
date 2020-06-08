const express = require('express')
const jwt = require('jsonwebtoken')

const backend_server = 'https://hoian-travel.herokuapp.com'
const gui_server = 'https://hoiantravel-8e5d1.web.app'
const backend_local = 'http://localhost:5000'
const gui_local = 'http://localhost:4200'

const verifyToken = ((req, res, next) => {
    const bearerHeader = req.headers['authorization']
    if(bearerHeader){
        const token = bearerHeader.split(' ')[1]
        if(token){
            req.token = token
            const decoded = jwt.verify(token, 'RESTFULAPIs')
            if(decoded){
                next()
                return
            }
        }
    } 
    return res.status(403).send("Do not have permission")
}) 

const verifyAdminToken = ((req, res, next) => {
    const bearerHeader = req.headers['authorization']
    if(bearerHeader){
        const token = bearerHeader.split(' ')[1]
        if(token){
            req.token = token
            const decoded = jwt.verify(token, 'RESTFULAPIs')
            if(decoded && decoded.role == 1){
                next()
                return
            }
        }
    } 
    return res.status(403).send("Do not have role admin")
}) 

function getImageUrlAsObject(request_url, img){
    let image = img
    if (!image.address.startsWith('http')){
        image.address = request_url + '/' + image.address
    }
    return image
}

function getAvatarUrlAsObject(request_url, img){
    let obj = img
    if (!obj.avatar.startsWith('http')){
        obj.avatar = request_url + '/' + obj.avatar
    }
    return obj
}

function getImageUrlAsLink(request_url, address){
    if (address && address != "undefined" && !address.startsWith('http')){
        address = request_url + '/' + address
    }
    return address
}

async function getGuiUrl(request_url){
    if (request_url.startsWith(backend_local)){
        return gui_local
    } else if(request_url.startsWith(backend_server)){
        return gui_server
    }
}

module.exports = {
    wrapAsync: fn => (req, res, next) => fn(req, res, next).catch(next),
    verifyToken, verifyAdminToken, getImageUrlAsObject, getImageUrlAsLink, getAvatarUrlAsObject,
    getGuiUrl
}