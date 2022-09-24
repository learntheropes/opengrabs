import asyncHandler from 'express-async-handler'
import { allowOrigin } from '../utils'
import { authorizeUser } from '../auth'
import { q, client } from '../db'
import { Router } from 'express'
const router = Router()

router.post('/travels/actions/create', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { jwt, props } = req.body
  
  const { data: user } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )
  
  props.traveler = {
    sub: jwt.sub,
    username: user.username
  }
  
  await client.query(
    q.Create(
      q.Collection('travels'),
      { data: props },
    )
  )
  return res.status(201).end()
  }))

  router.post('/travels/actions/remove/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: travel } = await client.query(
    q.Get(q.Ref(q.Collection('travels'), ref))
  )

  if (travel.traveler.sub !== jwt.sub) {
    return res.status(401).send('unauthorized'),end()
  }

  await client.query(
    q.Delete(q.Ref(q.Collection('travels'), ref))
  )

  return res.status(204).end()
}))

export default router