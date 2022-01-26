<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <div class="card-image">
            <figure :style="'height: 128px; background-color:grey;'" class="image is-square">
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
              <p>Product: {{ order.shop.price.product }} {{ order.shop.currency }}</p>
              <p>Reward: {{ order.shop.price.reward }} {{ order.shop.currency }}</p>
            </div>
            <div class="content has-text-weight-bold">
              {{ order.destination.city }} [{{ order.destination.country }}]
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
    porders: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    async remove(ref) {
      await this.$grab.remove({ ref })
      const actives = await this.$db.account.orders.filter('published')
      const expired = orderBy(filter(actives,(o) => new Date(o.destination.max_delivery_date) < new Date()),['published_at'])
      this.$store.commit('account/orders/setExpired', expired)
    },
  },
}
</script>
