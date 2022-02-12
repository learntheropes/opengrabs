import axios from 'axios'
import crypto from 'crypto'
import HttpsProxyAgent from "https-proxy-agent"
import dotenv from 'dotenv'
dotenv.config()

const httpsAgent = new HttpsProxyAgent({host: `${process.env.FIXIE_SUBDOMAIN}.usefixie.com`, port: '80', auth: `fixie:${process.env.FIXIE_PASSWORD}`})

class OpenNodeClient {
    constructor() {
        this.version = (process.env.BTC_CHAIN === 'test3') ? 'testnet.opengrabs.com' : 'opengrabs.com'
        this.api_key_invoice = process.env.OPENNODE_API_KEY_INVOICE
        this.api_key_withdrawal = process.env.OPENNODE_API_KEY_WITHDRAWAL
        this.baseUrl = (process.env.BTC_CHAIN === 'test3') ? 'https://dev-api.opennode.com' : 'https://api.opennode.com'
        this.instance = axios.create()
        this.instance.defaults.baseURL = this.baseUrl
        this.instance.defaults.timeout = 15000
        this.instance.defaults.headers = { 'Authorization': this.api_key_invoice, 'user_agent': this.version }
        this.proxyInstance = axios.create({ httpsAgent })
        this.proxyInstance.defaults.baseURL = this.baseUrl
        this.proxyInstance.defaults.timeout = 15000
        this.proxyInstance.defaults.headers = { 'Authorization': this.api_key_withdrawal, 'user_agent': this.version }
    }

    async createCharge({ amount, description, currency, order_id, callback_url, auto_settle, ttl = 10 }) {
        try {

            const { data }  = await this.instance.post(`/v1/charges`, { amount, description, currency, order_id, callback_url, auto_settle, ttl })
            return data.data;

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async listPaidCharges({ page, pageSize, search }) {
        try {

            const { data } = await this.instance.get('/v2/charges', { params: { page, pageSize, search }})
            return data.data

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async chargeInfo(id) {
        try {

            const { data } = await this.instance.get(`/v1/charge/${id}`)
            return data.data;

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async decodeCharge(pay_req) {
        try {

            const { data } = await this.instance.post(`/v1/charge/decode`, { pay_req })
            return data.data;

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async createRefund({ checkout_id, address, email }) {
        try {

            const { data } = await this.instance.post('/v1/refunds', { checkout_id, address, email })
            return data.data

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async listRefunds() {
        try {

            const { data } = await this.instance.get('/v1/refunds')
            return data.data

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async refundInfo(id) {
        try {

            const { data } = await this.instance.get(`/v1/refund/${id}`)
            return data.data;

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }        
    }

    async initiateWithdrawalAsync({ type, amount, address, callback_url }) {
        try {
            const { data } = await this.proxyInstance.post('/v2/withdrawals', { type, amount, address, callback_url })
            return data.data;

        }
        catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async listWithdrawals({ page, pageSize, search }) {
        try {
    
            const { data } = await this.instance.get(`/v2/withdrawals`, { params: { page, pageSize, search }})
            return data.data;
    
        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message);
        }
    }

    async withdrawalInfo(id) {
        try {

            const { data } = await this.instance.get(`/v1/withdrawal/${id}`)
            return data.data;

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async initiateLnUrlWithdrawal({ min_amt, max_amt, callback_url, external_id, expiry_date }) {
        try {

            const { data } = await this.proxyInstance.post(`/v2/lnurl-withdrawal`, { min_amt, max_amt, callback_url, external_id, expiry_date })
            return data.data

        }
        catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async accountBalance() {
        try {

            const { data } = await this.instance.get(`/v1/account/balance`)
            return data.data

        }
        catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async listActivity({ page, pageSize, search, type }) {
        try {

            const { data } = await this.instance.get('/v2/activities', { params: { page, pageSize, search, type }})
            return data.data

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async setScheduledBankWithdrawals({ status = false}) {
        try {

            const { data } = await this.proxyInstance.post('/v2/withdrawals/bank/scheduled', { status })
            return data.data

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async listExchangeRates() {
        try {

            const { data } = await this.instance.get(`/v1/rates`)
            return data.data;

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async listCurrencies() {
        try {

            const { data } = await this.instance.get(`/v1/currencies`)
            return data.data;

        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    async initiateExchange({ to, fiat_amount, btc_amount }) {
        try {
            const { data } = await this.proxyInstance.post('/v2/exchanges', { to, fiat_amount, btc_amount })
            return data.data
        } catch (error) {
            return Exception(error.response.status, error.response.statusText, error.response.data.message)
        }
    }

    verifySignature(charge) {
        const hash = crypto.createHmac('sha256', this.api_key_invoice).update(charge.id).digest('hex')
        return hash === charge.hashed_order
    }

    verifyProxySignature(withdrawal) {
        const hash = crypto.createHmac('sha256', this.api_key_withdrawal).update(withdrawal.id).digest('hex')
        return hash === withdrawal.hashed_order
    }
}

function Exception(statusCode, statusText, message) {
    let error = {}
    error.name = statusText
    error.status = statusCode
    error.message = message
    return error
}


module.exports = OpenNodeClient