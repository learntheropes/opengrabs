<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="delivery of deliveries" :key="delivery.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <account-deliveries-card-content :delivery="delivery" />
          <footer class="card-footer">
            <nuxt-link :to="localePath({ name: 'account-grab-ref', params: { ref: delivery.ref }})" class="card-footer-item">Chat</nuxt-link>
          </footer>
          <footer class="card-footer">
            <a href="#" :class="deliveredButtonClass" @click="delivered(delivery.ref)">{{ $t('delivered') }}</a>
            <a href="#" :class="disputeButtonClass" @click="dispute(delivery.ref)">{{ $t('dispute') }}</a>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesBought',
  middleware: 'auth',
  props: {
    deliveries: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    deliveredButtonClass: 'card-footer-item',
    disputeButtonClass: 'card-footer-item'
  }),
  methods: {
    async delivered(ref) {
      this.deliveredButtonClass = 'card-footer-item disabled'
      await this.$grab.delivered({ ref })
      const [bought, delivered] = await Promise.all([
        this.$db.account.deliveries.filter('bought'),
        this.$db.account.deliveries.filter('delivered'),
      ])
      this.$store.commit('account/deliveries/setBought', bought)
      this.$store.commit('account/deliveries/setDelivered', delivered)
      this.deliveredButtonClass = 'card-footer-item'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabDelivered'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    },
    async dispute(ref) {
      this.disputeButtonClass = 'card-footer-item disabled'
      await this.$grab.dispute({ ref })
      const [bought, disputed] = await Promise.all([
        this.$db.account.deliveries.filter('bought'),
        this.$db.account.deliveries.filter('disputed'),
      ])
      this.$store.commit('account/deliveries/setBought', bought)
      this.$store.commit('account/deliveries/setDisputed', disputed)
      this.disputeButtonClass = 'card-footer-item'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabDisputed'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    },
  },
}
</script>
