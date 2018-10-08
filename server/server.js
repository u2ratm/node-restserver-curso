require('./config/config')

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')

const bodyParser = require('body-parser')
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//habilitar la carpeta public

app.use(express.static(path.resolve(__dirname, '../public')))



// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/index'))

mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err
    console.log('Base de datos Online')
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando un Puerto: ', 3000)
})