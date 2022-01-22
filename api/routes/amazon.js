import asyncHandler from 'express-async-handler'
import { authorizeUser } from '../auth'
import puppeteer from 'puppeteer-core'
import { getAttributes } from '../amazon'
import dotenv from 'dotenv'
dotenv.config()
import { Router } from 'express'
const router = Router()

router.get('/amazon/:domain/:asin', authorizeUser, asyncHandler(async(req, res) => {
    const { domain, asin } = req.params
    const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_KEY}`
    })
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8' })
    await page.goto(`https://www.amazon.${domain}/dp/${asin}`, {timeout: 10000})
    const specifications = await getAttributes(page)
    await page.close()
    await browser.close()
    res.json({ specifications })
}))

module.exports = router
