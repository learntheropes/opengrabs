<template>
  <section class="hero is-fullheight">
    <div class="hero-body hero-body-shopper">
      <div class="container has-text-centered">
        <p v-if="error.statusCode === 404" class="title">Page not found</p>
        <p v-else class="title">{{ error.message }}</p>
        <nuxt-link :to="{ name: 'index'}" class="button is-primary">Home page</nuxt-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  layout: 'error',
  props: {
    error: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>