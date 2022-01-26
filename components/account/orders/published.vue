<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <div class="card-image">
            <figure class="image">
              <img :src="order.shop.image" :alt="'Image of ' + order.shop.title" />
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-5">
                  {{ order.shop.title }}
                </p>
              </div>
            </div>
            <div class="content">
              <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ order.shop.name }}.{{ order.shop.domain }}</a>
            </div>
            <div class="content">
              <div class="columns is-mobile">
                <div class="column">
                  <p>Product:</p>
                  <p>Reward:</p>
                </div>
                <div class="column" align="right">
                  <p>{{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes).toFixed(2) }}</p>
                  <p>{{ order.shop.price.reward.toFixed(2) }}</p>
                </div>
                <div class="column">
                  <p>{{ order.shop.currency }}</p>
                  <p>{{ order.shop.currency }}</p>
                </div>
              </div>
            </div>
            <div class="content">
              Delivery to <strong>{{ order.destination.city }} ({{ order.destination.country }})</strong><br>
              {{ $moment(order.destination.max_delivery_date).fromNow() }} [{{ $utils.momentDate(order.destination.max_delivery_date) }}]
            </div>
            <div class="content">
              Published {{ $moment(order.published_at).fromNow() }}
            </div>
          </div>
          <footer class="card-footer">
            <a href="#" class="card-footer-item" @click="remove(order.ref)">Remove</a>
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
  methods: {
    async remove(ref) {
      await this.$grab.remove({ ref })
      const [actives, data] = await Promise.all([
        this.$db.account.orders.filter('published'),
        this.$db.orders.filter('published')
      ])
      const published = orderBy(filter(actives, (o) => new Date(o.destination.max_delivery_date) >= new Date()),['published_at'])
      this.$store.commit('account/orders/setPublished', published)
      const orders = orderBy(data, ['published_at'], ['desc'])
      this.$store.commit('orders/setOrders', orders)
      this.$store.commit('orders/setInitiated', true)      
    },
  },
}
</script>
