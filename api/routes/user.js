import asyncHandler from 'express-async-handler'
import { authorizeUser } from '../auth'
import { q, client } from '../db'
import { Router } from 'express'
const router = Router()

router.get('/db/user/get/:sub', authorizeUser, asyncHandler(async (req, res) => {
    const { jwt } = req.body
    const { sub } = req.params
    if (jwt.sub !== sub) {
      res.status(401).send('unauthorized')
      return
    }
    const { data } = await client.query(
      q.Get(
        q.Match(q.Index('user_by_sub'), sub)
      )
    )
    res.status(200).json(data)
  }))
  
  router.post('/db/user/create', authorizeUser, asyncHandler(async (req, res) => {
    const { jwt, locale } = req.body
    const sub = jwt.sub
  
    let strategy = jwt['https://opengrabs.com/strategy']
    if (!strategy) strategy = jwt.sub.split('|')[0]
  
    const email = jwt['https://opengrabs.com/email']
  
    let props
    switch (strategy) {
      case 'facebook':
        const name = jwt['https://opengrabs.com/name']
        props = {
          sub: sub,
          email: email,
          name: name,
          selected_lenguage: locale
        }
        break
      case 'vkontakte':
        const given_name = jwt['https://opengrabs.com/given_name']
        const family_name = jwt['https://opengrabs.com/family_name']
        props = {
          sub: sub,
          email: email,
          name: `${given_name} ${family_name}`.replace(/-/g, ' '),
          selected_lenguage: locale
        }
        break
        }
  
    const exists = await client.query(
      q.Exists(
        q.Match(q.Index('user_by_sub'), sub)
      )
    )
  
    if (!exists) {
      await client.query(
        q.Create(
          q.Collection('users'),
          { data: props }
        )
      )
      res.status(200).json(props)
      return
    } else {
  
      const { data: user } = await client.query(
        q.Get(
          q.Match(q.Index('user_by_sub'), jwt.sub)
        )
      )
      res.status(200).json(user)
      return
    }
  }))
  
  router.post('/db/user/update', authorizeUser, asyncHandler(async (req,res) => {
    const { jwt, props } = req.body
  
    const { ref: {value: { id }}} = await client.query(
      q.Get(
        q.Match(q.Index('user_by_sub'), jwt.sub)
      )
    )
    
    const { data: user} = await client.query(
      q.Update(
        q.Ref(q.Collection('users'), id),
        { data: props },
      )
    )
  
    res.status(200).json(user)
  }))
  
  module.exports = router
  