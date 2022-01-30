import asyncHandler from 'express-async-handler'
import { authorizeUser } from '../auth'
import { q, client } from '../db'
import { transporter } from '../email'
import * as en from '../email/en'
import * as es from '../email/es'
import * as pt from '../email/pt'
import * as ru from '../email/ru'
import { Router } from 'express'
const router = Router()
  
router.post('/db/user/create', authorizeUser, asyncHandler(async (req, res) => {
  const { jwt, locale } = req.body
  const sub = jwt.sub

  let strategy = jwt['https://opengrabs.com/strategy']
  if (!strategy) strategy = jwt.sub.split('|')[0]

  const email = jwt['https://opengrabs.com/email']

  let props
  switch (strategy) {
    case 'facebook':
      const name = jwt['https://opengrabs.com/name']
      const verifed = jwt['https://opengrabs.com/verified']
      props = {
        sub: sub,
        email: email,
        verified: verifed,
        name: name,
        locale: locale
      }
      break
    case 'vkontakte':
      const given_name = jwt['https://opengrabs.com/given_name']
      const family_name = jwt['https://opengrabs.com/family_name']
      props = {
        sub: sub,
        email: email,
        verified: (email) ? true : false,
        name: `${given_name} ${family_name}`.replace(/-/g, ' '),
        locale: locale
      }
      break
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
  props.verified = false
  props.code = Math.floor(100000 + Math.random() * 900000);
  
  const { data: user, ref: {value: { id }}} = await client.query(
    q.Get(
      q.Match(q.Index('user_by_sub'), jwt.sub)
    )
  )
  
  await client.query(
    q.Update(
      q.Ref(q.Collection('users'), id),
      { data: props },
    )
  )

  let emailContent
  switch (user.locale) {
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

  res.status(200).json({})
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
        { data: { verified: true } },
      )
    )
    res.status(200).json(user)
    return
  } else {
    res.status(200).json({ error: 'invalid code'})
  }
}))

module.exports = router
  