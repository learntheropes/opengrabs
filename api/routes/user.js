import axios from 'axios'
import asyncHandler from 'express-async-handler'
import { authorizeUser } from '../auth'
import { q, client } from '../db'
import { transporter } from '../email'
import * as en from '../email/en'
import * as es from '../email/es'
import * as pt from '../email/pt'
import * as ru from '../email/ru'
import { Router } from 'express'
import dotenv from 'dotenv'
dotenv.config()
const router = Router()

const getManagmentAccessToken = async () => {
  const { data: { access_token }} = await axios.post(`https://${process.env.AUTH0_TENANT}.us.auth0.com/oauth/token`, {
    client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    audience: `https://${process.env.AUTH0_TENANT}.us.auth0.com/api/v2/`,
    grant_type: 'client_credentials'
  }, {
    headers: {
      'content-type': 'application/json'
    }
  })
  return access_token
}
  
router.get('/db/user/get', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt } = req.body
  const sub = jwt.sub

  const exists = await client.query(
    q.Exists(
      q.Match(q.Index('user_by_sub'), sub)
    )
  )
  if (exists) {
    const { data: user } = await client.query(
      q.Get(
        q.Match(q.Index('user_by_sub'), sub)
      )
    )
    res.status(200).json(user)
    return
  } else {
    res.status(200).json({})
    return
  }
}))

router.post('/db/user/create', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt, locale } = req.body
  const sub = jwt.sub

  let strategy = jwt['https://opengrabs.com/strategy']
  if (!strategy) strategy = jwt.sub.split('|')[0]

  let props, email_verified, email
  switch (strategy) {
    case 'facebook':
      email = jwt['https://opengrabs.com/email']
      email_verified = jwt['https://opengrabs.com/verified']
      props = {
        sub: sub,
        email: email,
        email_verified: email_verified,
        strategy: 'facebook',
        locale: locale
      }
      break
    case 'oauth2':
      email = jwt['https://opengrabs.com/name']
      props = {
        sub: sub,
        email: email,
        email_verified: (email) ? true : false,
        strategy: 'vkontakte',
        locale: locale
      }
      break
    case 'email':
      email = jwt['https://opengrabs.com/name']
      email_verified = jwt['https://opengrabs.com/verified']
      props = {
        sub: sub,
        email: email,
        email_verified: email_verified,
        strategy: 'email',
        locale: locale
      }
  }

  const exists = await client.query(
    q.Exists(
      q.Match(q.Index('user_by_sub'), sub)
    )
  )

  if (!exists) {
    await client.query(
      q.Create(
        q.Collection('users'),
        { data: props }
      )
    )
    res.status(200).json(props)
    return
  } else {

    const { data: user } = await client.query(
      q.Get(
        q.Match(q.Index('user_by_sub'), sub)
      )
    )
    res.status(200).json(user)
    return
  }
}))

router.post('/db/user/update', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt, props } = req.body
  
  const { ref: {value: { id }}} = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )
  
  const { data: user } = await client.query(
    q.Update(
      q.Ref(q.Collection('users'), id),
      { data: props },
    )
  )

  res.status(200).json(user)
}))

router.post('/db/user/update/email', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt, props } = req.body

  props.email_verified = false
  props.code = Math.floor(100000 + Math.random() * 900000);
  
  const { ref: {value: { id }}} = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )
  
  const { data: user } = await client.query(
    q.Update(
      q.Ref(q.Collection('users'), id),
      { data: props },
    )
  )

  let emailContent
  switch (props.locale) {
    case 'en':
      emailContent = en.emailConfirmationCode(props.code)
    case 'es':
      emailContent = es.emailConfirmationCode(props.code)
    case 'pt':
      emailContent = pt.emailConfirmationCode(props.code)
    case 'ru':
      emailContent = ru.emailConfirmationCode(props.code)
    default:
      emailContent = en.emailConfirmationCode(props.code)
  }

  await transporter.sendMail({
    to: props.email,
    subject: emailContent.subject,
    text: emailContent.content,
  })

  res.status(200).json(user)
}))

router.post('/db/user/verify/:code', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const { code } = req.params
  
  const { data, ref: {value: { id }}} = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )

  if (data.code === parseInt(code)) {
    const { data: user} = await client.query(
      q.Update(
        q.Ref(q.Collection('users'), id),
        { data: { email_verified: true } },
      )
    )
    res.status(200).json(user)
    return
  } else {
    res.status(200).json({ error: 'invalid code'})
  }
}))

router.post('/db/user/update/username', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt, props } = req.body

  const exists = await client.query(
    q.Exists(
      q.Match(q.Index('user_by_username'), props.username)
    )
  )

  if (exists) {
    res.status(200).json({ error: 'Username already in use'})
    return
  }

  const { ref: {value: { id }}} = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )

  const { data: user} = await client.query(
    q.Update(
      q.Ref(q.Collection('users'), id),
      { data: props },
    )
  )

  const access_token = await getManagmentAccessToken()

  const { data: { user_metadata: { username }}} = await axios.get(`https://${process.env.AUTH0_TENANT}.us.auth0.com/api/v2/users/${jwt.sub}`, {
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }
  })

  if (!username) {
    const { data } = await axios.patch(`https://${process.env.AUTH0_TENANT}.us.auth0.com/api/v2/users/${jwt.sub}`, {
      user_metadata: { username: props.username }
    }, {
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    })
  } else {
    res.status(200).json({ error: "You can't change username"})
    return
  }

  res.status(200).json(user)
}))

router.post('/user/management/lang', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt, lang } = req.body

  const access_token = await getManagmentAccessToken()

  const { data } = await axios.patch(`https://${process.env.AUTH0_TENANT}.us.auth0.com/api/v2/users/${jwt.sub}`, {
    user_metadata: { lang }
  }, {
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }
  })

  res.status(200).json(data)
}))

router.get('/crypto/sha256', authorizeUser, asyncHandler(async (req,res) => {
  const { jwt } = req.body
  const { data: user } = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )
  const hmac = crypto.createHmac('sha256', process.env.TAWK_API_KEY)
  hmac.update(user.email)
  const hash = hmac.digest('hex')
  res.status(200).json({ hash })
}))

module.exports = router
  