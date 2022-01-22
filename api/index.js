import express from 'express'
import bodyParser from 'body-parser'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

import amazon from './routes/amazon'
import db from './routes/db'
import btc from './routes/btc'
import facebook from './routes/facebook'
import grabActions from './routes/grab-actions'
import admin from './routes/admin'
import crypto from './routes/crypto'

app.use(amazon)
app.use(db)
app.use(btc)
app.use(facebook)
app.use(grabActions)
app.use(admin)
app.use(crypto)

module.exports = {
  path: '/api',
  handler: app
}