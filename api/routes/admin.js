import asyncHandler from 'express-async-handler'
import { q, client } from '../db'
import opennode from '../btc'
import { transporter } from '../email'
import * as en from '../email/en'
import * as es from '../email/es'
import * as pt from '../email/pt'
import * as ru from '../email/ru'
import { Router } from 'express'
import { authorizeUser, authorizeAdmin, authorizeDispute, authorizeRefund } from '../auth'
const router = Router()

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000))
  return this
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

router.get('/admin/tickets/filter/:status/:language', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { status, language } = req.params

  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('tickets_by_status_by_language'), status, language),
        { size: 100000 }
      ),
      q.Lambda(["updated_at", "ref"], q.Get(q.Var("ref")))
    )
  )

  const tickets = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  res.status(200).json(tickets)
}))

router.get('/admin/tickets/get/:ref', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref } = req.params

  let { data: ticket } = await client.query(
    q.Get(q.Ref(q.Collection('tickets'), ref))
  )

  res.status(200).json(ticket)
}))

router.get('/admin/ticket/messages/filter/:ref', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref } = req.params

  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('ticket_messages_search_by_ticket_ref_sort_by_posted_at_desc'), ref),
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

router.post('/admin/ticket/messages/create/:ref', authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { message, jwt } = req.body
  const { ref } = req.params

  const { data: ticket, ref: { value: { id }}} = await client.query(
      q.Update(
          q.Ref(q.Collection('tickets'), ref),
          {
              data: {
                  status: 'close',
                  updated_at: new Date().toISOString(),
              }
          },
      )
  )

  await client.query(
      q.Create(
          q.Collection('ticket_messages'),
          {
              data: {
                  ticket: ref,
                  posted_at: new Date().toISOString(),
                  content: message.content,
                  attachments: message.attachments,
                  user: {
                      sub: `admin|${jwt.sub}`,
                  }
              }
          },
      )
  )

  let emailContent
  switch (ticket.language) {
    case 'en':
      emailContent = en.emailTicketReplyed(ticket.language, id, ticket.user.username)
    case 'es':
      emailContent = es.emailTicketReplyed(ticket.language, id, ticket.user.username)
    case 'pt':
      emailContent = pt.emailTicketReplyed(ticket.language, id, ticket.user.username)
    case 'ru':
      emailContent = ru.emailTicketReplyed(ticket.language, id, ticket.user.username)
    default:
      emailContent = en.emailTicketReplyed('en', id, ticket.user.username)
  }

  await transporter.sendMail({
    to: ticket.user.email,
    subject: emailContent.subject,
    text: emailContent.content,
  }) 

  res.status(201).json({}) 
}))

router.post('/admin/tickets/update-language/:ref/:language', authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { ref, language } = req.params

  await client.query(
      q.Update(
          q.Ref(q.Collection('tickets'), ref),
          {
            data: {
              language,
            }
          },
      )
  )

  res.status(201).json({}) 
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

router.post('/admin/disputes/actions/update', authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { props } = req.body

  const { data: grab, ref: { value: { id }}} = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), props.grab_id))
  )

  const { data: buyer } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), grab.buyer.sub)
    )
  )

  const { data: traveler } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), grab.traveler.sub)
    )
  )

  let buyerEmailContent
  switch (buyer.locale) {
    case 'en':
      buyerEmailContent = en.emailDisputeUpdated(buyer.locale, id, buyer.username)
    case 'es':
      buyerEmailContent = es.emailDisputeUpdated(buyer.locale, id, buyer.username)
    case 'pt':
      buyerEmailContent = pt.emailDisputeUpdated(buyer.locale, id, buyer.username)
    case 'ru':
      buyerEmailContent = ru.emailDisputeUpdated(buyer.locale, id, buyer.username)
    default:
      buyerEmailContent = en.emailDisputeUpdated('en', id, buyer.username)
  }

  await transporter.sendMail({
    to: buyer.email,
    subject: buyerEmailContent.subject,
    text: buyerEmailContent.content,
  }) 

  let travelerEmailContent
  switch (buyer.locale) {
    case 'en':
      travelerEmailContent = en.emailDisputeUpdated(traveler.locale, id, traveler.username)
    case 'es':
      travelerEmailContent = es.emailDisputeUpdated(traveler.locale, id, traveler.username)
    case 'pt':
      travelerEmailContent = pt.emailDisputeUpdated(traveler.locale, id, traveler.username)
    case 'ru':
      travelerEmailContent = ru.emailDisputeUpdated(traveler.locale, id, traveler.username)
    default:
      travelerEmailContent = en.emailDisputeUpdated('en', id, traveler.username)
  }

  await transporter.sendMail({
    to: traveler.email,
    subject: travelerEmailContent.subject,
    text: travelerEmailContent.content,
  }) 

  const response = await client.query(
    q.Create(
      q.Collection('messages'),
      { data: props },
    )
  )

  res.status(201).json(response)
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

router.post('/admin/grab/update-attention', authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref, hours } = req.body

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