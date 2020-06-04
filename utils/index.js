const express = require('express')
const jwt = require('jsonwebtoken')

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
    if (!address.startsWith('http')){
        address = request_url + '/' + address
    }
    return address
}

module.exports = {
    wrapAsync: fn => (req, res, next) => fn(req, res, next).catch(next),
    verifyToken, verifyAdminToken, getImageUrlAsObject, getImageUrlAsLink, getAvatarUrlAsObject
}