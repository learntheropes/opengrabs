import dotenv from 'dotenv'
dotenv.config()

export const allowOrigin = (process.env.URL) ? process.env.URL : 'https://localhost:3000'

