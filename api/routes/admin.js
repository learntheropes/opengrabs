import asyncHandler from 'express-async-handler'
import { q, client } from '../db'
import opennode from '../btc'
import { transporter } from '../email'
import * as en from '../email/en'
import * as es from '../email/es'
import * as pt from '../email/pt'
import * as ru from '../email/ru'
import { getImageKitOriginal, getImageKitPreview, getImageKitModal } from '../image'
import { Router } from 'express'
import { allowOrigin } from '../utils'
import { authorizeUser, authorizeAdmin, authorizeDispute, authorizeRefund } from '../auth'
const router = Router()

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000))
  return this
}

router.get('/admin/is-admin', allowOrigin, authorizeUser, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const isAdmin = jwt['https://opengrabs.com/roles'].includes('admin')
  if (isAdmin === false) {
    return res.status(401).send('unauthorized')
  }
  return res.status(200).json(isAdmin)
}))

router.get('/admin/is-resolve-dispute', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const isResolveDispute = jwt['https://opengrabs.com/roles'].includes('resolve_dispute')
  return res.status(200).json(isResolveDispute)
}))

router.get('/admin/is-process-refund', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const isProcessRefund = jwt['https://opengrabs.com/roles'].includes('process_refund')
  return res.status(200).json(isProcessRefund)
}))

router.get('/admin/grabs/list', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
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

  return res.status(200).json(grabs)
}))

router.get('/admin/grabs/get/:ref', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref } = req.params

  let grab = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  grab.data.ref = grab.ref.value.id

  return res.status(200).json(grab.data)
}))

router.get('/admin/messages/list/:ref', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
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

  return res.status(200).json(messages)
}))

router.get('/admin/tickets/filter/:status/:language', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
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

  return res.status(200).json(tickets)
}))



router.get('/admin/tickets/get/:ref', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref } = req.params

  let { data: ticket } = await client.query(
    q.Get(q.Ref(q.Collection('tickets'), ref))
  )

  return res.status(200).json(ticket)
}))

router.get('/admin/ticket/messages/filter/:ref/:width', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref, width } = req.params

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
    data.attachments.map(attachment => {
      attachment.preview = getImageKitPreview(attachment.path)
      attachment.modal = getImageKitModal(attachment.path, width)
      return attachment
    })
    return data
  })

  return res.status(200).json(messages)
}))

router.post('/admin/ticket/messages/create/:ref', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
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

  return res.status(201).json({}) 
}))

router.post('/admin/tickets/update-language/:ref/:language', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
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

  return res.status(201).json({}) 
}))

router.get('/admin/tickets/email/get/:ref', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { ref } = req.params

  const { data: ticket } = await client.query(
    q.Get(q.Ref(q.Collection('email_tickets'), ref))
  )

  return res.status(200).json(ticket)
}))

router.get('/admin/tickets/email/filter/:status/:language', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { status, language } = req.params
  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('email_tickets_by_status_by_language'), status, language),
        { size: 100000 }
      ),
      q.Lambda(["updated_at", "ref"], q.Get(q.Var("ref")))
    )
  )
  
  const tickets = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  return res.status(200).json(tickets)
}))

router.get('/admin/ticket/email/messages/filter/:ref/:width', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref, width } = req.params

  const { data } = await client.query(
  q.Map(
    q.Paginate(
      q.Match(q.Index('email_ticket_messages_search_by_ticket_ref_sort_by_posted_at_desc'), ref),
      { size: 100000 }
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

router.post('/admin/ticket/email/messages/create/:ref', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { jwt, message } = req.body
  const { ref } = req.params

  const { data: ticket } = await client.query(
  q.Update(
    q.Ref(q.Collection('email_tickets'), ref),
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
      q.Collection('email_ticket_messages'),
      {
        data: {
          ticket: ref,
          posted_at: new Date().toISOString(),
          content: message.content,
          attachments: message.attachments,
          is_admin: true,
          user: {
          sub: `admin|${jwt.sub}`
          }
        }
      },
    )
  )

  const paths = message.attachments.map(attachment => {
    return { path: getImageKitOriginal(attachment.path) }
  })
  
  await transporter.sendMail({
    to: ticket.email,
    subject: ticket.subject,
    text: message.content,
    attachments: paths
  })

  return res.status(201)
}))

router.post('/admin/tickets/email/update-language/:ref/:language', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const { ref, language } = req.params

  await client.query(
    q.Update(
      q.Ref(q.Collection('email_tickets'), ref),
      {
        data: {
          language,
        }
      },
    )
  )

  return res.status(201)
}))

router.get('/admin/disputes/filter/:status', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
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

  return res.status(200).json(grabs)
}))

router.post('/admin/disputes/actions/update', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
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

  await client.query(
    q.Create(
      q.Collection('messages'),
      { data: props },
    )
  )

  return res.status(201)
}))

