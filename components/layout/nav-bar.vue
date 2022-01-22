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
      <b-navbar-item tag="router-link" :to="localePath({ name: 'orders' })">Orders</b-navbar-item>
      <b-navbar-item tag="router-link" :to="localePath({ name: 'travels' })">Travels</b-navbar-item>
      <b-navbar-item tag="router-link" :to="localePath({ name: 'exchange-rates' })">Exchange rates</b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-dropdown v-if="authenticated" label="Account">
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-settings'})">Settings</b-navbar-item>
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-adv' })">New Advertisement</b-navbar-item>
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-orders' })">My Orders</b-navbar-item>
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-deliveries' })">My Deliveries</b-navbar-item>
        <b-navbar-item tag="router-link" :to="localePath({ name: 'account-travels' })">My Travels</b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-item>
        <button v-if="!authenticated" class="button is-primary is-outlined" @click="login">Login</button>
        <button v-if="authenticated" class="button is-primary is-outlined" @click="logout">Logout</button>
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
      this.$auth.logout()
    },
  },
}
</script>
