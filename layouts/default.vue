<template>
  <div class="is-tall">
    <layout-nav-bar />
    <main class="is-tall-container">
      <nuxt />
    </main>
    <layout-footer />
  </div>
</template>

<script>
import { onAnalyticsReady } from 'vue-analytics'

export default {
  name: 'DefaultLayout',
  mounted() {
    // const hasTawkConsent = !this.$cookies.isEnabled('tawk')
    // if (process.env.URL && hasTawkConsent && this.$tawk && this.$tawk.$isInit()) {
    //    this.$tawk.$showWidget()
    // } else if (process.env.URL && !hasTawkConsent && this.$tawk && this.$tawk.$isInit()) {
    //   this.$tawk.$hideWidget()
    //   this.$cookies.remove('tawk')
    // }
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
.cookieControl {
  z-index: 2000000001;
}
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
  background-color: black;
  overflow: hidden;
}
</style>