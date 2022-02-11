<template>
    <section class="section container">
        <h1 class="title">{{ username }}</h1>
        <p class="subtitle is-3"><b-rate v-model="average" size="is-large" disabled></b-rate></p>
        <div v-if="feedback.length === 0">{{ $t('noFeedbackYet')}}</div>
        <div v-for="fb in feedback" v-else :key="fb.grab_id" class="block">
            <p class="title is-3">{{ $t('feedbackBy') }} {{fb.autor}} {{ $t('publishedAt') }} {{ $moment(fb.posted_at).fromNow() }}</p>
            <p class="subtitle is-5"><b-rate v-model="fb.rate" disabled></b-rate></p>
            <p>{{ fb.content }}</p>
        </div>
    </section>
</template>

<script>
export default {
    auth: false,
    name: 'User',
    async asyncData({ app, params: { username }}) {
        const feedback = await app.$feedback.filter(username)
        const sum = feedback.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue.rate
        }, 0)
        const average = sum / feedback.length
        return { username, average, feedback }
    }
}
</script>
