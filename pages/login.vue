<template>
  <section class="section">
  </section>
</template>

<script>
export default {
  name: 'Login',
  middleware: 'auth',
  asyncData({ from }) {
    return { fullPath: from.fullPath, path: from.path }
  },
  head() {
    return {
    title: this.$t('seo.login'),
      link: [
        {
          hid: 'canonical',
          rel: 'canonical',
          href: `https://${process.env.URL}/${this.$i18n.locale}/login`,
        },
      ],
    }
  },
  created() {
    if (this.path !== '/cb' && this.path !== `${this.$i18n.locale}/orders` && this.path !== `${this.$i18n.locale}/travels`) {
      this.$auth.$storage.setUniversal('redirect', this.fullPath)
      this.$auth.loginWith('auth0')
    }
  }
}
</script>
