<template>
  <b-navbar wrapper-class="container" centered>
    <template slot="brand">
      <b-navbar-item tag="router-link" :to="localePath({ name: 'index' })">
        <b-taglist attached>
          <b-tag size="is-medium" type="is-primary">OpenGrabs</b-tag>
          <b-tag size="is-medium" type="is-grey">{{ network }}</b-tag>
        </b-taglist>
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-navbar-item tag="router-link" :to="localePath({ name: 'orders' })">{{ $t('orders') }}</b-navbar-item>
      <b-navbar-item tag="router-link" :to="localePath({ name: 'travels' })">{{ $t('travels') }}</b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-dropdown v-if="authenticated" label="Account">
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-new' })">{{ $t('newAdvertisement') }}</b-navbar-item>
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-orders' })">{{ $t('myOrders') }}</b-navbar-item>
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-deliveries' })">{{ $t('myDeliveries') }}</b-navbar-item>
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-travels' })">{{ $t('myTravels') }}</b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-item>
        <button v-if="!authenticated" class="button is-primary is-outlined" @click="login">{{ $t('login') }}</button>
        <button v-if="authenticated" class="button is-primary is-outlined" @click="logout">{{ $t('logout') }}</button>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  name: 'NavBar',
  computed: {
    authenticated() {
      return this.$store.state.auth.loggedIn
    },
    network() {
      if (process.env.URL === 'https://opengrabs.com') return 'mainnet'
      else if (process.env.URL === 'https://testnet.opengrabs.com') return 'testnet'
      else return 'testnet'
    }
  },
  methods: {
    login() {
      this.$auth.$storage.setUniversal('redirect', this.$route.path)
      this.$auth.loginWith('auth0')
    },
    logout() {
      if (process.env.URL && this.$Tawk.$isChatOngoing()) {
        this.$Tawk.$endChat()
      }
      this.$auth.logout()
    },
  },
}
</script>
