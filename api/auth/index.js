import axios from 'axios'
import asyncHandler from 'express-async-handler'
import { allowOrigin } from '../lambda'
import jwt_decode from "jwt-decode";
import dotenv from 'dotenv'
dotenv.config()

export const authorizeUser = asyncHandler(async (req, res, next) => {
  res.set('Access-Control-Allow-Origin', allowOrigin)
  const bearer = req.header('Authorization')
  if (!bearer) {
    res.status(401).send('unauthorized')
    return    
  }
  const authorization = bearer.replace('Bearer ', '')
  const jwt = jwt_decode(authorization)
  if (!jwt) {
    res.status(401).send('unauthorized')
    return
  }
  if (!jwt.sub || Date.now() / 1000 > jwt.exp || jwt.iss !== `https://${process.env.AUTH0_TENANT}.us.auth0.com/`) {
    res.status(401).send('unauthorized')
    return    
  }
  req.body.jwt = jwt
  next()
})

export const authorizeAdmin = asyncHandler(async (req, res, next) => {
  const { jwt } = req.body
  const isAdmin = jwt['https://opengrabs.com/roles'].includes('admin')
  if (!isAdmin) {
    res.status(401).send('unauthorized')
    return 
  }
  next()
})

export const authorizeDispute = asyncHandler(async (req, res, next) => {
  const { jwt } = req.body
  const isAdmin = jwt['https://opengrabs.com/roles'].includes('resolve_dispute')
  if (!isAdmin) {
    res.status(401).send('unauthorized')
    return 
  }
  next()
})
