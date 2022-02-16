import asyncHandler from 'express-async-handler'
import { q, client } from '../db'
import opennode from '../btc'
import { Router } from 'express'
import { authorizeUser, authorizeAdmin, authorizeDispute, authorizeRefund } from '../auth'
const router = Router()

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}

router.get('/admin/is-admin', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const isAdmin = jwt['https://opengrabs.com/roles'].includes('admin')
  if (isAdmin === false) {
    res.status(401).send('unauthorized')
    return
  }
  res.status(200).json(isAdmin)
}))

router.get('/admin/is-resolve-dispute', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const isResolveDispute = jwt['https://opengrabs.com/roles'].includes('resolve_dispute')
  res.status(200).json(isResolveDispute)
}))

router.get('/admin/is-process-refund', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const isProcessRefund = jwt['https://opengrabs.com/roles'].includes('process_refund')
  res.status(200).json(isProcessRefund)
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

  let { data: messages } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('messages_by_grab_id'), ref),
        { size: 100000 }
      ),
      q.Lambda(["posted_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  messages = messages.map(({ data, ref: { value: { id }}}) => {
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
        q.Match(q.Index('disputes_by_status_by_attention_required'), status),
        { size: 100000 }
      ),
      q.Lambda(["attention_required", "ref"], q.Get(q.Var("ref")))
    )
  )

  const grabs = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(grabs)
}))

router.post('/admin/disputes/actions/release/:ref', authorizeUser, authorizeAdmin, authorizeDispute, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.status !== 'disputed') {
    res.status(401).send('unauthorized')
    return
  }

  const props = {
    dispute: {
      status: 'close',
      resolved_by: jwt.sub
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

  await client.query(
    q.Create(
      q.Collection('messages'),
      { data: {
        posted_at: new Date().toISOString(),
        content: 'released',
        grab_id: ref,
        user_sub: 'admin|0',
      }}
    )
  )

  res.status(201).json(response)
}))

router.post('/admin/disputes/actions/refund/:ref', authorizeUser, authorizeAdmin, authorizeDispute, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.status !== 'disputed') {
    res.status(401).send('unauthorized')
    return
  }

  const props = {
    dispute: {
      status: 'close',
      resolved_by: jwt.sub
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

  await client.query(
    q.Create(
      q.Collection('messages'),
      { data: {
        posted_at: new Date().toISOString(),
        content: 'refunded',
        grab_id: ref,
        user_sub: 'admin|0',
      }}
    )
  )

  res.status(201).json(response)
}))

router.post('/admin/grab/update-attention/:ref/:hours', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref, hours } = req.params
  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  const props = {
    dispute: {
      attention_required: new Date().addHours(parseInt(hours)).toISOString()
    }
  }

  const response = await client.query(
    q.Update(
      q.Ref(q.Collection('grabs'), ref),
      { data: props },
    )
  )
  
  res.status(201).json(response)
}))

router.post('/admin/charges/create-refund', authorizeUser, authorizeAdmin, authorizeRefund, asyncHandler(async (req,res) => {
  const { address, checkout_id, email } = req.body
  const data = await opennode.createRefund({ address, checkout_id, email })
  res.status(200).json(data)
}))

router.get('/admin/db/charges/webhook', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { data } = await client.query(
    q.Map(
      q.Paginate(
          q.Match(q.Index("grabs_containing_charge"), true),
        { size: 100000 }
      ),
      q.Lambda("ref", q.Get(q.Var("ref")))
    )
  )
  const charges = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })
  res.status(200).json(charges)
}))

router.get('/admin/charges/paid', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { page = 1, pageSize = 2147483647, search = '' } = req.query
  const data = await opennode.listPaidCharges({ page, pageSize, search }) // max pageSize 2147483647
  res.status(200).json(data)
}))

router.get('/admin/charges/:id', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { id } = req.params
  const data = await opennode.chargeInfo(id)
  res.status(200).json(data)
}))

router.get('/admin/db/withdraws/webhook', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { data } = await client.query(
    q.Map(
      q.Paginate(
          q.Match(q.Index("grabs_containing_withdraw_webhook"), true),
        { size: 100000 }
      ),
      q.Lambda("ref", q.Get(q.Var("ref")))
    )
  )
  const withdraws = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })
  res.status(200).json(withdraws)
}))

router.get('/admin/withdrawals/list', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { page = 1, pageSize = 2147483647, search = '' } = req.query
  const data = await opennode.listWithdrawals({ page, pageSize, search }) // max pageSize 2147483647
  res.status(200).json(data)
}))

router.get('/admin/withdrawals/:id', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { id } = req.params
  const data = await opennode.withdrawalInfo(id)
  res.status(200).json(data)
}))

router.get('/admin/feedback/get/:username', authorizeUser, authorizeAdmin, asyncHandler (async (req,res) => {
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
  
  res.status(200).json(feedback)
}))

router.get('/admin/feedback/remove/:ref', authorizeUser, authorizeAdmin, asyncHandler (async (req,res) => {
  const { ref } = req.params

  await client.query(
    q.Delete(q.Ref(q.Collection('feedback'), ref))
  )

  res.status(204).json({})
}))

module.exports = router