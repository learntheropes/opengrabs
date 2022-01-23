<template>
  <footer class="footer">
    <nav class="level container">
      <div class="level-left">
        <div class="level-item">
          <nuxt-link to="/admin">Admin</nuxt-link>
        </div>
        <div v-if="$i18n.locale==='en'" class="level-item">
          <a href="https://opengrabs.tawk.help/" target="_blank">Help</a>
        </div>
        <div v-if="$i18n.locale==='es'" class="level-item">
          <a href="https://opengrabs.tawk.help/es" target="_blank">Ayuda</a>
        </div>
        <div v-if="$i18n.locale==='pt'" class="level-item">
          <a href="https://opengrabs.tawk.help/pt" target="_blank">Ajuda</a>
        </div>
        <div v-if="$i18n.locale==='ru'" class="level-item">
          <a href="https://opengrabs.tawk.help/ru" target="_blank">помощь</a>
        </div>
        <div class="level-item">
          <nuxt-link :to="localePath({ name: 'legal-privacy-policy'})">{{ $t('privacyPolicy') }}</nuxt-link>
        </div>
        <div class="level-item">
          <nuxt-link :to="localePath({ name: 'legal-terms-of-service'})">{{ $t('privacyPolicy') }}</nuxt-link>
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
                class="button is-white">
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
      return this.$i18n.locales.filter((i) => i.code !== this.$i18n.locale)
    }
  }
}
</script>

