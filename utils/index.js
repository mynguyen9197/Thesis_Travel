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

module.exports = {
    wrapAsync: fn => (req, res, next) => fn(req, res, next).catch(next),
    verifyToken, verifyAdminToken
}