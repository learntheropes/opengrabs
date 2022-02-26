import { imagekit } from '../image'
import { Router } from 'express'
const router = Router()

router.post('/image/signature', (req,res) => {
  const { signature, token, expire } = imagekit.getAuthenticationParameters()
  res.status(200).json({ signature, token, expire })
})

// Test code for imagekit support

const path = "/testnet/grabs/6f02cb4126aa1ae5a40504a836cb83ef_nB8g6vw-_.png"

const getImageKitWorking = () => {

  const text = 'testnet.opengrabs.com'
  const buff = new Buffer.from(text)
  const base64text = buff.toString('base64')

  return imagekit.url({
    path,
    transformation : [{
      width: "800",
      ofo: "center",
      ote: base64text,
      otc: "00000066",
      otbg: "62616066",
      or: "10"
    }],
    signed: true,
    expireSeconds: 300
  })
}

const getImageKitNotWorking = () => {

  const text = 'opengrabs.com'
  const buff = new Buffer.from(text)
  const base64text = buff.toString('base64')

  return imagekit.url({
    path,
    transformation : [{
      width: "800",
      ofo: "center",
      ote: base64text,
      otc: "00000066",
      otbg: "62616066",
      or: "10"
    }],
    signed: true,
    expireSeconds: 300
  })
}

router.get('/image/test', (req,res) => {

  res.set('Content-Type', 'text/html')
  res.send(Buffer.from(`
<h1>Not Working: </h1><pre>` + getImageKitNotWorking() + `</pre><br>
<img src="` + getImageKitNotWorking() + `" ><br>
<h1>Working: </h1><pre>` + getImageKitWorking() + `</pre><br>
<img src="` + getImageKitWorking() + `" ><br>
`))
})

module.exports = router