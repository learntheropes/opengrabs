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
const getOgLocaleAlternate = ($i18n) => {
  for (const locale of $i18n.locales) {
    if (locale.code !== $i18n.locale) {
      return {
        hid: 'og:locale:alternate',
        name: 'og:locale:alternate',
        property: 'og:locale:alternate',
        content: locale.iso,
        hreflang: locale.code,
        href: `https://${process.env.URL||'testnet.opengrbas.com'}/${locale.code}`
      }
    }
  }
}
const getAlternateHreflang = ($i18n) => {
  $i18n.locales.push({
    iso: 'x-default',
    code: 'en' 
  })
  for (const locale of $i18n.locales) {
    return {
      // hid: `alternate-hreflang-${locale.iso}`,
      rel: 'alternate',
      hreflang: locale.iso,
      href: `https://${process.env.URL||'testnet.opengrbas.com'}/${locale.code}`
    }
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
        getAlternateHreflang(this.$i18n),
        {
          hid: 'description',
          name: 'description',
          content: this.$t('seo.description')
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: [
            this.$t('seo.keywords1'),
            this.$t('seo.keywords2'),
            this.$t('seo.keywords3'),
            this.$t('seo.keywords4'),
            this.$t('seo.keywords5'),
            this.$t('seo.keywords6'),
            this.$t('seo.keywords7'),
            this.$t('seo.keywords8'),
            this.$t('seo.keywords9'),
            this.$t('seo.keywords10'),
            this.$t('seo.keywords11'),
            this.$t('seo.keywords12'),
            this.$t('seo.keywords13'),
            this.$t('seo.keywords14'),
            this.$t('seo.keywords15'),
            this.$t('seo.keywords16'),
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
          content: this.$t('seo.description')
        },
        {
          hid: 'og:type',
          property: 'og:type',
          content: 'website',
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: `https://${process.env.URL||'testnet.opengrabs.com'}/shopping.png`,
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: `https://${process.env.URL||'testnet.opengrabs.com'}/`
        },
        {
          property: 'og:locale',
          content: getOgLocale(this.$i18n.locale),
        },
        getOgLocaleAlternate(this.$i18n)
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