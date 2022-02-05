import OpenNodeClient from './client'
let openNode = undefined


const setCredentials = () => {
  if (openNode !== undefined) return
  openNode = new OpenNodeClient()
}

const createCharge = async({ amount, description, currency, order_id, callback_url, auto_settle, ttl = 10 }) => {
  return await openNode.createCharge({ amount, description, currency, order_id, callback_url, auto_settle, ttl });
}

const listPaidCharges = async ({ page, pageSize, search }) => {
  return await openNode.listPaidCharges({ page, pageSize, search })
}

const chargeInfo = async (id) => {
  return await openNode.chargeInfo(id)
}

const decodeCharge = async (pay_req) => {
  return await openNode.decodeCharge(pay_req)
}

const createRefund = async ({ checkout_id, address, email }) => {
  return await openNode.createRefund({ checkout_id, address, email })
}

const listRefunds = async () => {
  return await openNode.listRefunds()
}

const refundInfo = async (id) => {
  return await openNode.refundInfo(id)
}

const initiateWithdrawalAsync = async ({ type, amount, address, callback_url }) => {
  return await openNode.initiateWithdrawalAsync({ type, amount, address, callback_url })
}

const listWithdrawals = async ({ page, pageSize, search }) => {
  return await openNode.listWithdrawals({ page, pageSize, search })
}

const withdrawalInfo = async (id) => {
  return await openNode.withdrawalInfo(id)
}

const initiateLnUrlWithdrawal = async ({ min_amt, max_amt, callback_url, external_id, expiry_date }) => {
  return await openNode.initiateLnUrlWithdrawal({ min_amt, max_amt, callback_url, external_id, expiry_date })
}

const accountBalance = async () => {
  return await openNode.accountBalance()
}

const listActivity = async ({ page, pageSize, search, type }) => {
  return await openNode.listActivity({ page, pageSize, search, type })
}

const setScheduledBankWithdrawals = async ({ status }) => {
  return await openNode.setScheduledBankWithdrawals({ status })
}

const listExchangeRates = async () => {
  return await openNode.listExchangeRates()
}

const listCurrencies = async () => {
  return await openNode.listCurrencies()
}

const initiateExchange = async ({ to, fiat_amount, btc_amount }) => {
  return await openNode.initiateExchange({ to, fiat_amount, btc_amount })
}

const verifySignature = (charge) => {
  return openNode.verifySignature(charge)
}

const verifyProxySignature = (withdrawal) => {
  return openNode.verifyProxySignature(withdrawal)
}

module.exports = {
  setCredentials,
  createCharge,
  listPaidCharges,
  chargeInfo,
  decodeCharge,
  createRefund,
  listRefunds,
  refundInfo,
  initiateWithdrawalAsync,
  listWithdrawals,
  withdrawalInfo,
  initiateLnUrlWithdrawal,
  accountBalance,
  listActivity,
  setScheduledBankWithdrawals,
  listExchangeRates,
  listCurrencies,
  initiateExchange,
  verifySignature,
  verifyProxySignature
}