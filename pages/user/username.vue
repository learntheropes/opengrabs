<template>
    <section class="section">
        {{ reviews }}
    </section>
</template>

<script>
export default {
    auth: false,
    name: 'UserUsername',
    async asyncData({ app, params: { username }}) {
        const reviews = await app.$reviews.get(username)
        return { reviews }
    }
}
</script>
