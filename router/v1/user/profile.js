const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const bcrypt = require('bcrypt')

const User = require(global.appRoot + '/models/user')
const { wrapAsync } = require(global.appRoot + '/utils')

const router = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './user_upload')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()  + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    } else{
        cb(null, flase)
    }
}

const upload = multer({ 
    storage: storage,
    limits : {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

router.post('/upload-avatar', upload.single('avatar'), wrapAsync(async(req, res, next) =>{
    try {
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const path = req.file ? req.file.path : null
        if(path){
            const url_img = path.replace('\\', '/')
            const request_url = req.protocol + '://' + req.get('host')
            await User.updateAvatar(url_img, decoded.id)
            return res.status(200).json(request_url + '/' + url_img)
        }
        return res.status(500).json('No avatar was found')
    } catch (error) {
        console.log(error)
        return res.status(500).json("There was something wrong")
    }
}))

router.put('/update-profile', upload.single('avatar'), wrapAsync(async(req, res, next) =>{
    try {
        const { name } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const savedUser = await User.findById(decoded.id)
        if(savedUser.length){
            const path = req.file ? req.file.path : null
            const user = {
                id: decoded.id,
                name: name,
                avatar: path ? path.replace('\\', '/') : savedUser[0].avatar
            }
            await User.updateProfile(user)
            const request_url = req.protocol + '://' + req.get('host')
            console.log(user)
            return res.status(200).json({name: user.name, avatar: request_url + '/' + user.avatar})
        } else {
            return res.status(401).json("User does not exist!")
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json("There was something wrong")
    }
}))

router.put('/update-password', wrapAsync(async(req, res, next) =>{
    try {
        const { prepass, password } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const savedUser = await User.findById(decoded.id) 
        if(savedUser.length){
            const match = await bcrypt.compare(prepass, savedUser[0].password)
            if(!match){
                return res.status(401).json("Wrong password!")
            }
            const user = {
                id: decoded.id,
                password: bcrypt.hashSync(password, 10)
            }
            await User.updatePassword(user)
            return res.status(200).json('update password completed')
        } else {
            return res.status(401).json("User does not exist!")
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json("There was something wrong")
    }
}))

module.exports = router