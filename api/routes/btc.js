import asyncHandler from 'express-async-handler'
import { authorizeUser, authorizeAdmin } from '../auth'
import { q, client } from '../db'
import opennode from '../btc'
import { Router } from 'express'
const router = Router()
import dotenv from 'dotenv'
dotenv.config()

const network = (process.env.BTC_CHAIN === 'test3') ? 'dev' : 'live'

opennode.setCredentials(network)

router.get('/btc/charge-info/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const response = await opennode.chargeInfo(id)
  res.status(200).json(response)
}))

router.post('/btc/create-charge/:ref', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body
  const { amount, order_id, description, callback_url, auto_settle, exchange_rate } = req.body
  const { ref } = req.params

  const grab = await client.query(
    q.Get(q.Ref(q.Collection('grabs'), ref))
  )

  if (jwt.sub !== grab.data.buyer.sub) {
    res.status(401).send('unauthorized')
    return
  }

  const response = await opennode.createCharge({
    amount,
    order_id,
    description,
    callback_url,
    auto_settle
  })
  response.fiat_value = null

  const props = {
    payment: {
      exchange_rate
    }
  }

  await client.query(
    q.Update(
      q.Ref(q.Collection('grabs'), order_id),
      { data: props },
    )
  )

  res.status(201).json(response)
}))

router.post('/btc/charge/webhook', asyncHandler(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  const verified = opennode.verifySignature(req.body)

  if (verified) {
    await client.query(
      q.Create(
        q.Collection('charge_webhooks'),
        { data: req.body },
      )
    )
    if (req.body.status === 'paid' || req.body.status === 'underpaid') {
      await client.query(
        q.Update(
          q.Ref(q.Collection('grabs'), req.body.order_id),
          { data: {
            status: req.body.status,
            charge: req.body,
            paid_at: new Date().toISOString()
          }},
        )
      )

      await client.query(
        q.Create(
            q.Collection('messages'),
            { data: {
                posted_at: new Date().toISOString(),
                content: 'paid',
                grab_id: req.body.order_id,
                user_sub: 'admin|0',
            }}
        )
    )
    }

    res.status(200).json({})
    return
    
  } else {
    res.status(401).send('unauthorized')
    return
  }
}))

router.post('/btc/withdrawal/webhook', asyncHandler(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  const verified = opennode.verifyProxySignature(req.body)
  if (verified) {
    await client.query(
      q.Create(
        q.Collection('withdrawal_webhooks'),
        { data: req.body },
      )
    )

    const withdraw_status = (req.body.status === 'confirmed') ? true : false

    const { ref: { value: { id }}} = await client.query(
      q.Update(
        q.Select(['ref'], q.Get(q.Match( q.Index("grab_by_withdraw_id"), req.body.id))),
        { data: { 
          withdrawn: withdraw_status,
          withdraw: req.body,
        }}
      )
    )

    await client.query(
      q.Create(
          q.Collection('messages'),
          { data: {
              posted_at: new Date().toISOString(),
              content: 'withdrawn',
              grab_id: id,
              user_sub: 'admin|0',
          }}
      )
  )

    res.status(200).json({})
    return
  } else {
    res.status(401).send('unauthorized')
    return
  }
}))

router.get('/btc/rates', asyncHandler(async (req, res) => {
  let rates = {}
  let response = await opennode.listExchangeRates()
  Object.keys(response).forEach(pair => {
    Object.keys(response[pair]).forEach(currency => {
      if (currency !== 'currency' && currency !== 'BTC') {
        rates[currency] = {
          buy: Number(Math.round(parseFloat(response[pair][currency] * 1.01 + 'e' + 2)) + 'e-' + 2),
          sell: Number(Math.round(parseFloat(response[pair][currency] - (response[pair][currency] * 0.01) + 'e' + 2)) + 'e-' + 2) 
        }
      }
    })
  })
  res.status(200).json(rates)
}))

router.get('/btc/rate/:currency', asyncHandler(async (req, res) => {
  const { currency } = req.params
  let rates = {}
  let response = await opennode.listExchangeRates()
  Object.keys(response).forEach(pair => {
    Object.keys(response[pair]).forEach(currency => {
      if (currency !== 'currency' && currency !== 'BTC') {
        rates[currency] = {
          buy: Number(Math.round(parseFloat(response[pair][currency] * 1.01 + 'e' + 2)) + 'e-' + 2),
          sell: Number(Math.round(parseFloat(response[pair][currency] - (response[pair][currency] * 0.01) + 'e' + 2)) + 'e-' + 2) 
        }
      }
    })
  })
  const rate = rates[currency]
  res.status(200).json(rate)
}))

router.get('/btc/rates/:currencies', asyncHandler(async (req, res) => {
  const { currencies } = req.params
  const currenciesArray = currencies.split(',')
  let rates = {}
  let response = await opennode.listExchangeRates()
  Object.keys(response).forEach(pair => {
    Object.keys(response[pair]).forEach(currency => {
      if (currency !== 'currency' && currency !== 'BTC') {
        rates[currency] = {
          buy: Number(Math.round(parseFloat(response[pair][currency] * 1.01 + 'e' + 2)) + 'e-' + 2),
          sell: Number(Math.round(parseFloat(response[pair][currency] - (response[pair][currency] * 0.01) + 'e' + 2)) + 'e-' + 2) 
        }
      }
    })
  })
  let final = []
  currenciesArray.forEach(curr => {
    const temp = rates[curr]
    temp.currency = curr
    final.push(temp)
  })

  res.status(200).json(final)
}))

router.get('/btc/account-balance',  authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const response = await opennode.accountBalance()
  res.status(200).json(response)
}))

router.get('/btc/list-activity',  authorizeUser, authorizeAdmin, asyncHandler(async (req, res) => {
  const response = await opennode.listActivity(req.query)
  res.status(200).json(response)
}))

router.post('/btc/initiate-exchange', authorizeUser, asyncHandler(async (req, res) => {
  const { to, btc_amount, grab_id, user_id } = req.body
  const grab = await client.query(
    q.Get(q.Ref(q.Collection(collection), grab_id))
  )
  if (grab.status !== 'released' || user_id !== grab.traveler.id) {
    res.status(401).send('unauthorized')
    return
  }
  const response = await opennode.initiateExchange({ to, btc_amount })
  res.status(200).json(response)
}))

router.post('/btc/initiate-withdrawal', authorizeUser, asyncHandler(async (req, res) => {
  const { type, amount, address, callback_url, grab_id, user_id } = req.body
  const grab = await client.query(
    q.Get(q.Ref(q.Collection(collection), grab_id))
  )
  if (grab.status !== 'released' || user_id !== grab.traveler.id) {
    res.status(401).send('unauthorized')
    return
  }
  const response = await opennode.initiateWithdrawalAsync({ type, amount, address, callback_url })
  res.status(200).json(response)
}))

router.post('/btc/initiate-lnuri-withdrawal', authorizeUser, asyncHandler(async (req, res) => {
  const { min_amt, max_amt, callback_url, external_id, expiry_date, grab_id, user_id } = req.body
  const grab = await client.query(
    q.Get(q.Ref(q.Collection(collection), grab_id))
  )
  if (grab.status !== 'released' || user_id !== grab.traveler.id) {
    res.status(401).send('unauthorized')
    return
  }
  const response = await opennode.initiateLnUrlWithdrawal({ min_amt, max_amt, callback_url, external_id, expiry_date })
  res.status(200).json(response)
}))

module.exports = router