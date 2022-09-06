import asyncHandler from 'express-async-handler'
import { q, client } from '../db'
import { getImageKitPreview, getImageKitModal } from '../image'
import { Router } from 'express'
import { allowOrigin } from '../utils'
import { authorizeUser } from '../auth'
const router = Router()

router.get('/tickets/get/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: ticket } = await client.query(
    q.Get(q.Ref(q.Collection('tickets'), ref))
  )
  
  if (ticket.user.sub !== jwt.sub) {
    return res.status(401).send('unauthorised')
  }

  return res.status(200).json(ticket)
}))

router.get('/tickets/filter', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body

  const { data } = await client.query(
    q.Map(
      q.Paginate(
        q.Match(q.Index('tickets_search_by_buyer_sub_sort_by_created_at_desc'), jwt.sub),
        { size: 100000 }
      ),
      q.Lambda(["created_at", "ref"], q.Get(q.Var("ref")))
    )
  )
  
  const tickets = data.map(({ data, ref: { value: { id }}}) => {
    data.ref = id
    return data
  })

  return res.status(200).json(tickets)
}))

router.post('/tickets/create', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { jwt, ticket } = req.body

  const { data: user } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )

  ticket.user = {
    sub: user.sub,
    email: user.email,
    email_verified: user.email_verified,
    username: user.username
  }

  const { ref: { value: { id }}} = await client.query(
    q.Create(
      q.Collection('tickets'),
      { data: ticket },
    )
  )  

  return res.status(201).json({ id }) 
}))

router.get('/ticket/messages/filter/:ref/:width', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref, width } = req.params
  const { jwt } = req.body

  const { data: ticket } = await client.query(
    q.Get(q.Ref(q.Collection('tickets'), ref))
  )

  if (ticket.user.sub !== jwt.sub) {
    return res.status(401).send('unauthorised')
  }

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

router.post('/ticket/messages/create/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { message, jwt } = req.body
  const { ref } = req.params

  const { data: ticket } = await client.query(
    q.Get(q.Ref(q.Collection('tickets'), ref))
  )

  if (ticket.user.sub !== jwt.sub) {
    return res.status(401).send('unauthorised')
  }

  const { data: user } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )

  await client.query(
    q.Update(
      q.Ref(q.Collection('tickets'), ref),
      {
        data: {
          status: 'open',
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
            sub: user.sub,
            email: user.email,
            email_verified: user.email_verified,
            username: user.username
          }
        }
      },
    )
  )  

  return res.status(201)
}))

router.post('/tickets/email/create', allowOrigin, asyncHandler(async (req, res) => {
  const { ticket } = req.body

  const { ref: { value: { id }}} = await client.query(
    q.Create(
      q.Collection('email_tickets'),
      {
        data: {
          status: 'open',
          language: ticket.language,
          email: ticket.email,
          subject: ticket.subject,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
    )
  )  

  return res.status(201).json({ id }) 
}))

router.post('/ticket/email/messages/create/:ref', allowOrigin, asyncHandler(async (req, res) => {
  const { message } = req.body
  const { ref } = req.params

  await client.query(
    q.Create(
      q.Collection('email_ticket_messages'),
      {
        data: {
          ticket: ref,
          posted_at: new Date().toISOString(),
          content: message.content,
          attachments: message.attachments,
          is_admin: false
        }
      },
    )
  )  

  return res.status(201)
}))

export default router
