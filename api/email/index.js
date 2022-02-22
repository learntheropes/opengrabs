import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()

const domain = (process.env.URL) ? process.env.URL : 'testnet.opengrabs.com'

export let transporter = nodemailer.createTransport({
    host: "smtp.migadu.com",
    port: 465,
    secure: true,
    auth: {
      user: `no-reply@${domain}`,
      pass: process.env.MIGADU_PASSWORD,
    }
  }, {
    from: `"OpenGrabs" <no-reply@${domain}>`,
  })
