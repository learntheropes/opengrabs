<template>
  <section class="section container">
    <div v-if="!expired.length && ! published.length && !booked.length && !disputed.length && !refunded.length && !withdrawn.length && !paid.length && !bought.length && !delivered.length && !released.length" class="box has-text-centered">
      <p>{{ $t('youDontHaveAnyOrder') }}.</p>
      <p>{{ $t('youCanPublish') }} <nuxt-link :to="localePath({ name: 'account-new', query: { adv: 'order'}})">{{ $t('here') }}</nuxt-link></p>
    </div>
    <b-tabs v-else v-model="activeTab" position="is-centered" class="block" multiline>
      <b-tab-item v-if="expired.length">
        <template #header>
          <span>{{ $t('expired') }}<b-tag rounded>{{ expired.length }}</b-tag></span>
        </template>
        <account-orders-expired :orders="expired" />
      </b-tab-item>

      <b-tab-item v-if="published.length">
        <template #header>
          <span>{{ $t('published') }}<b-tag rounded>{{ published.length }}</b-tag></span>
        </template>
        <account-orders-published :orders="published" />
      </b-tab-item>

      <b-tab-item v-if="booked.length">
        <template #header>
          <span>{{ $t('booked') }}<b-tag rounded>{{ booked.length }}</b-tag></span>
        </template>
        <account-orders-booked :orders="booked" />
      </b-tab-item>

      <b-tab-item v-if="disputed.length">
        <template #header>
          <span>{{ $t('disputed') }}<b-tag rounded>{{ disputed.length }}</b-tag></span>
        </template>
        <account-orders-disputed :orders="disputed" />
      </b-tab-item>

      <b-tab-item v-if="refunded.length">
        <template #header>
          <span>{{ $t('refunded') }}<b-tag rounded>{{ refunded.length }}</b-tag></span>
        </template>
        <account-orders-refunded :orders="refunded" />
      </b-tab-item>

      <b-tab-item v-if="withdrawn.length">
        <template #header>
          <span>{{ $t('withdrawn') }}<b-tag rounded>{{ withdrawn.length }}</b-tag></span>
        </template>
        <account-orders-withdrawn :orders="withdrawn" />
      </b-tab-item>

      <b-tab-item v-if="underpaid.length">
        <template #header>
          <span>{{ $t('underpaid') }}<b-tag rounded>{{ underpaid.length }}</b-tag></span>
        </template>
        <account-orders-underpaid :orders="underpaid" />
      </b-tab-item>

      <b-tab-item v-if="paid.length">
        <template #header>
          <span>{{ $t('paid') }}<b-tag rounded>{{ paid.length }}</b-tag></span>
        </template>
        <account-orders-paid :orders="paid" />
      </b-tab-item>

      <b-tab-item v-if="bought.length">
        <template #header>
          <span>{{ $t('bought') }}<b-tag rounded>{{ bought.length }}</b-tag></span>
        </template>
        <account-orders-bought :orders="bought" />
      </b-tab-item>

      <b-tab-item v-if="delivered.length">
        <template #header>
          <span>{{ $t('delivered') }}<b-tag rounded>{{ delivered.length }}</b-tag></span>
        </template>
        <account-orders-delivered :orders="delivered" />
      </b-tab-item>

      <b-tab-item v-if="released.length">
        <template #header>
          <span>{{ $t('released') }}<b-tag rounded>{{ released.length }}</b-tag></span>
        </template>
        <account-orders-released :orders="released" />
      </b-tab-item>
    </b-tabs>
  </section>
</template>

<script>
import orderBy from 'lodash.orderby'
import filter from 'lodash.filter'
import { mapState } from 'vuex'
export default {
  name: 'AccountOrders',
  middleware: 'auth',
  async fetch({ app, store }) {
    if (!store.state.account.orders.initiated) {
      const [actives, booked, disputed, refunded, withdrawn, underpaid, paid, bought, delivered, released] =
        await Promise.all([
          app.$db.account.orders.filter('published'),
          app.$db.account.orders.filter('booked'),
          app.$db.account.orders.filter('disputed'),
          app.$db.account.orders.withdrawn('refunded', false),
          app.$db.account.orders.withdrawn('refunded', true),
          app.$db.account.orders.filter('underpaid'),
          app.$db.account.orders.filter('paid'),
          app.$db.account.orders.filter('bought'),
          app.$db.account.orders.filter('delivered'),
          app.$db.account.orders.filter('released'),
        ])
      const expired = orderBy(filter(actives, (o) => new Date(o.destination.max_delivery_date) < new Date()), ['published_at'])
      const published = orderBy(filter(actives,(o) => new Date(o.destination.max_delivery_date) >= new Date()),['published_at'])
      store.commit('account/orders/setExpired', expired)
      store.commit('account/orders/setPublished', published)
      store.commit('account/orders/setBooked', booked)
      store.commit('account/orders/setDisputed', disputed)
      store.commit('account/orders/setRefunded', refunded)
      store.commit('account/orders/setWithdrawn', withdrawn)
      store.commit('account/orders/setUnderpaid', underpaid)
      store.commit('account/orders/setPaid', paid)
      store.commit('account/orders/setBought', bought)
      store.commit('account/orders/setDelivered', delivered)
      store.commit('account/orders/setReleased', released)
      store.commit('account/orders/setInitiated', true)
    }
  },
  computed: {
    ...mapState({
      expired: (state) => state.account.orders.expired,
      published: (state) => state.account.orders.published,
      booked: (state) => state.account.orders.booked,
      disputed: (state) => state.account.orders.disputed,
      refunded: (state) => state.account.orders.refunded,
      withdrawn: (state) => state.account.orders.withdrawn,
      underpaid: (state) => state.account.orders.underpaid,
      paid: (state) => state.account.orders.paid,
      bought: (state) => state.account.orders.bought,
      delivered: (state) => state.account.orders.delivered,
      released: (state) => state.account.orders.released,
    }),
    activeTab: {
      get() {
        return this.$store.state.account.orders.activeTab
      },
      set(tab) {
        this.$store.commit('account/orders/setActiveTab', tab)
      },
    }
  },
  async created() {
    const user = await this.$user.get()
    if (process.env.URL && user.username && user.email && this.$Tawk.$isInit()) {
      const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
      this.$Tawk.$updateChatUser({ name: user.username, email: user.email, emailHmac: hash})

      const userSub = {
        key: 'user-sub',
        value: this.$store.$auth.user.sub
      }
      this.$Tawk.$setAttribute(userSub)

      const bitcoinNetwork = {
        key: 'bitcoin-network',
        value: (process.env.BTC_CHAIN === 'test3') ? 'testnet': 'mainnet'
      }
      this.$Tawk.$setAttribute(bitcoinNetwork)
    }
  },
}
</script>
