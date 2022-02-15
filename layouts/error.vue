<template>
  <section class="hero is-fullheight-with-navbar">
    <div class="hero-body">
      <div class="container has-text-centered">
        <p class="title">{{ error.message }}</p>
        <nuxt-link :to="localePath({ name: 'index' })" class="button is-primary">Home page</nuxt-link>
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