<template>
  <section class="section container">
    <h1 class="title">{{ post.title }}</h1>
    <h2 class="subtitle">{{ post.short }}</h2>
    <nuxt-content :document="post" />
  </section>
</template>

<script>
export default {
  auth: false,
  name: 'BlogSlug',
  head() {
    return {
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:  this.post.description
        },
      ]
    }
  },
  async asyncData({ $content, params: { slug }, app, error }) {
    const post = await $content('blog', app.i18n.locale, slug)
      .fetch()
      .catch(() => {
        error({ statusCode: 404 })
      })
    return { post }
  },
}
</script>