<template>
  <section class="section">
    <div class="columns is-centered">
      <div class="column is-one-third">
        <b-field label="Delivery date">
          <b-datepicker v-model="delivery_date" :min-date="new Date()" :max-date="new Date(grab.destination.max_delivery_date)" icon="calendar-today" editable />
        </b-field>
        <b-field>
          <button class="button" @click="book">Book</button>
        </b-field>
      </div>
    </div>
  </section>
</template>

<script>
import orderBy from 'lodash.orderby'
export default {
  name: 'BookByRef',
  async asyncData({ app, params: { ref } }) {
    const grab = await app.$db.grabs.get(ref)
    return { ref, grab }
  },
  data: () => ({
    delivery_date: null,
  }),
  methods: {
    async book() {
      await this.$grab.book({
        ref: this.ref,
        delivery_date: this.delivery_date.toISOString(),
      })
      const [orders, booked] = await Promise.all([
        this.$db.orders.filter('published'),
        this.$db.account.deliveries.filter('booked')
      ])      
      const orderedOrders = orderBy(orders, ['published_at'], ['desc'])
      this.$store.commit('orders/setOrderss', orderedOrders)
      this.$store.commit('account/deliveries/setBooked', booked)
      this.$store.commit('orders/setInitiated', true)      
      this.$router.go(-1)
    },
  },
}
</script>
