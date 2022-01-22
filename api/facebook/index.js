import * as base64url from 'base64-url'
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

export default function parseSignedRequest (req, res, next) {
    const signedRequest = getSignedRequest(req)
    const [signature, payload] = getSignatureAndPayloadFromSignedRequest(signedRequest)
    validateSignature(signature, payload)
    replaceBodyWithDecodedPayload(req, payload)
    next()
}

function getSignedRequest (req) {
  return getOrThrowClientError(req, 'body', 'signed_request')
}

function getSignatureAndPayloadFromSignedRequest (signedRequest) {
  const [encodedSignature, payload] = signedRequest.split('.', 2)
  if (encodedSignature == null || payload == null) {
    const error = new Error('Signed request has invalid format')
    error.code = 400
    throw error;
  }
  const signature = decodeSignature(encodedSignature)
  return [signature, payload]
}

function replaceBodyWithDecodedPayload (req, payload) {
  const body = decodePayload(payload)
  req.body = body
}

function validateSignature (actualSignature, payload) {
  const expectedSignature = getExpectedSignature(payload)
  // For some reason, the actual signature always has a '=' appended
  const actualSignatureWithEqualsSign = actualSignature + '='
  if (actualSignatureWithEqualsSign !== expectedSignature) {
    const error = new Error('Invalid signature')
    error.code = 401
    throw error;
  }
}

function decodeSignature (encodedSignature) {
  return urlDecode(encodedSignature)
}

function decodePayload (payload) {
  const bodyJson = base64url.decode(urlDecode(payload))
  try {
    return JSON.parse(bodyJson)
  } catch (error) {
    error.code = 400
    throw error
  }
}

function urlDecode (string) {
  return string.replace(/-/g, '+').replace(/_/g, '/')
}

function getExpectedSignature (payload) {
  const hmac = crypto.createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
  hmac.update(payload)
  return hmac.digest('base64')
}

function getOrThrowClientError (req, type, key) {
  const getError = () => {
    throw new Error(`Missing ${type} parameter '${key}'`)
  }
  let array
  switch (type) {
    case 'query':
      array = req.query
      break
    case 'body':
      array = req.body
      break
    default:
      throw new Error(`Unknown type: ${type}`)
  }
  if (!(key in array)) {
    throw getError()
  }
  const value = array[key]
  if (value == null) {
    throw getError()
  }
  return value
}