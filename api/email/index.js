import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()

export let transporter = nodemailer.createTransport({
    host: "smtp.migadu.com",
    port: 465,
    secure: true,
    auth: {
      user: 'no-reply@opengrabs.com',
      pass: process.env.MIGADU_PASSWORD,
    }
  }, {
    from: '"OpenGrabs" <no-reply@opengrabs.com>',
  })
