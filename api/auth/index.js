import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import dotenv from 'dotenv'
dotenv.config()

export const authorizeUser = (req, res, next) => {

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.AUTH0_SIGNING_CERTIFICATE, { algorithms: ['RS256'] }, (err, decoded) => {

    if (err) return res.sendStatus(403)

    req.body.jwt = decoded

    next()
  })
}

export const authorizeAdmin = asyncHandler(async (req, res, next) => {
  const { jwt } = req.body
  const isAdmin = jwt['https://opengrabs.com/roles'].includes('admin')
  if (!isAdmin) {
    return res.status(401).send('unauthorized')
  }
  next()
})

export const authorizeDispute = asyncHandler(async (req, res, next) => {
  const { jwt } = req.body
  const isResolveDispute = jwt['https://opengrabs.com/roles'].includes('resolve_dispute')
  if (!isResolveDispute) {
    return res.status(401).send('unauthorized')
  }
  next()
})

export const authorizeRefund = asyncHandler(async (req, res, next) => {
  const { jwt } = req.body
  const isProcessRefund = jwt['https://opengrabs.com/roles'].includes('process_refund')
  if (!isProcessRefund) {
    return res.status(401).send('unauthorized')
  }
  next()
})
