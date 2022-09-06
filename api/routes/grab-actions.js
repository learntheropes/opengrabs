import asyncHandler from 'express-async-handler'
import { allowOrigin } from '../utils'
import { authorizeUser } from '../auth'
import { q, client } from '../db'
import opennode from '../btc'
import { transporter } from '../email'
import * as en from '../email/en'
import * as es from '../email/es'
import * as pt from '../email/pt'
import * as ru from '../email/ru'
import { Router } from 'express'
import axios from 'axios'
const router = Router()
import dotenv from 'dotenv'
dotenv.config()
const baseUrl = process.env.URL ? `https://${process.env.URL}` : 'https://localhost:3000'

router.post('/grab/actions/publish', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {

  const { jwt } = req.body
  const { shop, destination } = req.body

  const { data: user } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )

  const props = {
    status: 'published',
    adv: 'order',
    shop,
    destination,
    buyer: {
      sub: jwt.sub,
      username: user.username
    },
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { ref: { value: { id }}} = await client.query(
    q.Create(
      q.Collection('grabs'),
      { data: props },
    )
  )

  await client.query(
    q.Create(
      q.Collection('messages'),
      { data: {
        posted_at: new Date().toISOString(),
        content: 'published',
        grab_id: id,
        user_sub: 'admin|0',
      }}
    )
  )

  return res.status(201).json({})
}))

router.post('/grab/actions/order/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt, shop, destination, delivery, traveler } = req.body

  const { data: buyer } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )

  const props = {
    status: 'booked',
    adv: 'travel',
    shop,
    destination,
    delivery,
    traveler,
    buyer: {
      sub: jwt.sub,
      username: buyer.username
    },
    published_at: new Date().toISOString(),
    booked_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { ref: { value: { id }}} = await client.query(
    q.Create(
      q.Collection('grabs'),
      { data: props },
    )
  )

  const { data: travel } = await client.query(
    q.Get(q.Ref(q.Collection('travels'), ref))
  )

  const availableBudget = travel.budget - (shop.price.product+shop.price.shipping+shop.price.taxes)
  if (availableBudget < 0) {
    return res.status(401).send('unauthorized')
  }

  await client.query(
    q.Update(
      q.Ref(q.Collection('travels'), ref),
      {
        data: {
          budget: availableBudget
        }
      },
    )
  )

  await client.query(
    q.Create(
      q.Collection('messages'),
      { data: {
        posted_at: new Date().toISOString(),
        content: 'booked',
        grab_id: id,
        user_sub: 'admin|0',
      }}
    )
  )

  const { data: travelerUser } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), traveler.sub)
    )
  )

  let emailContent
  switch (travelerUser.locale) {
    case 'en':
      emailContent = en.emailOrder(travelerUser.locale, id, travelerUser.username)
    case 'es':
      emailContent = es.emailOrder(travelerUser.locale, id, travelerUser.username)
    case 'pt':
      emailContent = pt.emailOrder(travelerUser.locale, id, travelerUser.username)
    case 'ru':
      emailContent = ru.emailOrder(travelerUser.locale, id, travelerUser.username)
    default:
      emailContent = en.emailOrder('en',id, travelerUser.username)
  }

  await transporter.sendMail({
    to: travelerUser.email,
    subject: emailContent.subject,
    text: emailContent.content,
    })

    return res.status(201)
}))

router.post('/grab/actions/remove/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.buyer.sub !== jwt.sub) {
    return res.status(401).send('unauthorized')
  }

  await client.query(
    q.Create(
      q.Collection('messages'),
      { data: {
        posted_at: new Date().toISOString(),
        content: 'removed',
        grab_id: ref,
        user_sub: 'admin|0',
      }}
    )
  )

  const response = await client.query(
    q.Delete(q.Ref(q.Collection('grabs'), ref))
  )

  return res.status(204)
}))

