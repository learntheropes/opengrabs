import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()

export let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 465,
    secure: true,
    auth: {
      user: 'no-reply@opengrabs.com',
      pass: process.env.MIGADU_PASSWORD,
    },
  })
