<template>
  <section class="section container">
    <div class="block">
      <b-field position="is-centered" grouped group-multiline>
        <b-select v-model="country" :placeholder="$t('byCountry')">
          <option v-for="oneCountry in countriesSelection" :key="oneCountry" :value="oneCountry">
            {{ oneCountry }}
          </option>
        </b-select>
        <p class="control">
          <b-select v-model="city" :placeholder="$t('byCity')">
            <option v-for="oneCity in citiesSelection" :key="oneCity" :value="oneCity">
              {{ oneCity }}
            </option>
          </b-select>
        </p>
        <p class="control">
          <b-button :label="$t('filter')" class="is-primary" outlined @click="filterByDestination" />
        </p>
        <p v-if="filteredOrders" class="control">
          <b-button :label="$t('removeFilter')" @click="removeFilters" />
        </p>
      </b-field>
    </div>

    <div v-if="filteredOrders" class="columns is-multiline">
      <div v-for="order of filteredOrders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <orders-card :order="order" />
      </div>
    </div>

    <div v-else class="columns is-multiline">
      <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <orders-card :order="order" />
      </div>
    </div>
  </section>
</template>

<script>
import orderBy from 'lodash.orderby'
import filter from 'lodash.filter'
import uniq from 'lodash.uniq'
import { mapState } from 'vuex'
export default {
  name: 'Orders',
  auth: false,
  data: () => ({
    country: null,
    city: null,
    filteredOrders: null
  }),
  async fetch({ app, store }) {
    if (!store.state.orders.initiated) {
      const data = await app.$db.orders.filter('published')
      const orders = orderBy(data, ['data.published_at'], ['desc'])
      store.commit('orders/setOrders', orders)
      store.commit('orders/setInitiated', true)
    }
  },
  head() {
    return {
      title: this.$t('seo.orders'),
      link: [
        {
          hid: 'canonical',
          rel: 'canonical',
          href: `https://${process.env.URL}/${this.$i18n.locale}/orders`,
        },
      ],
    }
  },
  computed: {
    ...mapState({
      orders: (state) => state.orders.list,
    }),
    countriesSelection() {
      return uniq(this.orders.map(order => order.destination.country))
    },
    citiesSelection() {
      return uniq(this.orders.map(order => order.destination.city))
    }
  },
  methods: {
    filterByDestination() {
      if (this.country && this.city) {
        const filteredOrders = filter(this.orders, (o) => o.destination.country === this.country && o.destination.city === this.city)
        this.filteredOrders = filteredOrders
      }
      if (this.country && !this.city) {
        const filteredOrders = filter(this.orders, (o) => o.destination.country === this.country)
        this.filteredOrders = filteredOrders
      }
      if (!this.country && this.city) {
        const filteredOrders = filter(this.orders, (o) => o.destination.city === this.city)
        this.filteredOrders = filteredOrders
      }
    },
    removeFilters() {
      this.country = null
      this.city = null
      this.filteredOrders = null
    }
  },
}
</script>
