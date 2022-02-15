<template>
    <section class="section container">
        <h1 class="title">{{ article.title }}</h1>
        <h2 class="subtitle">{{ article.short }}</h2>
        <nuxt-content :document="article" />
    </section>
</template>

<script>
export default {
    name: 'LearnSlug',
    auth: false,
    async asyncData({ $content, params, app, error }) {
        const article = await $content(app.i18n.locale, 'learn', params.slug)
            .fetch()
            .catch(() => {
                error({ statusCode: 404, message: 'Page not found' })
            })
        return { article }
    },
}
</script>