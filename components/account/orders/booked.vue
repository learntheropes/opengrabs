<template>
  <section class="section">
  <div class="columns is-multiline">
    <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
    <div class="card card-equal-height">
      <account-orders-card-content :order="order" />
      <footer class="card-footer">
      <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ order.shop.name }}.{{ order.shop.domain }}</a>
      </footer>
      <footer class="card-footer">
      <nuxt-link :to="localePath({ name: 'account-grab-ref', params: { ref: order.ref }})" class="card-footer-item">{{ $t('chat') }}</nuxt-link>
      <nuxt-link :to="localePath({ name: 'account-pay-ref', params: { ref: order.ref }})" class="card-footer-item">{{ $t('pay') }}</nuxt-link>
      </footer>
    </div>
    </div>
  </div>
  </section>
</template>

<script>
export default {
  name: 'OrdersBooked',
  middleware: 'auth',
  props: {
  orders: {
    type: Array,
    default: () => [],
  },
  },
}
</script>
