import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const baseUrl = 'https://maps.googleapis.com/maps/api/place'

const getPhotoReference = async (input) => {
    // https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Chicago, IL&key=API_KEY&inputtype=textquery&fields=name,photos
    const { data } = await axios.get(`${baseUrl}/findplacefromtext/json`, {
        params: {
            input,
            key: process.env.GOOGLE_MAP_API_KEY,
            inputtype: 'textquery',
            fields: 'photos'
        }
    })
    return data.candidates[0].photos[0].photo_reference
}

const getPhoto = async (photoreference) => {
    // https://maps.googleapis.com/maps/api/place/photo?photoreference=PHOTO_REF&key=API_KEY&maxwidth=400&maxheight=400
    const response = await axios.get(`${baseUrl}/photo`, {
        params: {
            photoreference,
            key: process.env.GOOGLE_MAP_API_KEY,
            maxwidth: 400,
            maxheight: 400            
        }
    })
    return response.request._redirectable._options.href
}

export default async (input) => {
    const photoreference = await getPhotoReference(input)
    const url = await getPhoto(photoreference)
    return url
}