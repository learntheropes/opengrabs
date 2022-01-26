import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()
import { Router } from 'express'
const router = Router()

router.get('/crypto/sha256/:string', (req,res) => {
    const { string } = req.params
    const hmac = crypto.createHmac('sha256', process.env.TAWK_API_KEY)
    hmac.update(string)
    const hash = hmac.digest('hex')
    res.status(200).json({ hash })
})

module.exports = router