router.post('/admin/disputes/actions/release/:ref', allowOrigin, authorizeUser, authorizeAdmin, authorizeDispute, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab, ref: { value: { id }} } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.status !== 'disputed') {
    return res.status(401).send('unauthorized')
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

  await client.query(
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
      buyerEmailContent = en.emailDisputeResolved(buyer.locale, id, buyer.username)
    case 'es':
      buyerEmailContent = es.emailDisputeResolved(buyer.locale, id, buyer.username)
    case 'pt':
      buyerEmailContent = pt.emailDisputeResolved(buyer.locale, id, buyer.username)
    case 'ru':
      buyerEmailContent = ru.emailDisputeResolved(buyer.locale, id, buyer.username)
    default:
      buyerEmailContent = en.emailDisputeResolved('en', id, buyer.username)
  }

  await transporter.sendMail({
    to: buyer.email,
    subject: buyerEmailContent.subject,
    text: buyerEmailContent.content,
  }) 

  let travelerEmailContent
  switch (buyer.locale) {
    case 'en':
      travelerEmailContent = en.emailDisputeResolved(traveler.locale, id, traveler.username)
    case 'es':
      travelerEmailContent = es.emailDisputeResolved(traveler.locale, id, traveler.username)
    case 'pt':
      travelerEmailContent = pt.emailDisputeResolved(traveler.locale, id, traveler.username)
    case 'ru':
      travelerEmailContent = ru.emailDisputeResolved(traveler.locale, id, traveler.username)
    default:
      travelerEmailContent = en.emailDisputeResolved('en', id, traveler.username)
  }

  await transporter.sendMail({
    to: traveler.email,
    subject: travelerEmailContent.subject,
    text: travelerEmailContent.content,
  }) 

  return res.status(201)
}))

router.post('/admin/disputes/actions/refund/:ref', allowOrigin, authorizeUser, authorizeAdmin, authorizeDispute, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab, ref: { value: { id }} } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.status !== 'disputed') {
    return res.status(401).send('unauthorized')
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

  await client.query(
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
      buyerEmailContent = en.emailDisputeResolved(buyer.locale, id, buyer.username)
    case 'es':
      buyerEmailContent = es.emailDisputeResolved(buyer.locale, id, buyer.username)
    case 'pt':
      buyerEmailContent = pt.emailDisputeResolved(buyer.locale, id, buyer.username)
    case 'ru':
      buyerEmailContent = ru.emailDisputeResolved(buyer.locale, id, buyer.username)
    default:
      buyerEmailContent = en.emailDisputeResolved('en', id, buyer.username)
  }

  await transporter.sendMail({
    to: buyer.email,
    subject: buyerEmailContent.subject,
    text: buyerEmailContent.content,
  }) 

  let travelerEmailContent
  switch (buyer.locale) {
    case 'en':
      travelerEmailContent = en.emailDisputeResolved(traveler.locale, id, traveler.username)
    case 'es':
      travelerEmailContent = es.emailDisputeResolved(traveler.locale, id, traveler.username)
    case 'pt':
      travelerEmailContent = pt.emailDisputeResolved(traveler.locale, id, traveler.username)
    case 'ru':
      travelerEmailContent = ru.emailDisputeResolved(traveler.locale, id, traveler.username)
    default:
      travelerEmailContent = en.emailDisputeResolved('en', id, traveler.username)
  }

  await transporter.sendMail({
    to: traveler.email,
    subject: travelerEmailContent.subject,
    text: travelerEmailContent.content,
  }) 

  return res.status(201)
}))

router.post('/admin/grab/update-attention', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { ref, hours } = req.body

  const props = {
    dispute: {
      attention_required: new Date().addHours(parseInt(hours)).toISOString()
    }
  }

  await client.query(
    q.Update(
      q.Ref(q.Collection('grabs'), ref),
      { data: props },
    )
  )
  
  return res.status(201)
}))

router.post('/admin/charges/create-refund', allowOrigin, authorizeUser, authorizeAdmin, authorizeRefund, asyncHandler(async (req,res) => {
  const { address, checkout_id, email } = req.body
  const data = await opennode.createRefund({ address, checkout_id, email })
  return res.status(200).json(data)
}))

router.get('/admin/db/charges/webhook', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {

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

  return res.status(200).json(charges)
}))

router.get('/admin/charges/paid', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { page = 1, pageSize = 2147483647, search = '' } = req.query
  const data = await opennode.listPaidCharges({ page, pageSize, search }) // max pageSize 2147483647
  return res.status(200).json(data)
}))

router.get('/admin/charges/:id', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { id } = req.params
  const data = await opennode.chargeInfo(id)
  return res.status(200).json(data)
}))

router.get('/admin/db/withdraws/webhook', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {

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

  return res.status(200).json(withdraws)
}))

router.get('/admin/withdrawals/list', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { page = 1, pageSize = 2147483647, search = '' } = req.query
  const data = await opennode.listWithdrawals({ page, pageSize, search }) // max pageSize 2147483647
  return res.status(200).json(data)
}))

router.get('/admin/withdrawals/:id', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler(async (req,res) => {
  const { id } = req.params
  const data = await opennode.withdrawalInfo(id)
  return res.status(200).json(data)
}))

router.get('/admin/feedback/get/:username', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler (async (req,res) => {
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

router.get('/admin/feedback/remove/:ref', allowOrigin, authorizeUser, authorizeAdmin, asyncHandler (async (req,res) => {
  const { ref } = req.params

  await client.query(
    q.Delete(q.Ref(q.Collection('feedback'), ref))
  )

  return res.status(204)
}))

  export default router