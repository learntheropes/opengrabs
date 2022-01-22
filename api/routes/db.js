import asyncHandler from 'express-async-handler'
import { authorizeUser } from '../auth'
import { allowOrigin } from '../lambda'
import { q, client } from '../db'
import { Router } from 'express'
const router = Router()

router.get('/db/grabs/get/:ref', authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )
  
  if (data.traveler) {
    if (jwt.sub !== data.buyer.sub && jwt.sub !== data.traveler.sub) {
      res.status(401).send('unauthorized')
      return
    }
  }
  res.status(200).json(data)
}))

router.get('/db/grabs/filter/:adv/:status', asyncHandler(async (req, res) => {
  res.set('Access-Control-Allow-Origin', allowOrigin)
  const { adv, status } = req.params
  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Range(
          q.Match(q.Index("grabs_serch_by_adv_status_range_published_at"), adv, status),
          [q.Now()], []
        ),
        { size: 100000 }
      ),
      q.Lambda(["max_delivery_date_time", "published_at_time", "ref"], q.Get(q.Var("ref")))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.get('/db/account/orders/:status', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body
  const { status } = req.params
  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('grabs_search_by_buyer_sub_status_sort_by_updated_at_desc'), jwt.sub, status),
        { size: 100000 }
      ),
      q.Lambda(["updated_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.get('/db/account/orders/:status/:withdrawn', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body
  let { status, withdrawn } = req.params
  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('grabs_search_by_buyer_sub_status_withdrawn_sort_by_updated_at_desc'), jwt.sub, status, JSON.parse(withdrawn)),
        { size: 100000 }
      ),
      q.Lambda(["updated_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.get('/db/account/deliveries/:status', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body
  const { status } = req.params
  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('grabs_search_by_traveler_sub_status_sort_by_updated_at_desc'), jwt.sub, status),
        { size: 100000 }
      ),
      q.Lambda(["updated_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.get('/db/account/deliveries/:status/:withdrawn', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body
  const { status, withdrawn } = req.params
  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('grabs_search_by_traveler_sub_status_withdrawn_sort_by_updated_at_desc'), jwt.sub, status, JSON.parse(withdrawn)),
        { size: 100000 }
      ),
      q.Lambda(["updated_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.get('/db/messages/filter/grab/:ref', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body
  const { ref } = req.params

  const grab = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (jwt.sub !== grab.data.buyer.sub && jwt.sub !== grab.data.traveler.sub) {
    res.status(401).send('unauthorized')
    return
  }

  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('messages_by_grab_id'), ref),
        { size: 100000 }
      ),
      q.Lambda(["posted_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.post('/db/messages/create', authorizeUser, asyncHandler(async (req, res) => {
  const { props } = req.body
  const response = await client.query(
    q.Create(
      q.Collection('messages'),
      { data: props },
    )
  )
  res.status(201).json(response)
}))

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

router.post('/db/user/update', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const { props } = req.body

  const exists = await client.query(
    q.Exists(
        q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )

  let response
  if (exists) {
    const { ref: {value: { id }}} = await client.query(
      q.Get(
        q.Match(q.Index('user_by_sub'), jwt.sub)
      )
    )
    response = await client.query(
      q.Update(
        q.Ref(q.Collection('users'), id),
        { data: props },
      )
    )
  } else {
    response = await client.query(
      q.Create(
        q.Collection('users'),
        { data: props },
      )
    )
  }

  res.status(200).json(response)
}))

module.exports = router
