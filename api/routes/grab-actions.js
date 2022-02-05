import asyncHandler from 'express-async-handler'
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
const baseUrl = process.env.URL ? process.env.URL : 'https://localhost:3000'

router.post('/grab/actions/publish', authorizeUser, asyncHandler(async (req, res) => {

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

    res.status(201)
}))

router.post('/grab/actions/order/:ref', authorizeUser, asyncHandler(async (req, res) => {
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

    await client.query(
        q.Update(
            q.Ref(q.Collection('travels'), ref),
            {
                data: {
                    status: (availableBudget < 10) ? 'ordered' : 'active',
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
            emailContent = en.emailOrder(travelerUser.locale,id)
        case 'es':
            emailContent = es.emailOrder(travelerUser.locale,id)
        case 'pt':
            emailContent = pt.emailOrder(travelerUser.locale,id)
        case 'ru':
            emailContent = ru.emailOrder(travelerUser.locale,id)
        default:
            emailContent = en.emailOrder(travelerUser.locale,id)
    }

    await transporter.sendMail({
        to: travelerUser.email,
        subject: emailContent.subject,
        text: emailContent.content,
      })

    res.status(201)
}))

router.post('/grab/actions/remove/:ref', authorizeUser, asyncHandler(async (req, res) => {
    const { ref } = req.params
    const { jwt } = req.body

    const { data: grab } = await client.query(
        q.Get(q.Ref(q.Collection('grabs'), ref))
    )

    if (grab.buyer.sub !== jwt.sub) {
        res.status(401).send('unauthorized')
        return
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

    res.status(204)
}))

router.post('/grab/actions/book/:ref', authorizeUser, asyncHandler(async (req, res) => {
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
        res.status(401).send('unauthorized')
        return
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
            emailContent = en.emailBook(buyerUser.locale,ref)
        case 'es':
            emailContent = es.emailBook(buyerUser.locale,ref)
        case 'pt':
            emailContent = pt.emailBook(buyerUser.locale,ref)
        case 'ru':travelerUser
            emailContent = ru.emailBook(buyerUser.locale,ref)
        default:
            emailContent = en.emailBook(buyerUser.locale,ref)
    }

    await transporter.sendMail({
        to: buyerUser.email,
        subject: emailContent.subject,
        text: emailContent.content,
    })

    res.status(201)
}))

router.post('/grab/actions/dispute/:ref', authorizeUser, asyncHandler(async (req, res) => {
    const { ref } = req.params
    const { jwt } = req.body

    const { data: grab } = await client.query(
        q.Get(q.Ref(q.Collection('grabs'), ref))
    )

    if ((grab.buyer.sub !== jwt.sub && grab.traveler.sub !== jwt.sub) ||
    (grab.status === 'published' || grab.status === 'released' || grab.status === 'withdrawn')) {
        res.status(401).send('unauthorized')
        return
    }

    const props = {
        status: 'disputed',
        disputed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dispute: {
            by: jwt.sub,
            status: 'open',
            attention_required: new Date().toISOString()
        },
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
            emailContent = en.emailDispute(userNotifyObject.locale,ref)
        case 'es':
            emailContent = es.emailDispute(userNotifyObject.locale,ref)
        case 'pt':
            emailContent = pt.emailDispute(userNotifyObject.locale,ref)
        case 'ru':
            emailContent = ru.emailDispute(userNotifyObject.locale,ref)
        default:
            emailContent = en.emailDispute(userNotifyObject.locale,ref)
    }

    await transporter.sendMail({
        to: userNotifyObject.email,
        subject: emailContent.subject,
        text: emailContent.content,
    })



    res.status(201)
}))

router.post('/grab/actions/bought/:ref', authorizeUser, asyncHandler(async (req, res) => {
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
            emailContent = en.emailBought(buyerUser.locale,ref)
        case 'es':
            emailContent = es.emailBought(buyerUser.locale,ref)
        case 'pt':
            emailContent = pt.emailBought(buyerUser.locale,ref)
        case 'ru':
            emailContent = ru.emailBought(buyerUser.locale,ref)
        default:
            emailContent = en.emailBought(buyerUser.locale,ref)
    }

    await transporter.sendMail({
        to: buyerUser.email,
        subject: emailContent.subject,
        text: emailContent.content,
    })

    res.status(201)
}))

router.post('/grab/actions/delivered/:ref', authorizeUser, asyncHandler(async (req, res) => {
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
            emailContent = en.emailDelivered(buyerUser.locale,ref)
        case 'es':
            emailContent = es.emailDelivered(buyerUser.locale,ref)
        case 'pt':
            emailContent = pt.emailDelivered(buyerUser.locale,ref)
        case 'ru':
            emailContent = ru.emailDelivered(buyerUser.locale,ref)
        default:
            emailContent = en.emailDelivered(buyerUser.locale,ref)
    }

    await transporter.sendMail({
        to: buyerUser.email,
        subject: emailContent.subject,
        text: emailContent.content,
    })

    res.status(201)
}))

router.post('/grab/actions/release/:ref', authorizeUser, asyncHandler(async (req, res) => {
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
            emailContent = en.emailReleased(travelerUser.locale,ref)
        case 'es':
            emailContent = es.emailReleased(travelerUser.locale,ref)
        case 'pt':
            emailContent = pt.emailReleased(travelerUser.locale,ref)
        case 'ru':
            emailContent = ru.emailReleased(travelerUser.locale,ref)
        default:
            emailContent = en.emailReleased(travelerUser.locale,ref)
    }

    await transporter.sendMail({
        to: travelerUser.email,
        subject: emailContent.subject,
        text: emailContent.content,
    })

    res.status(201)
}))

router.post('/grab/actions/withdraw/:ref', authorizeUser, asyncHandler(async (req, res) => {
    const { ref } = req.params
    const { jwt } = req.body
    const { type, address } = req.body

    const { data: grab } = await client.query(
        q.Get(q.Ref(q.Collection('grabs'), ref))
    )

    if ((grab.traveler.sub === jwt.sub && grab.status === 'released' && grab.withdrawn === false) || (grab.buyer.sub === jwt.sub && grab.status === 'refunded' && grab.withdrawn === false)) {
        const { data: rate } = await axios.get(`${baseUrl}/api/btc/rate/${grab.shop.currency}`)
        const btc_amount = Number(Math.round(parseFloat(grab.shop.price.total / rate.buy * 100000000 + 'e' + 0)) + 'e-' + 0)
        
        await opennode.initiateExchange({ to: 'btc', btc_amount })

        const withdraw = await opennode.initiateWithdrawalAsync({
            type,
            address,
            amount: btc_amount,
            callback_url: `${baseUrl}/api/btc/withdrawal/webhook`,
            exchange_rate: rate.buy
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

        res.status(200)
        return
    }
    res.status(401).send('unauthorized')
}))

module.exports = router