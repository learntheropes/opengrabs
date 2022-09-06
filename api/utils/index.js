import dotenv from 'dotenv'
dotenv.config()

const origin = (process.env.URL) ? `https://${process.env.URL}` : 'https://localhost:3000'

export const allowOrigin = (req, res, next) => {

  res.set('Access-Control-Allow-Origin', origin)
  next()
}