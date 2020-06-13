const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
var nodemailer = require('nodemailer')

const User = require(global.appRoot + '/models/user')
const Place = require(global.appRoot + '/models/user_log/place')
const Tour = require(global.appRoot + '/models/user_log/tour')
const Restaurant = require(global.appRoot + '/models/user_log/restaurant')

const { wrapAsync, verifyToken, getImageUrlAsLink, getGuiUrl } = require(global.appRoot + '/utils')
const EMAIL_SECRET = 'VERIFY_EMAIL'

router.post('/signup', wrapAsync(async(req, res, next) => {
    try {
        const {user} = req.body;
        if(user && Object.keys(user).length){
            const checkedUsername = await User.findByUsername(user)
            if(checkedUsername.length){
                return res.status(409).json('This username is already taken')
            }
            const checkedUserEmail = await User.findByEmail(user)
            if(checkedUserEmail.length){
                return res.status(409).json('This email is already taken')
            }
            const new_user = {
                name: user.name,
                username: user.username,
                email: user.email,
                password: bcrypt.hashSync(user.password, 10),
                activate: false
            }
            const savedUser = await User.insertUser(new_user)
            await sendActivationEmail(req.protocol + '://' + req.get('host'), savedUser.insertId, user.email)
            return res.status(200).json({id: savedUser.insertId})
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json("Something went wrong! Please try again")
    }
}))

router.get('/reasend-active-link', wrapAsync(async(req, res, next) => {
    try{
        const { user_id } = req.query
        if(!user_id){
            return res.status(404).json('Cannot find user_id in request')
        }
        const savedUser = await User.findById(user_id)
        if(!savedUser.length){
            return res.status(404).json('User does not exist')
        }
        await sendActivationEmail(req.protocol + '://' + req.get('host'), user_id, savedUser[0].email)
        return res.status(200).json('Link has been sent to your email')
    }catch(error){
        console.log(error)
        return res.status(500).json(error.sqlMessage)
    }
}))

router.get('/confirmation/:token', wrapAsync(async(req, res, next) => {
    try{
        const { id } = jwt.verify(req.params.token, EMAIL_SECRET)
        const isActive = await User.checkActiveAccount(id)
        if(isActive[0].activate){
            return res.status(409).json("Account is already active")
        }
        await User.activeAccount(id)
        return res.status(200).json('update successfully')
    }catch(error){
        console.log(error)
        return res.status(500).json(error.sqlMessage)
    }
}))

router.post('/login', wrapAsync(async(req, res, next) => {
    try {
        const {user} = req.body;
        if(user && Object.keys(user).length){
            const savedUser = await User.findByUsername(user)
            if(savedUser.length){
                const match = await bcrypt.compare(user.password, savedUser[0].password)
                if(!match){
                    return res.status(401).send("Wrong password!")
                } else {
                    if(!savedUser[0].activate){
                        return res.status(401).json("Your account has not been activated.")
                    }
                    const request_url = req.protocol + '://' + req.get('host')
                    const token = jwt.sign({ id: savedUser[0].id, role: savedUser[0].role }, 'RESTFULAPIs', { expiresIn: 60 * 60 * 24  })
                    const avatar = getImageUrlAsLink(request_url, savedUser[0].avatar)
                    return res.status(200).json({token: token, role: savedUser[0].role, name: savedUser[0].name, avatar: avatar})
                }
            } else {
                return res.status(401).send("User does not exist!")
            }
        }
        return res.status(400).json("User does not exist!")
    } catch(error){
        console.log(error)
        return res.status(500).json(error)
    }
}))

router.get('/history', verifyToken, wrapAsync(async(req, res, next) => {
    const decoded = jwt.verify(req.token, 'RESTFULAPIs')
    const recentPlaces = await Place.getRecentActivities(decoded.id)
    const recentTours = await Tour.getRecentActivities(decoded.id)
    const recentRestaurants = await Restaurant.getRecentActivities(decoded.id)
    return res.status(200).json({places: recentPlaces, tours: recentTours, restaurants: recentRestaurants})
}))

async function sendActivationEmail(request_url, user_id, email){
    const emailToken = jwt.sign({ id: user_id }, EMAIL_SECRET, { expiresIn: '1d' })
    const host = await getGuiUrl(request_url)
    const url = host + '/confirmation/' + emailToken

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
        user: 'verifyemail1004@gmail.com',
        pass: 'verify.email@1004'
        }
    })

    const mailOptions = {
        from: 'verifyemail1004@gmail.com',
        to: email,
        subject: 'Verify email',
        text: `Please click this link to verify your account: ${url}`
    }
    await transporter.sendMail(mailOptions)
}

router.use('/place', verifyToken, require('./place'))
router.use('/tour', verifyToken, require('./tour'))
router.use('/restaurant', verifyToken, require('./restaurant'))
router.use('/profile', verifyToken, require('./profile'))

module.exports = router