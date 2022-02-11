import asyncHandler from 'express-async-handler'
import { authorizeUser } from '../auth'
import { allowOrigin } from '../lambda'
import { q, client } from '../db'
import getTravelPhoto from '../places' 
import { Router } from 'express'
const router = Router()

router.get('/db/isbuyerortraveler/:ref', authorizeUser, asyncHandler (async (req,res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (jwt.sub === grab.buyer.sub || jwt.sub === grab.traveler.sub) {
    res.status(200).send(true)
    return
  } else {
    res.status(200).send(false)
    return
  }
}))

router.get('/db/grabs/get/:ref', authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )
  
  if (grab.traveler) {
    if (jwt.sub !== grab.buyer.sub && jwt.sub !== grab.traveler.sub) {
      res.status(401).send('unauthorized')
      return
    }
  }
  res.status(200).json(grab)
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
    q.Paginate(
      q.Match(q.Index('messages_by_grab_id'), ref),
      { size: 100000 }
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.post('/db/messages/create', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt, props } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), props.grab_id))
  )

  if (jwt.sub !== grab.buyer.sub && jwt.sub !== grab.traveler.sub) {
    res.status(401).send('unauthorized')
    return
  }

  const response = await client.query(
    q.Create(
      q.Collection('messages'),
      { data: props },
    )
  )

  res.status(201).json(response)
}))

router.post('/db/feedback/create', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt, props } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), props.grab_id))
  )

  if ((jwt.sub === grab.buyer.id && props.autor === grab.buyer.username && props.username === grab.traveler.username) ||
  (jwt.sub === grab.traveler.id && props.autor === grab.traveler.username && props.username === grab.buyer.username)) {

    const response = await client.query(
      q.Create(
        q.Collection('messages'),
        { data: props },
      )
    )

    res.status(201).json(response)
    return
  } else {
    res.status(401).send('unauthorized')
  }
}))

router.get('/db/travels/filter/:status', asyncHandler(async (req, res) => {
  res.set('Access-Control-Allow-Origin', allowOrigin)
  const { status } = req.params
  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Range(
          q.Match(q.Index("travels_search_by_status_active_and_not_expired_range_published_at"), status),
          [q.Now()], []
        ),
        { size: 100000 }
      ),
      q.Lambda(["date_time", "published_at_time", "ref"], q.Get(q.Var("ref")))
    )
  )

  const travels = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(travels)
}))

router.get('/db/account/travels/filter/:status', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const { status } = req.params

  let data
  if (status === 'expired') {
    ({ data } = await client.query(
      q.Map(
        q.Paginate(
          q.Range(
            q.Match(q.Index("travels_search_by_traveler_sub_and_date"), jwt.sub),
            [], [q.Now()]
          ),
          { size: 100000 }
        ),
        q.Lambda(["date_time", "ref"], q.Get(q.Var("ref")))
      )      
    ))
  } else if (status === 'actives') {
    ({ data } = await client.query(
      q.Map(
        q.Paginate(
          q.Range(
            q.Match(q.Index("travels_search_by_traveler_sub_and_date"), jwt.sub),
            [q.Now()], []
          ),
          { size: 100000 }
        ),
        q.Lambda(["date_time", "ref"], q.Get(q.Var("ref")))
      )      
    ))
  }

  const travels = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })
  
  res.status(200).json(travels)
}))

router.get('/db/travels/get/:ref', asyncHandler(async (req,res) => {
  const { ref } = req.params

  const { data: travel } = await client.query(
    q.Get(q.Ref(q.Collection('travels'), ref))
  )
  
  res.status(200).json(travel)
}))

router.post('/travels/get-photo', authorizeUser, asyncHandler(async (req,res) => {
  const { input } = req.body

  const photo = await getTravelPhoto(input) 
  res.status(200).send(photo)
}))

module.exports = router
