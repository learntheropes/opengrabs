<template>
  <section class="section container">
    <b-tabs v-model="activeTab" position="is-centered" class="block" multiline>
      <b-tab-item :label="$t('order')">
        <account-new-order />
      </b-tab-item>
      <b-tab-item :label="$t('travel')">
        <account-new-travel />
      </b-tab-item>
    </b-tabs>             
  </section>
</template>

<script>
export default {
  name: 'New',
  asyncData({ query: { adv }}) {
    return { adv }
  },
  computed: {
    activeTab: {
      get() {
        return this.$store.state.account.new.activeTab
      },
      set(tab) {
        this.$store.commit('account/new/setActiveTab', tab)
      },
    },
  },
  mounted() {
    if (this.adv === 'order') {
      this.$store.commit('account/new/setActiveTab', 0)
    } else if (this.adv === 'travel') {
      this.$store.commit('account/new/setActiveTab', 1)
    }
  }
}
</script>