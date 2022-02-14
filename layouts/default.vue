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

export default {
  name: 'DefaultLayout',
  async mounted() {
    // https://stackoverflow.com/questions/64360036/how-to-control-google-analytics-tracking-in-nuxt-based-on-consent-cookies
    onAnalyticsReady().then(() => {
      const hasGaConsent = this.$cookies.isEnabled('ga')
      if (hasGaConsent) {
        this.$ga.enable()
        this.$ga.page(this.$route.path)
      }
    })
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    await sleep(2000)
    const path = this.$route.path.split('/')
    if (path.length >= 2 && path[1] === 'account' && process.env.URL && !this.$store.state.account.tawk.initiated) {
      const user = await this.$user.get()
      if (user.username && user.email && this.$Tawk.$isInit()) {
        const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256`)
        this.$Tawk.$updateChatUser({ name: user.username, email: user.email, hash })
        const attributes = {
          'user-sub': this.$store.$auth.user.sub,
          'bitcoin-network': (process.env.BTC_CHAIN === 'test3') ? 'testnet': 'mainnet'
        }
        this.$Tawk.$setAttribute(attributes)
        this.$store.commit('account/tawk/setInitiated', true)
      }
    }
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