<template>
  <section class="section container">
    <div class="block">
      <div class="columns is-multiline">
        <div v-for="(post, index) in posts" :key="index" class="column is-narrow">
          <nuxt-link :to="localePath(post.path)">{{ post.title }}</nuxt-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  auth: false,
  data: () => ({
    posts: null,
  }),
  async fetch() {
    const posts = await this.$content('blog', this.$i18n.locale)
      .only(['title', 'path'])
      .sortBy('createdAt', 'asc')
      .fetch()

    this.posts = posts.map((posts) => ({
      ...posts,
      path: posts.path.replace(`/${this.$i18n.locale}`, ''),
    }))
  }
}
</script>