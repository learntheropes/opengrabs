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
        path: path,
        transformation : [{
            "height": "200"
        }],
        signed: true,
        expireSeconds: 300
    })
}

export const getImageKitModal = (path, width) => {
    return imagekit.url({
        path: path,
        transformation : [{
            "width": width
        }],
        signed: true,
        expireSeconds: 300
    })
}

export const getImageKitOriginal = (path) => {
    return imagekit.url({
        path: path,
        signed: true,
        expireSeconds: 60
    }) 
}