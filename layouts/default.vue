<template>
  <div class="is-tall">
    <layout-nav-bar />
    <main class="is-tall-container">
      <nuxt />
      <CookieControl :locale="$i18n.locale"/>
    </main>
    <layout-footer />
  </div>
</template>

<script>
import { onAnalyticsReady } from 'vue-analytics'
const getOgLocale = (locale) => {
  switch(locale) {
  case 'en':
    return 'en-US'
  case 'es':
    return 'es-AR'
  case 'pt':
    return 'pt-BR'
  case 'ru':
    return 'ru-RU'
  }
}
export default {
  name: 'DefaultLayout',
  head() {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale,
      },
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('description')
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: [
            this.$t('keywords1'),
            this.$t('keywords2'),
            this.$t('keywords3'),
            this.$t('keywords4'),
            this.$t('keywords5'),
            this.$t('keywords6'),
            this.$t('keywords7'),
            this.$t('keywords8'),
            this.$t('keywords9'),
            this.$t('keywords10'),
            this.$t('keywords11'),
            this.$t('keywords12'),
            this.$t('keywords13'),
            this.$t('keywords14'),
          ]
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: 'OpenGrabs',
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('description')
        },
        {
          hid: 'og:type',
          property: 'og:type',
          content: 'website',
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: `https://${process.env.URL}/shopping.jpg`,
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: `https://${process.env.URL}/`
        },
        {
          property: 'og:locale',
          content: getOgLocale(this.$i18n.locale),
        },
      ],
    }
  },
  mounted() {
    // https://stackoverflow.com/questions/64360036/how-to-control-google-analytics-tracking-in-nuxt-based-on-consent-cookies
    onAnalyticsReady().then(() => {
      const hasGaConsent = this.$cookies.isEnabled('ga')
      if (hasGaConsent) {
        this.$ga.enable()
        this.$ga.page(this.$route.path)
      }
    })
  },
}
</script>

<style>
.is-tall {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}
.is-tall-container {
  flex: 1;
}
.card {
  border-radius: 6px;
  overflow:hidden;
}
.card-equal-height {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-equal-height .card-footer {
  margin-top: auto;
}
a.disabled {
  pointer-events: none;
  cursor: default;
  opacity: 0.5;
}
.card-image {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 210px;
  background-size: cover;
  background-color: white;
  overflow: hidden;
}
</style>