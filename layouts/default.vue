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
    onAnalyticsReady().then(() => {
      const hasConsent = this.$cookies.isEnabled('ga')
      if (hasConsent) {
        this.$ga.enable() // Activate module
        this.$ga.page(this.$route.path) // Track current route
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