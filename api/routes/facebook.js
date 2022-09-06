import crypto from 'crypto'
import asyncHandler from 'express-async-handler'
import parseSignedRequest from '../facebook'
import { allowOrigin } from '../utils'
import { q, client } from '../db'
import { Router } from 'express'
const router = Router()
import dotenv from 'dotenv'
dotenv.config()

router.get('/facebook/get/status/:code', allowOrigin, asyncHandler(async (req, res) => {
  const { code } = req.params

  const { data: { status }} = await client.query(
  q.Get(
    q.Match(q.Index('facebook_deletion_status_by_code'), code)
  )
  )
  res.status(200).json({ status })
}))

router.post('/facebook/deletion', parseSignedRequest, asyncHandler(async (req, res) => {
  const { user_id } = req.body
  const confirmationCode = getConfirmationCode()
  const path = `/facebook/deletion-status/${confirmationCode}`
  const url = toAbsoluteUrl(req, path)

  await client.query(
  q.Create(
    q.Collection('facebook_deletion_requests'),
    { data: {
    user_id,
    confirmationCode,
    status: "Data deletion is processed manually. It's still processing"
    }},
  )
  )

  res.type('json')
  res.send(`{ url: '${url}', confirmation_code: '${confirmationCode}' }`)
}))

function getConfirmationCode () {
  return crypto.randomBytes(10).toString('hex')
}

function toAbsoluteUrl (req, path) {
  return 'https://' + req.get('host') + path
}

export default router