router.post('/grab/actions/book/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt, delivery_date } = req.body
  
  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  const { data: user } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
    )

  if (grab.status !== 'published') {
    return res.status(401).send('unauthorized')
  }  

  const props = {
    status: 'booked',
    traveler: {
      sub: jwt.sub,
      username: user.username,
    },
    delivery: {
      date: delivery_date,
    },
    booked_at: new Date().toISOString(),
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
        content: 'booked',
        grab_id: ref,
        user_sub: 'admin|0',
      }}
    )
  )

  const { data: buyerUser } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), grab.buyer.sub)
    )
  )

  let emailContent
  switch (buyerUser.locale) {
    case 'en':
      emailContent = en.emailBooked(buyerUser.locale, ref, buyerUser.username)
    case 'es':
      emailContent = es.emailBooked(buyerUser.locale, ref, buyerUser.username)
    case 'pt':
      emailContent = pt.emailBooked(buyerUser.locale, ref, buyerUser.username)
    case 'ru':travelerUser
      emailContent = ru.emailBooked(buyerUser.locale, ref, buyerUser.username)
    default:
      emailContent = en.emailBooked('en', ref, buyerUser.username)
  }

  await transporter.sendMail({
    to: buyerUser.email,
    subject: emailContent.subject,
    text: emailContent.content,
  })

  return res.status(201)
}))

router.post('/grab/actions/dispute/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if ((grab.buyer.sub !== jwt.sub && grab.traveler.sub !== jwt.sub) ||
  (grab.status === 'published' || grab.status === 'released' || grab.status === 'withdrawn')) {
    return res.status(401).send('unauthorized')
  }

  const props = {
    status: 'disputed',
    disputed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dispute: {
      by: {
        sub: jwt.sub,
        username : (jwt.sub === grab.buyer.sub) ? grab.buyer.username : grab.traveler.username
      },
      status: 'open',
      attention_required: new Date().toISOString()
    },
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
        content: 'disputed',
        grab_id: ref,
        user_sub: 'admin|0',
      }}
    )
  )

  let userNotifySub
  if (grab.buyer.sub === jwt.sub) {
    userNotifySub = grab.traveler.sub
  } else if (grab.traveler.sub === jwt.sub) {
    userNotifySub = grab.buyer.sub
  }

  const { data: userNotifyObject } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), userNotifySub)
    )
  )

  let emailContent
  switch (userNotifyObject.locale) {
    case 'en':
      emailContent = en.emailDispute(userNotifyObject.locale, ref, userNotifyObject.username)
    case 'es':
      emailContent = es.emailDispute(userNotifyObject.locale, ref, userNotifyObject.username)
    case 'pt':
      emailContent = pt.emailDispute(userNotifyObject.locale, ref, userNotifyObject.username)
    case 'ru':
      emailContent = ru.emailDispute(userNotifyObject.locale, ref, userNotifyObject.username)
    default:
      emailContent = en.emailDispute('en', ref, userNotifyObject.username)
  }

  await transporter.sendMail({
    to: userNotifyObject.email,
    subject: emailContent.subject,
    text: emailContent.content,
  })



  return res.status(201)
}))

router.post('/grab/actions/bought/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.traveler.sub !== jwt.sub || grab.status !== 'paid') {
    res.status(401).send('unauthorized')
    return
  }

  const props = {
    status: 'bought',
    bought_at: new Date().toISOString(),
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
        content: 'bought',
        grab_id: ref,
        user_sub: 'admin|0',
      }}
    )
  )

  const { data: buyerUser } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), grab.buyer.sub)
    )
  )

  let emailContent
  switch (buyerUser.locale) {
    case 'en':
      emailContent = en.emailBought(buyerUser.locale, ref, buyerUser.username)
    case 'es':
      emailContent = es.emailBought(buyerUser.locale, ref, buyerUser.username)
    case 'pt':
      emailContent = pt.emailBought(buyerUser.locale, ref, buyerUser.username)
    case 'ru':
      emailContent = ru.emailBought(buyerUser.locale, ref, buyerUser.username)
    default:
      emailContent = en.emailBought('en', ref, buyerUser.username)
  }

  await transporter.sendMail({
    to: buyerUser.email,
    subject: emailContent.subject,
    text: emailContent.content,
  })

  return res.status(201)
}))

