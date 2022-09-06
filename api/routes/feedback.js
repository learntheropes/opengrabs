import asyncHandler from 'express-async-handler'
import { allowOrigin } from '../utils'
import { q, client } from '../db'
import { Router } from 'express'
const router = Router()

router.get('/db/feedback/get/:username', allowOrigin, asyncHandler (async (req,res) => {
  const { username } = req.params

  const { data } = await client.query(
    q.Paginate(
      q.Match(q.Index('feedback_by_username'), username),
      { size: 100000 }
    )
  )

  const feedback = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })
  
  return res.status(200).json(feedback)
}))
  export default router