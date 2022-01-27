<template>
  <section class="section">
    <div class="columns is-centered">
      <account-verify-email v-if="!emailExists" />
      <div v-else>
        <div class="column is-one-third">
          <b-field :label="$t('deliveryDate')" :message="dateMessage">
            <b-datepicker v-model="delivery_date" :min-date="new Date()" :max-date="new Date(grab.destination.max_delivery_date)" icon="calendar-today" editable />
          </b-field>
          <b-field>
            <button class="button" @click="book">{{ $t('book') }}</button>
          </b-field>
        </div>
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
    emailExists: false,
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
    this.$nuxt.$on('updateEmailExists', ($event) => this.updateEmailExists($event))
  },
  methods: {
    updateEmailExists(values) {
      this.emailExists = values[0]
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
