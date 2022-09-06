import faunadb from 'faunadb'
import dotenv from 'dotenv'
dotenv.config()

const secret = process.env.FAUNADB_KEY
export const q = faunadb.query
export const client = new faunadb.Client({
  secret,
  scheme: 'https',
  domain: 'db.us.fauna.com'
})