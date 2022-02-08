<template>
  <section class="section container">
    <div v-if="!booked.length && !disputed.length && !paid.length && !bought.length && !delivered.length && !released.length && !withdrawn.length" class="box has-text-centered">
      <p>{{ $t('youDontHaveAnyDelivery') }}.</p>
      <p>{{ $t('youCanBookOrderToDeliver') }} <nuxt-link :to="localePath({ name: 'orders' })">{{ $t('here') }}</nuxt-link></p>
    </div>
    <b-tabs v-else v-model="activeTab" position="is-centered" class="block" multiline>
      <b-tab-item v-if="booked.length">
        <template #header>
          <span>{{ $t('booked') }}<b-tag rounded>{{ booked.length }}</b-tag></span>
        </template>
        <account-deliveries-booked :deliveries="booked" />
      </b-tab-item>
      <b-tab-item v-if="disputed.length">
        <template #header>
          <span>{{ $t('disputes') }}<b-tag rounded>{{ disputed.length }}</b-tag></span>
        </template>
        <account-deliveries-disputed :deliveries="disputed" />
      </b-tab-item>
      <b-tab-item v-if="refunded.length">
        <template #header>
          <span>{{ $t('refunded') }}<b-tag rounded>{{ refunded.length }}</b-tag></span>
        </template>
        <account-deliveries-refunded :deliveries="refunded" />
      </b-tab-item>
      <b-tab-item v-if="paid.length">
        <template #header>
          <span>{{ $t('paid') }}<b-tag rounded>{{ paid.length }}</b-tag></span>
        </template>
        <account-deliveries-paid :deliveries="paid" />
      </b-tab-item>
      <b-tab-item v-if="bought.length">
        <template #header>
          <span>{{ $t('bought') }}<b-tag rounded>{{ bought.length }}</b-tag></span>
        </template>
        <account-deliveries-bought :deliveries="bought" />
      </b-tab-item>
      <b-tab-item v-if="delivered.length">
        <template #header>
          <span>{{ $t('delivered') }}<b-tag rounded>{{ delivered.length }}</b-tag></span>
        </template>
        <account-deliveries-delivered :deliveries="delivered" />
      </b-tab-item>
      <b-tab-item v-if="released.length">
        <template #header>
          <span>{{ $t('released') }}<b-tag rounded>{{ released.length }}</b-tag></span>
        </template>
        <account-deliveries-released :deliveries="released" />
      </b-tab-item>
      <b-tab-item v-if="withdrawn.length">
        <template #header>
          <span>{{ $t('withdrawn') }}<b-tag rounded>{{ withdrawn.length }}</b-tag></span>
        </template>
        <account-deliveries-withdrawn :deliveries="withdrawn" />
      </b-tab-item>
    </b-tabs>
  </section>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'AccountDeliveries',
  middleware: 'auth',
  async fetch({ app, store }) {
    if (!store.state.account.deliveries.initiated) {    
      const [booked, disputed, refunded, paid, bought, delivered, released, withdrawn] =
        await Promise.all([
          app.$db.account.deliveries.filter('booked'),
          app.$db.account.deliveries.filter('disputed'),
          app.$db.account.deliveries.filter('refunded'),
          app.$db.account.deliveries.filter('paid'),
          app.$db.account.deliveries.filter('bought'),
          app.$db.account.deliveries.filter('delivered'),
          app.$db.account.deliveries.withdrawn('released', false),
          app.$db.account.deliveries.withdrawn('released', true),
        ])
      store.commit('account/deliveries/setBooked', booked)
      store.commit('account/deliveries/setDisputed', disputed)
      store.commit('account/deliveries/setRefunded', refunded)
      store.commit('account/deliveries/setPaid', paid)
      store.commit('account/deliveries/setBought', bought)
      store.commit('account/deliveries/setDelivered', delivered)
      store.commit('account/deliveries/setReleased', released)
      store.commit('account/deliveries/setWithdrawn', withdrawn)
      store.commit('account/deliveries/setInitiated', true)
    }
  },
  computed: {
    ...mapState({
      booked: (state) => state.account.deliveries.booked,
      disputed: (state) => state.account.deliveries.disputed,
      refunded: (state) => state.account.deliveries.refunded,
      paid: (state) => state.account.deliveries.paid,
      bought: (state) => state.account.deliveries.bought,
      delivered: (state) => state.account.deliveries.delivered,
      released: (state) => state.account.deliveries.released,
      withdrawn: (state) => state.account.deliveries.withdrawn,
    }),
    activeTab: {
      get() {
        return this.$store.state.account.deliveries.activeTab
      },
      set(tab) {
        this.$store.commit('account/deliveries/setActiveTab', tab)
      },
    },
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
