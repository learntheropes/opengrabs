<template>
  <section class="section container">
    <div v-for="(article, index) in articles" :key="index" class="block">
      <h1 class="title">{{ article.title }}</h1>
      <h2 class="subtitle">{{ article.short }} <nuxt-link :to="localePath(article.path)">{{ $t('read') }}</nuxt-link></h2>
    </div>
  </section>
</template>

<script>
export default {
  name: 'LearnIndex',
  auth: false,
  async asyncData({ $content, app, error }) {
    const articles = await $content(`${app.i18n.locale}/learn`)
      .only(['title', 'short', 'path'])
      .sortBy('createdAt', 'asc')
      .fetch()
      .catch(() => {
        error({ statusCode: 404, message: 'Page not found' })
      })

    return { articles }
  },
}
</script>