const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const useRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const multer = require('multer')
const path = require('path')

const app = express()

dotenv.config()

//*mongoose connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(function () {
    console.log('connected to mongoDB')
  })
  .catch(function (err) {
    console.log('The Error: ' + err)
  })

app.use('/images', express.static(path.join(__dirname, 'public/images')))

//*middleware
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))
app.use(express.static(__dirname))

app.get('/', function (req, res) {
  res.send('Welcome to Home Page')
})
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/images') // Added the missing path separator
  },
  filename: function (req, file, cb) {
    cb(null, req.body.name) // Using the original file name as the filename
  },
})

const upload = multer({ storage: storage })

app.post('/api/upload', upload.single('file'), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json('No file uploaded.')
    }
    return res.status(200).json('File uploaded successfully.')
  } catch (err) {
    console.error(err)
    return res.status(500).json('Error uploading file.')
  }
})

app.use('/api/users', useRoute)
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)

app.listen(4000, function () {
  console.log('Backend Server started on Port 4000')
})
