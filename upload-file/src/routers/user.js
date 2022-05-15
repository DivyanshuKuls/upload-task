const express = require('express')
const multer = require('multer')
const path = require('path')
const uuid = require('uuid').v4
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


router.get('', (req, res) =>{
    res.render('index')
})

router.get('/login', (req, res) =>{
    res.render('login')
})

router.get('/upload', auth, (req, res) =>{
    res.render('upload')
})

router.get('/download', auth, (req, res) =>{
    res.render('download')
})

router.post('/register', async (req, res) => {
    //console.log(req.body)
    const user = new User(req.body)

    try {
        await user.save()
        //const token = await user.generateAuthToken()
        res.status(201).send({ user })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.cookie('token', token)
        res.json({ status:'Ok'})
    } catch (e) {
        res.status(400).json({status:'error', error:'login failed'})
    }
})

router.get('/logout', auth, async (req, res) => {
    try {
        res.clearCookie('token')
        req.user.tokens = []
        await req.user.save()
        res.redirect('login')
    } catch (e) {
        res.status(500).send()
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const id = uuid()
        const filePath = `/${id}${ext}`
        req.user.filePath = filePath
        req.user.save()
        cb(null, filePath)
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/upload', auth, upload.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer
    // await req.user.save()
    res.json({status:'Ok'})
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/viewimage', auth, async (req, res) => {
    try {
        console.log('inside download')
        const user = req.user
        console.log(user)

        if (!user || !user.filePath) {
            throw new Error()
        }

        res.send({status: 'Ok', img: user.filePath})
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/downloadimage', auth, async (req, res) => {
    try {
        const user = req.user
        //console.log(user)

        if (!user || !user.filePath) {
            throw new Error()
        }
        const dir = path.join(__dirname, '..', '..', 'uploads', user.filePath)
        console.log(dir)
        // const file = `D:/Projects/Nodejs/Task/upload-file/uploads${user.filePath}`
        // console.log(file)
        res.download(dir)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router