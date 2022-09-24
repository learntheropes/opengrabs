<template>
  <footer class="footer">
    <nav class="level container">
      <div class="level-left">
        <div class="level-item">
          <nuxt-link to="/admin">Admin</nuxt-link>
        </div>
        <div class="level-item">
          <nuxt-link :to="localePath({ name: 'exchange-rates' })">{{ $t('exchangeRate') }}</nuxt-link>
        </div>
        <div class="level-item">
          <nuxt-link :to="localePath({ name: 'blog'})">Blog</nuxt-link>
        </div>
        <div class="level-item">
          <nuxt-link :to="localePath({ name: 'support'})">{{ $t('support') }}</nuxt-link>
        </div>
        <div class="level-item">
          <nuxt-link :to="localePath({ name: 'legal-privacy-policy'})">{{ $t('privacyPolicy') }}</nuxt-link>
        </div>
        <div class="level-item">
          <nuxt-link :to="localePath({ name: 'legal-terms-of-service'})">{{ $t('termsOfService') }}</nuxt-link>
        </div>
        <div class="level-item">
          <a href="#" @click="showCookieControl">{{ $t('changeCookieSetting')}}</a>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <div class="content">
            <div class="buttons">
              <nuxt-link
                v-for="locale in availableLocales"
                :key="locale.code"
                :to="switchLocalePath(locale.code)"
                class="button is-text"
              >
                {{ locale.name }}
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    availableLocales() {
      return this.$i18n.locales.filter((i) => i.code !== this.$i18n.locale && i.iso !== 'x-default')
    }
  },
  methods:{
    showCookieControl() {
      this.$cookies.modal = true
    }
  }
}
</script>

