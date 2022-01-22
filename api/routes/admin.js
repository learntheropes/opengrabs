import asyncHandler from 'express-async-handler'
import { q, client } from '../db'
import opennode from '../btc'
import { Router } from 'express'
import { authorizeUser, authorizeAdmin } from '../auth'
const router = Router()

router.get('/admin/is-admin', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const isAdmin = jwt['https://opengrabs.com/roles'].includes('admin')
  res.status(200).json(isAdmin)
}))

router.get('/admin/grabs/list', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { data } = await client.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection('grabs')), { size: 100000 }),
      q.Lambda(x => q.Get(x))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.get('/admin/grabs/get/:ref', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {

  const { ref } = req.params

  let grab = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  grab.data.ref = grab.ref.value.id

  res.status(200).json(grab.data)
}))

router.get('/admin/messages/list/:ref', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {

  const { ref } = req.params

  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('messages_by_grab_id'), ref),
        { size: 100000 }
      ),
      q.Lambda(["posted_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const messages = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(messages)
}))

router.get('/admin/disputes/filter/:status', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {

  const { status } = req.params

  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('admin_disputes_status'), status),
        { size: 100000 }
      ),
      q.Lambda(["disputed_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.post('/admin/disputes/actions/release/:ref', authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { ref } = req.params

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.status !== 'disputed') {
    res.status(401).send('unauthorized')
    return
  }

  const props = {
    dispute: {
      status: 'close'
    },
    status: 'released',
    withdrawn: false,
    released_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const response = await client.query(
    q.Update(
      q.Ref(q.Collection('grabs'), ref),
      { data: props },
    )
  )

  res.status(201).json(response)
}))

router.post('/admin/disputes/actions/refund/:ref', authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { ref } = req.params

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.status !== 'disputed') {
    res.status(401).send('unauthorized')
    return
  }

  const props = {
    dispute: {
      status: 'close'
    },
    status: 'refunded',
    withdrawn: false,
    refunded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const response = await client.query(
    q.Update(
      q.Ref(q.Collection('grabs'), ref),
      { data: props },
    )
  )

  res.status(201).json(response)
}))

router.post('/admin/charges/create-refund', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { address, checkout_id, email } = req.body
  const data = await opennode.createRefund({ address, checkout_id, email })
  res.status(200).json(data)
}))

router.get('/admin/charges/paid', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { page = 1, pageSize = 10, search = '' } = req.query
  const data = await opennode.listPaidCharges({ page, pageSize, search }) // max pageSize 2147483647
  res.status(200).json(data)
}))

module.exports = router