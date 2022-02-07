import asyncHandler from 'express-async-handler'
import { q, client } from '../db'
import { Router } from 'express'
const router = Router()

router.get('/db/reviews/get/:username', asyncHandler (async (req,res) => {
    const { username } = req.params

    const { data } = await client.query(
        q.Paginate(
            q.Match(q.Index('reviews_by_username'), username),
            { size: 100000 }
        )
    )

    const reviews = data.map(({ data, ref: { value: { id }}}) => {
        data.ref = id
        return data
    })
    
    res.status(200).json(reviews)
}))
module.exports = router