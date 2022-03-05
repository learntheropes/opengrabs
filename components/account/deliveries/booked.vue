<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="delivery of deliveries" :key="delivery.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <account-deliveries-card-content :delivery="delivery" />
          <footer class="card-footer">
            <a :href="delivery.shop.url" target="_blank" class="card-footer-item">{{ delivery.shop.name }}.{{ delivery.shop.domain }}</a>
          </footer>
          <footer class="card-footer">
            <nuxt-link :to="localePath({ name: 'account-grab-ref', params: { ref: delivery.ref }})" class="card-footer-item">{{ $t('chat') }}</nuxt-link>
            <a href="#" :class="disputeButtonClass" @click="dispute(delivery.ref)">{{ $t('dispute') }}</a>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesBooked',
  middleware: 'auth',
  props: {
    deliveries: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    disputeButtonClass: 'card-footer-item'
  }),
  methods: {
    async dispute(ref) {
      this.disputeButtonClass = 'card-footer-item disabled'
      await this.$grab.dispute({ ref })
      const [booked, disputed] = await Promise.all([
        this.$db.account.deliveries.filter('booked'),
        this.$db.account.deliveries.filter('disputed'),
      ])
      this.$store.commit('account/deliveries/setBooked', booked)
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
