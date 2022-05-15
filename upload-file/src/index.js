const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const path = require('path')
const cookieParser = require('cookie-parser')

const app = express()
const port = process.env.PORT || 3000

const dir = path.join(__dirname, '../uploads')
const viewsPath = path.join(__dirname, '../views')

app.set('view engine', 'hbs')
app.set('views', viewsPath)

app.use(express.json())
app.use(cookieParser())
app.use(userRouter)
app.use(express.static(dir))


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})