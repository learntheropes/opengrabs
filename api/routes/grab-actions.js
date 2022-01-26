import asyncHandler from 'express-async-handler'
import { authorizeUser } from '../auth'
import { q, client } from '../db'
import opennode from '../btc'
import { Router } from 'express'
import axios from 'axios'
const router = Router()
import dotenv from 'dotenv'
dotenv.config()
const baseUrl = process.env.URL ? process.env.URL : 'https://localhost:3000'

const saveUserData = async (req) => {
    const { jwt } = req.body

    const { data: user } = await axios.get(`https://${process.env.AUTH0_TENANT}.us.auth0.com/userinfo`, {
        headers: {
            Authorization: req.header('Authorization')
        }
    })

    let strategy = jwt['https://opengrabs.com/strategy']
    if (!strategy) strategy = jwt.sub.split('|')[0]

    let props
    switch (strategy) {
        case 'facebook':
            props = {
                sub: jwt.sub,
                email: user.email,
                name: user.name
            }
            break
        case 'vkontakte':
            props = {
                sub: jwt.sub,
                email: user.email,
                name: `${user.given_name} ${user.family_name}`.replaceAll('-', ' ')
            }
            break
        }

    const exists = await client.query(
        q.Exists(
            q.Match(q.Index('user_by_sub'), jwt.sub)
        )
    )

    if (!exists) {
        await client.query(
            q.Create(
                q.Collection('users'),
                { data: props }
            )
        )
    }

    return props
}


router.post('/grab/actions/publish', authorizeUser, asyncHandler(async (req, res) => {

    const { jwt } = req.body
    const { shop, destination } = req.body

    const user = await saveUserData(req)

    const props = {
        status: 'published',
        adv: 'order',
        shop,
        destination,
        buyer: {
            sub: jwt.sub,
            name: user.name
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

    res.status(201).json({ id })
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

    res.status(204).json(response)
}))

router.post('/grab/actions/book/:ref', authorizeUser, asyncHandler(async (req, res) => {
    const { ref } = req.params
    const { jwt } = req.body
    const { delivery_date } = req.body
    
    const { data: grab } = await client.query(
        q.Get(q.Ref(q.Collection('grabs'), ref))
    )

    if (grab.status !== 'published') {
        res.status(401).send('unauthorized')
        return
    }    

    const user = await saveUserData(req)

    const props = {
        status: 'booked',
        traveler: {
            sub: jwt.sub,
            name: user.name,
        },
        delivery: {
            date: delivery_date,
        },
        booked_at: new Date().toISOString(),
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
                content: 'booked',
                grab_id: ref,
                user_sub: 'admin|0',
            }}
        )
    )

    res.status(201).json(response)
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

    res.status(201).json(response)
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

    res.status(201).json(response)
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

    res.status(201).json(response)
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

    res.status(201).json(response)
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

        const exchange = {
            rate: rate.buy
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
            exchange,
            withdraw
        }

        await client.query(
            q.Update(
                q.Ref(q.Collection('grabs'), ref),
                { data: props },
            )
        )

        res.status(200).json(withdraw)
        return
    }
    res.status(401).send('unauthorized')
}))

module.exports = router