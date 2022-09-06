import asyncHandler from 'express-async-handler'
import { allowOrigin } from '../utils'
import { authorizeUser } from '../auth'
import { q, client } from '../db'
import { getImageKitPreview, getImageKitModal } from '../image'
import getTravelPhoto from '../places' 
import { Router } from 'express'
const router = Router()

router.get('/db/isbuyerortraveler/:ref', allowOrigin, authorizeUser, asyncHandler (async (req,res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (jwt.sub === grab.buyer.sub || jwt.sub === grab.traveler.sub) {
    return res.status(200).send(true)
  } else {
    return res.status(401).send('unauthorized')
  }
}))

router.get('/db/grabs/get/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )
  
  if (grab.traveler) {
    if (jwt.sub !== grab.buyer.sub && jwt.sub !== grab.traveler.sub) {
      return res.status(401).send('unauthorized')
    }
  }
  return res.status(200).json(grab)
}))

router.get('/db/grabs/filter/:adv/:status', allowOrigin, asyncHandler(async (req, res) => {
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

  return res.status(200).json(grabs)
}))

router.get('/db/account/orders/:status', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
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

  return res.status(200).json(grabs)
}))

router.get('/db/account/orders/:status/:withdrawn', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
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

  return res.status(200).json(grabs)
}))

router.get('/db/account/deliveries/:status', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
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

  return res.status(200).json(grabs)
}))

router.get('/db/account/deliveries/:status/:withdrawn', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
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

  return res.status(200).json(grabs)
}))

router.get('/db/messages/filter/grab/:ref/:width', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body
  const { ref, width } = req.params

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (jwt.sub !== grab.buyer.sub && jwt.sub !== grab.traveler.sub) {
    return res.status(401).send('unauthorized')
  }

  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('messages_by_grab_id'), ref),
        { size: 1000 }
      ),
      q.Lambda(["posted_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const messages = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    data.attachments.map(attachment => {
      attachment.preview = getImageKitPreview(attachment.path)
      attachment.modal = getImageKitModal(attachment.path, width)
      return attachment
    })
    return data
  })

  return res.status(200).json(messages)
}))

router.post('/db/messages/create', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { jwt, props } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), props.grab_id))
  )

  if (jwt.sub !== grab.buyer.sub && jwt.sub !== grab.traveler.sub) {
    return res.status(401).send('unauthorized')
  }

  const response = await client.query(
    q.Create(
      q.Collection('messages'),
      { data: props },
    )
  )

  return res.status(201).json(response)
}))

router.post('/db/feedback/create', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
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

    return res.status(201).json(response)
  } else {
    return res.status(401).send('unauthorized')
  }
}))

router.get('/db/travels/filter/:status', allowOrigin, asyncHandler(async (req, res) => {
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

  return res.status(200).json(travels)
}))

router.get('/db/account/travels/filter/:status', allowOrigin, authorizeUser, asyncHandler(async (req,res) => {
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
  
  return res.status(200).json(travels)
}))

router.get('/db/travels/get/:ref', allowOrigin, asyncHandler(async (req,res) => {
  const { ref } = req.params

  const { data: travel } = await client.query(
    q.Get(q.Ref(q.Collection('travels'), ref))
  )
  
  return res.status(200).json(travel)
}))

router.post('/travels/get-photo', allowOrigin, authorizeUser, asyncHandler(async (req,res) => {
  const { input } = req.body

  const photo = await getTravelPhoto(input) 
  return res.status(200).send(photo)
}))

export default router
