<template>
  <b-navbar wrapper-class="container">
    <template slot="brand">
      <b-navbar-item tag="router-link" :to="localePath({ name: 'index' })">
        <b-taglist attached>
          <b-tag size="is-medium" type="is-primary">OpenGrabs</b-tag>
          <b-tag size="is-medium" type="is-grey">0.2</b-tag>
        </b-taglist>
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-navbar-item tag="router-link" :to="localePath({ name: 'orders' })">{{ $t('orders') }}</b-navbar-item>
      <b-navbar-item tag="router-link" :to="localePath({ name: 'travels' })">{{ $t('travels') }}</b-navbar-item>
      <b-navbar-item tag="router-link" :to="localePath({ name: 'exchange-rates' })">{{ $t('exchangeRate') }}</b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-dropdown v-if="authenticated" label="Account">
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-adv' })">{{ $t('newAdvertisement') }}</b-navbar-item>
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