router.post('/grab/actions/delivered/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.traveler.sub !== jwt.sub || grab.status !== 'bought') {
    res.status(401).send('unauthorized')
    return
  }

  const props = {
    status: 'delivered',
    delivered_at: new Date().toISOString(),
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
        content: 'delivered',
        grab_id: ref,
        user_sub: 'admin|0',
      }}
    )
  )

  const { data: buyerUser } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), grab.buyer.sub)
    )
  )

  let emailContent
  switch (buyerUser.locale) {
    case 'en':
      emailContent = en.emailDelivered(buyerUser.locale, ref, buyerUser.username)
    case 'es':
      emailContent = es.emailDelivered(buyerUser.locale, ref, buyerUser.username)
    case 'pt':
      emailContent = pt.emailDelivered(buyerUser.locale, ref, buyerUser.username)
    case 'ru':
      emailContent = ru.emailDelivered(buyerUser.locale, ref, buyerUser.username)
    default:
      emailContent = en.emailDelivered('en', ref, buyerUser.username)
  }

  await transporter.sendMail({
    to: buyerUser.email,
    subject: emailContent.subject,
    text: emailContent.content,
  })

  return res.status(201)
}))

router.post('/grab/actions/release/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (grab.buyer.sub !== jwt.sub || grab.status !== 'delivered') {
    res.status(401).send('unauthorized')
    return
  }

  const props = {
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

  const { data: travelerUser } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), grab.traveler.sub)
    )
  )

  let emailContent
  switch (travelerUser.locale) {
    case 'en':
      emailContent = en.emailReleased(travelerUser.locale, ref, travelerUser.username)
    case 'es':
      emailContent = es.emailReleased(travelerUser.locale, ref, travelerUser.username)
    case 'pt':
      emailContent = pt.emailReleased(travelerUser.locale, ref, travelerUser.username)
    case 'ru':
      emailContent = ru.emailReleased(travelerUser.locale, ref, travelerUser.username)
    default:
      emailContent = en.emailReleased('en', ref, travelerUser.username)
  }

  await transporter.sendMail({
    to: travelerUser.email,
    subject: emailContent.subject,
    text: emailContent.content,
  })

  return res.status(201)
}))

router.post('/grab/actions/withdraw/:ref', allowOrigin, authorizeUser, asyncHandler(async (req, res) => {
  const { ref } = req.params
  const { jwt } = req.body
  const { type, address } = req.body

  const { data: grab } = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if ((grab.traveler.sub === jwt.sub && grab.status === 'released' && grab.paid_at && grab.withdrawn === false) ||
  (grab.buyer.sub === jwt.sub && grab.status === 'refunded' && grab.paid_at && grab.withdrawn === false)) {
    const { data: rate } = await axios.get(`${baseUrl}/api/btc/rate/${grab.shop.currency}`)
    const btc_amount = Number(Math.round(parseFloat(grab.shop.price.total / rate.buy * 100000000 + 'e' + 0)) + 'e-' + 0)
    
    if (!grab.exchanged_at) {
      await opennode.initiateExchange({ to: 'btc', btc_amount })

      await client.query(
        q.Update(
          q.Ref(q.Collection('grabs'), ref),
          { data: {
            exchanged_at: new Date().toISOString()
          }},
        )
      )
    }

    const withdraw = await opennode.initiateWithdrawalAsync({
      type,
      address,
      amount: btc_amount,
      callback_url: `${baseUrl}/api/btc/withdrawal/webhook`
    })

    const props = {
      withdrawn_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      withdraw
    }

    await client.query(
      q.Update(
        q.Ref(q.Collection('grabs'), ref),
        { data: props },
      )
    )

    return res.status(200)
  }
  return res.status(401).send('unauthorized')
}))

export default router