import asyncHandler from 'express-async-handler'
import { q, client } from '../db'
import { Router } from 'express'
const router = Router()

router.get('/db/reviews/get/:username', asyncHandler (async (req,res) => {

}))
module.exports = router