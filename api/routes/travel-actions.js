import asyncHandler from 'express-async-handler'
import { authorizeUser } from '../auth'
import { q, client } from '../db'
import { Router } from 'express'
const router = Router()

router.post('/travels/create', authorizeUser, asyncHandler(async (req, res) => {
    const { jwt, props } = req.body
  
    const { data: user } = await client.query(
      q.Get(
        q.Match(q.Index('user_by_sub'), jwt.sub)
      )
    )
  
    props.traveler = {
      sub: jwt.sub,
      usenrame: user.username
    }
    
    const response = await client.query(
      q.Create(
        q.Collection('travels'),
        { data: props },
      )
    )
    res.status(201).json(response)
  }))

  module.exports = router