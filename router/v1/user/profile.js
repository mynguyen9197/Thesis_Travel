const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const bcrypt = require('bcrypt')

const User = require(global.appRoot + '/models/user')
const { wrapAsync, verifyToken } = require(global.appRoot + '/utils')

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
        const path = req.file.path
        await User.updateAvatar(path.substr(0, 11) + '\\' + path.substr(11), decoded.id)
        return res.status(200).send('upload avatar completed')
    } catch (error) {
        console.log(error)
        return res.status(500).json("There was something wrong")
    }
}))

router.put('/update-profile', wrapAsync(async(req, res, next) =>{
    try {
        const { name, prepass, password } = req.body
        const decoded = jwt.verify(req.token, 'RESTFULAPIs')
        const savedUser = await User.findById(decoded.id)
        if(savedUser.length){
            const match = await bcrypt.compare(prepass, savedUser[0].password)
            if(!match){
                return res.status(401).send("Wrong password!")
            }
            const user = {
                id: decoded.id,
                name: name,
                password: bcrypt.hashSync(password, 10)
            }
            await User.updateProfile(user)
            return res.status(200).send('update user completed')
        } else {
            return res.status(401).send("User does not exist!")
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json("There was something wrong")
    }
}))

module.exports = router