import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import { Router } from 'express'
import { authorizeUser } from '../auth'
const router = Router()

router.get('/image/signature', authorizeUser, asyncHandler(async (req,res) => {
    const { expire, token } = req.body
    const hmac = crypto.createHmac('sha1', process.env.IMAGEKIT_PRIVATE_KEY)
    hmac.update(`${token}${expire}`)
    const signature = hmac.digest('hex')
    res.status(200).json({ signature })
  }))

module.exports = router