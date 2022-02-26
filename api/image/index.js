import ImageKit from "imagekit"
import dotenv from 'dotenv'
dotenv.config()

export const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : 'https://ik.imagekit.io/opengrabs'
})

export const getImageKitPreview = (path) => {
    return imagekit.url({
        path,
        transformation : [{
            height: "200"
        }],
        signed: true,
        expireSeconds: 300
    })
}

export const getImageKitModal = (path, width) => {

    const text = process.env.URL || 'testnet.opengrabs.com'
    const buff = new Buffer.from(text)
    const base64text = buff.toString('base64')

    // const data = await imagekit.listFiles({
    //     limit: 1,
    //     name: path.split('/')[3]
    // })

    return imagekit.url({
        path,
        transformation : [{
            width: width,
            ofo: "center",
            ote: base64text,
            otc: "00000066",
            otbg: "62616066", // 7957d5
            or: "10"
        }],
        signed: true,
        expireSeconds: 300
    })
}

export const getImageKitOriginal = (path) => {
    return imagekit.url({
        path,
        signed: true,
        expireSeconds: 60
    }) 
}
