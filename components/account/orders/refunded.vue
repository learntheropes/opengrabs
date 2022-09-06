<template>
  <section class="section">
  <div class="columns is-multiline">
    <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
    <div class="card card-equal-height">
      <account-orders-card-content :order="order" />
      <footer v-if="order.paid_at" class="card-footer">
      <nuxt-link :to="localePath({ name: 'account-withdraw-ref', params: { ref: order.ref }})" class="card-footer-item">{{ $t('withdraw') }}</nuxt-link>
      </footer>
    </div>
    </div>
  </div>
  </section>
</template>

<script>
export default {
  name: 'OrdersRefunded',
  middleware: 'auth',
  props: {
  orders: {
    type: Array,
    default: () => [],
  },
  }
}
</script>