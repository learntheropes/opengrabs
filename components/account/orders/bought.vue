<template>
  <section class="section">
  <div class="columns is-multiline">
    <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
    <div class="card card-equal-height">
      <account-orders-card-content :order="order" />
      <footer class="card-footer">
      <nuxt-link :to="localePath({ name: 'account-grab-ref', params: { ref: order.ref }})" class="card-footer-item">{{ $t('chat') }}</nuxt-link>
      <a href="#" :class="disputeButtonClass" @click="dispute(order.ref)">{{ $t('dispute') }}</a>
      </footer>
    </div>
    </div>
  </div>
  </section>
</template>

<script>
export default {
  name: 'OrdersBought',
  middleware: 'auth',
  props: {
  orders: {
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
    const [bought, disputed] = await Promise.all([
    this.$db.account.products.filter('bought'),
    this.$db.account.products.filter('disputed'),
    ])
    this.$store.commit('account/orders/setBought', bought)
    this.$store.commit('account/orders/setDisputed', disputed)
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