<template>
  <section class="section">
  <div class="columns is-multiline">
    <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
    <div class="card card-equal-height">
      <account-orders-card-content :order="order" />
      <footer class="card-footer">
      <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ order.shop.name }}.{{ order.shop.domain }}</a>
      <a href="#" :class="removeButtonClass" @click="remove(order.ref)">{{ $t('remove') }}</a>
      </footer>
    </div>
    </div>
  </div>
  </section>
</template>

<script>
import orderBy from 'lodash.orderby'
import filter from 'lodash.filter'
export default {
  name: 'OrdersPublished',
  middleware: 'auth',
  props: {
  orders: {
    type: Array,
    default: () => [],
  },
  },
  data: () => ({
  removeButtonClass: 'card-footer-item'
  }),
  methods: {
  async remove(ref) {
    this.removeButtonClass = 'card-footer-item disabled'
    await this.$grab.remove({ ref })
    const actives = await this.$db.account.orders.filter('published')
    const expired = orderBy(filter(actives,(o) => new Date(o.destination.max_delivery_date) < new Date()),['published_at'])
    this.$store.commit('account/orders/setExpired', expired)
    this.removeButtonClass = 'card-footer-item'
    this.$buefy.toast.open({
    duration: 3000,
    message: this.$t('toastGrabRemoved'),
    position: 'is-bottom',
    type: 'is-primary'
    })
  },
  }
}
</script>
