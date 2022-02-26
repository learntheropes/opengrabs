import { imagekit } from '../image'
import { Router } from 'express'
const router = Router()

router.post('/image/signature', (req,res) => {
  const { signature, token, expire } = imagekit.getAuthenticationParameters()
  res.status(200).json({ signature, token, expire })
})

// Test code for imagekit support

const path = "/testnet/grabs/6f02cb4126aa1ae5a40504a836cb83ef_nB8g6vw-_.png"

const notWorkingTextWatermark = 'opengrabs.com'

const getNotWorkingBase64Watermark = () => {
  const text = notWorkingTextWatermark
  const buff = new Buffer.from(text)
  const base64text = buff.toString('base64')
  return base64text
}

const getImageKitNotWorking = () => {
  return imagekit.url({
    path,
    transformation : [{
      width: "400",
      ofo: "center",
      ote: getNotWorkingBase64Watermark(),
      otc: "00000066",
      otbg: "62616066",
      or: "10"
    }],
    signed: true,
    expireSeconds: 300
  })
}

const workingTextWatermark = 'testnet.opengrabs.com'

const getWorkingBase64Watermark = () => {
  const text = workingTextWatermark
  const buff = new Buffer.from(text)
  const base64text = buff.toString('base64')
  return base64text
}

const getImageKitWorking = () => {
  return imagekit.url({
    path,
    transformation : [{
      width: "400",
      ofo: "center",
      ote: getWorkingBase64Watermark(),
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
<h1>Not Found</h1>
<p>Not Found Watermark: </p><pre>` + notWorkingTextWatermark + `</pre></br>
<p>Not Found base64 Watermark: </p><pre>` + getNotWorkingBase64Watermark() + `</pre></br>
<p>Not Found Url: </p><pre>` + getImageKitNotWorking() + `</pre><br>
<img src="` + getImageKitNotWorking() + `" ><br><br>
<h1>Working</h1>
<p>Working Watermark: </p><pre>` + workingTextWatermark + `</pre></br>
<p>Working base64 Watermark: </p><pre>` + getWorkingBase64Watermark() + `</pre></br>
<p>Working Url: </p><pre>` + getImageKitWorking() + `</pre><br>
<img src="` + getImageKitWorking() + `" ><br>
`))
})

module.exports = router