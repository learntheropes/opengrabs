<template>
  <section>
    <div class="hero is-fullheight-with-navbar">
      <div class="hero-body hero-body-shopper">
        <div class="container has-text-right">
          <p class="title">
            Shop internationally for cheap
          </p>
          <p class="subtitle">
            Find a product that you like on Amazon<br>
            and wait that a traveler bring it to you
          </p>
          <div class="buttons is-right">
            <a v-if="!authenticated" class="button is-primary" @click="login">Login to add an order</a >
            <nuxt-link v-if="authenticated" :to="localePath({ name: 'account-adv'})" class="button is-primary">Add an order</nuxt-link >
            <nuxt-link :to="localePath({ name: 'travels' })" class="button is-primary">View travels</nuxt-link >
          </div>
        </div>
      </div>
    </div>
    <div class="hero is-fullheight-with-navbar">
      <div class="hero-body hero-body-traveler">
        <div class="container">
          <p class="title">
            Get paid to travel
          </p>
          <p class="subtitle">
            Gain a reward to bring an Amazon product<br>
            during your next travel
          </p>
          <div class="buttons">
            <a v-if="!authenticated" href="#" class="button is-primary" disabled @click="login">Login to add a travel</a>
            <nuxt-link v-if="authenticated" :to="localePath({ name: 'account-adv'})" class="button is-primary">Add a travel</nuxt-link >
            <nuxt-link :to="localePath({ name: 'orders'})" class="button is-primary">Book a delivery</nuxt-link>
          </div>
        </div>
      </div>
    </div>
    <div class="hero is-fullheight-with-navbar">
      <div class="hero-body hero-body-fee">
        <div class="container has-text-right">
          <p class="title">
            We don't charge any fee
          </p>
          <p class="subtitle">
            We don't charge service fee because Amazon may pay us a referral fee<br>
            Thanks to Bitcoin lightning we don't need to charge any payment processor fee
          </p>
          <nuxt-link :to="localePath({ name: 'fees' })" class="button is-primary">View comparision fees</nuxt-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Index',
  auth: false,
  computed: {
    authenticated() {
      return this.$store.state.auth.loggedIn
    }
  },
  methods: {
    login() {
      this.$auth.$storage.setUniversal('redirect', `${this.$i18n.locale}/account/adv`)
      this.$auth.loginWith('auth0')
    }
  }
}
</script>


<style scoped>
/*
.hero-body-shopper {
  background-image: url('../static/shopping.png');
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.8;
}
.hero-body-traveler {
  background-image: url('../static/travel.svg');
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.8;
}
.hero-body-fee {
  background-image: url('../static/fee.png');
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.8;
}
*/
</style>
