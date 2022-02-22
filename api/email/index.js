import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()

const domain = (process.env.URL) ? process.env.URL : 'testnet.opengrabs.com'
const from = (process.env.URL === 'opengrabs.com') ? `"OpenGrabs" <no-reply@${domain}>` : `"OpenGrabs Testnet" <no-reply@${domain}>`

export let transporter = nodemailer.createTransport({
    host: "smtp.migadu.com",
    port: 465,
    secure: true,
    auth: {
      user: `no-reply@${domain}`,
      pass: process.env.MIGADU_PASSWORD,
    }
  }, {
    from: from,
  })
