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
import travelActions from './routes/travel-actions'
import admin from './routes/admin'
import user from './routes/user'
import feedback from './routes/feedback'
import ticket from './routes/ticket'
import image from './routes/image'

app.use(amazon)
app.use(db)
app.use(btc)
app.use(facebook)
app.use(grabActions)
app.use(travelActions)
app.use(admin)
app.use(user)
app.use(feedback)
app.use(ticket)
app.use(image)

export default {
  path: '/api',
  handler: app
}