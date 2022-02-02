<template>
  <section class="section">
    <div class="columns is-centered">
      <account-verify-username v-if="!user.username" />
      <account-verify-email v-if="!user.email||!user.email_verified" />
      <div v-if="user.username && user.email && user.email_verified" class="column is-one-third">
        <b-field :label="$t('deliveryDate')" :message="dateMessage">
          <b-datepicker v-model="delivery_date" :min-date="new Date()" :max-date="new Date(grab.destination.max_delivery_date)" icon="calendar-today" editable />
        </b-field>
        <b-field>
          <button class="button" @click="book">{{ $t('book') }}</button>
        </b-field>
      </div>
    </div>
  </section>
</template>

<script>
import orderBy from 'lodash.orderby'
export default {
  name: 'BookRef',
  middleware: 'auth',
  async asyncData({ app, params: { ref } }) {
    const grab = await app.$db.grabs.get(ref)
    return { ref, grab }
  },
  data: () => ({
    user : {
      username: null,
      email: null,
      email_verified: false
    },
    delivery_date: null,
    dateType: null,
    dateError: false
  }),
  computed: {
    dateMessage() {
      if (this.dateError === 'Field required') return this.$t('requiredField')
      else return this.$t('dateMessage')
    }
  },
  created() {
    this.$nuxt.$on('updateUser', ($event) => this.updateUser($event))
  },
  methods: {
    updateUser(user) {
      this.user = user
    },
    validateDate() {
      if (!this.delivery_date) {
        this.dateType = 'is-danger'
        this.dateError = 'Field required'
        return false
      }
      return true
    },
    async book() {
      this.dateType = null
      this.dateError = null
      const validDate = this.validateDate()
      if (validDate) {
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
      }
    },
  },
}
</script>
