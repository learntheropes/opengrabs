import { imagekit } from '../image'
import { Router } from 'express'
const router = Router()

router.post('/image/signature', (req,res) => {
    const { signature, token, expire } = imagekit.getAuthenticationParameters()
    res.status(200).json({ signature, token, expire })
  })

module.exports = router