<template>
    <section class="section container">
        <h1 class="title">{{ username }}</h1>
        <p class="subtitle is-3"><b-rate v-model="average" size="is-large" disabled></b-rate></p>
        <div v-if="reviews.length === 0">{{ $t('noReviewsYet')}}</div>
        <div v-for="review in reviews" v-else :key="review.grab_id" class="block">
            <p class="title is-3">{{ $t('reviewBy') }} {{review.reviewer_username}} {{ $t('publishedAt') }} {{ $moment(review.posted_at).fromNow() }}</p>
            <p class="subtitle is-5"><b-rate v-model="review.rate" disabled></b-rate></p>
            <p>{{ review.content }}</p>
        </div>
    </section>
</template>

<script>
export default {
    auth: false,
    name: 'User',
    async asyncData({ app, params: { username }}) {
        console.log(username)
        const reviews = await app.$reviews.filter(username)
        const sum = reviews.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue.rate
        }, 0)
        const average = sum / reviews.length
        return { username, average, reviews }
    }
}
</script>
