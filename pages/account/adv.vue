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
  computed: {
    activeTab: {
      get() {
        return this.$store.state.account.adv.activeTab
      },
      set(tab) {
        this.$store.commit('account/adv/setActiveTab', tab)
      },
    },
  }
}
</script>