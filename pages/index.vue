<template>
  <section class="section">
    <div class="hero is-medium">
      <div class="hero-body">
        <div class="container has-text-right">
          <p class="title">
            {{ $t('shopCheaperInternationally') }}
          </p>
          <p class="subtitle">
            {{ $t('findAProductThatYouLikeOnAmazon') }} {{ $t('thatATravelerCanBringToYou') }}
          </p>
          <div class="buttons is-right">
            <button v-if="!authenticated" class="button is-primary" @click="loginNewOrder">{{ $t('loginToAddOrder') }}</button>
            <button v-if="authenticated" class="button is-primary" @click="addOrder">{{ $t('addOrder') }}</button>
            <nuxt-link :to="localePath({ name: 'travels' })" class="button is-primary">{{ $t('viewTravels') }}</nuxt-link >
          </div>
        </div>
      </div>
    </div>
    <div class="hero is-medium">
      <div class="hero-body">
        <div class="container">
          <p class="title">
            {{ $t('getPaidToTravel') }}
          </p>
          <p class="subtitle">
            {{ $t('gainRewardToBringAmazonProduct') }} {{ $t('duringYourNextTravel') }}
          </p>
          <div class="buttons">
            <button v-if="!authenticated" class="button is-primary" @click="loginNewTravel">{{ $t('loginToAddTravel') }}</button>
            <button v-if="authenticated" class="button is-primary" @click="addTravel">{{ $t('addTravel') }}</button>
            <nuxt-link :to="localePath({ name: 'orders'})" class="button is-primary">{{ $t('viewOrders') }}</nuxt-link>
          </div>
        </div>
      </div>
    </div>
    <div class="hero is-medium">
      <div class="hero-body">
        <div class="container has-text-right">
          <p class="title">
            {{ $t('weDontChargeFee') }}
          </p>
          <p class="subtitle">
            {{ $t('weDontChargeFeeBecauseAmazon') }}<br>
            {{ $t('thanksToBitcoin') }}
          </p>
          <nuxt-link :to="localePath({ name: 'fees'})" class="button is-primary">{{ $t('viewComparisionFees') }}</nuxt-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Index',
  auth: false,
  head() {
    return {
      title: this.$t('seo.home'),
      link: [
        {
          hid: 'canonical',
          rel: 'canonical',
          href: `https://${process.env.URL||'testnet.opengrabs.com'}/`,
        },
      ],
    }
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.loggedIn
    }
  },
  methods: {
    addOrder() {
      this.$router.push(`/${this.$i18n.locale}/account/new/order`)      
    },
    addTravel() {
      this.$router.push(`/${this.$i18n.locale}/account/new/travel`)      
    },
    loginNewOrder() {
      this.$auth.$storage.setUniversal('redirect', `/${this.$i18n.locale}/account/new/order`)
      this.$auth.loginWith('auth0')
    },
    loginNewTravel() {
      this.$auth.$storage.setUniversal('redirect', `/${this.$i18n.locale}/account/new/travel`)
      this.$auth.loginWith('auth0')    
    }
  }
}
</script>
