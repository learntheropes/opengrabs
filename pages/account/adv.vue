<template>
  <section class="section container">
    <b-tabs v-model="activeTab" position="is-centered" class="block" multiline>
      <b-tab-item label="Order">
        <account-adv-order />
      </b-tab-item>
      <b-tab-item label="Travel">
        <account-adv-travel />
      </b-tab-item>
    </b-tabs>             
  </section>
</template>

<script>
export default {
  name: 'Adv',
  asyncData({ query: { adv }}) {
    return { adv }
  },
  computed: {
    activeTab: {
      get() {
        return this.$store.state.account.adv.activeTab
      },
      set(tab) {
        this.$store.commit('account/adv/setActiveTab', tab)
      },
    },
  },
  mounted() {
    if (this.adv === 'travel') {
      this.$store.commit('account/adv/setActiveTab', 1)
    }
  }
}
</script>