import { imagekit } from '../image'
import { allowOrigin } from '../utils'
import { Router } from 'express'
const router = Router()

router.post('/image/signature', allowOrigin, (req,res) => {
  const { signature, token, expire } = imagekit.getAuthenticationParameters()
  res.status(200).json({ signature, token, expire })
})

export default router