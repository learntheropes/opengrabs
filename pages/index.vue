<template>
  <section>
    <div class="hero is-fullheight-with-navbar">
      <div class="hero-body hero-body-shopper">
        <div class="container has-text-right">
          <p class="title">
            {{ $t('shopCheaperInternationally') }}
          </p>
          <p class="subtitle">
            {{ $t('findAProductThatYouLikeOnAmazon') }}<br>
            {{ $t('thatATravelerCanBringToYou') }}
          </p>
          <div class="buttons is-right">
            <a v-if="!authenticated" class="button is-primary" @click="login">{{ $t('loginToAddAnOrder') }}</a >
            <nuxt-link v-if="authenticated" :to="localePath({ name: 'account-adv'})" class="button is-primary">{{ $t('addAnOrder') }}</nuxt-link >
            <nuxt-link :to="localePath({ name: 'travels' })" class="button is-primary">{{ $t('viewTravels') }}</nuxt-link >
          </div>
        </div>
      </div>
    </div>
    <div class="hero is-fullheight-with-navbar">
      <div class="hero-body hero-body-traveler">
        <div class="container">
          <p class="title">
            {{ $t('getPaidToTravel') }}
          </p>
          <p class="subtitle">
            {{ $t('gainRewardToBringAmazonProduct') }}<br>
            {{ $t('duringYourNextTravel') }}
          </p>
          <div class="buttons">
            <a v-if="!authenticated" href="#" class="button is-primary" disabled @click="login">{{ $t('loginToAddTravel') }}</a>
            <nuxt-link v-if="authenticated" :to="localePath({ name: 'account-adv'})" class="button is-primary">{{ $t('addTravel') }}</nuxt-link >
            <nuxt-link :to="localePath({ name: 'orders'})" class="button is-primary">{{ $t('viewOrders') }}</nuxt-link>
          </div>
        </div>
      </div>
    </div>
    <div class="hero is-fullheight-with-navbar">
      <div class="hero-body hero-body-fee">
        <div class="container has-text-right">
          <p class="title">
            {{ $t('weDontChargeFee') }}<br>
          </p>
          <p class="subtitle">
            {{ $t('weDontChargeFeeBecauseAmazon') }}<br>
            {{ $t('thanksToBitcoin') }}
          </p>
          <nuxt-link :to="localePath({ name: 'fees' })" class="button is-primary">{{ $t('viewComparisionFees') }}</nuxt-link>
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
