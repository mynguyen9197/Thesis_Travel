const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require(global.appRoot + '/models/user')

const { wrapAsync } = require(global.appRoot + '/utils')
router.post('/signin', wrapAsync(async(req, res, next) => {
    const {user} = req.body;
    if(user && Object.keys(user).length){
        const new_user = {
            username: user.username,
            password: bcrypt.hashSync(user.password, 10)
        }
        const savedUser = await User.insertUser(new_user)
        return res.status(200).json({id: savedUser.insertId})
    }
    return res.status(400).json("User does not exist")
}))

router.post('/login', wrapAsync(async(req, res, next) => {
    const {user} = req.body;
    if(user && Object.keys(user).length){
        const savedUser = await User.findByUsername(user)
        if(savedUser.length){
            const match = await bcrypt.compare(user.password, savedUser[0].password)
            if(!match){
                return res.status(401).send("Wrong password")
            } else {
                const token = jwt.sign({ id: savedUser[0].id }, 'RESTFULAPIs')
                return res.status(200).json({token: token})
            }
        } else {
            return res.status(401).send("Wrong username")
        }
    }
    return res.status(400).json("User does not exist")
}))

module.exports = router