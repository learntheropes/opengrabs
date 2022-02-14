<template>
  <section>
    <div :class="heroClass">
      <div class="hero-body">
        <div class="container has-text-right">
          <p class="title">
            {{ $t('shopCheaperInternationally') }}
          </p>
          <p class="subtitle">
            {{ $t('findAProductThatYouLikeOnAmazon') }} {{ $t('thatATravelerCanBringToYou') }}
          </p>
          <div class="buttons is-right">
            <a v-if="!authenticated" class="button is-primary" @click="loginNewOrder">{{ $t('loginToAddOrder') }}</a >
            <a v-if="authenticated" class="button is-primary" @click="addOrder">{{ $t('addOrder') }}</a>
            <nuxt-link :to="localePath({ name: 'travels' })" class="button is-primary">{{ $t('viewTravels') }}</nuxt-link >
          </div>
        </div>
      </div>
    </div>
    <div :class="heroClass">
      <div class="hero-body">
        <div class="container">
          <p class="title">
            {{ $t('getPaidToTravel') }}
          </p>
          <p class="subtitle">
            {{ $t('gainRewardToBringAmazonProduct') }} {{ $t('duringYourNextTravel') }}
          </p>
          <div class="buttons">
            <a v-if="!authenticated" href="#" class="button is-primary" @click="loginNewTravel">{{ $t('loginToAddTravel') }}</a>
            <a v-if="authenticated" class="button is-primary" @click="addTravel">{{ $t('addTravel') }}</a>
            <nuxt-link :to="localePath({ name: 'orders'})" class="button is-primary">{{ $t('viewOrders') }}</nuxt-link>
          </div>
        </div>
      </div>
    </div>
    <div :class="heroClass">
      <div class="hero-body">
        <div class="container has-text-right">
          <p class="title">
            {{ $t('weDontChargeFee') }}
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
  data: () =>({
    heroClass: (window.innerWidth < 769) ? 'hero is-fullheight-with-navbar' : 'hero is-medium'
  }),
  computed: {
    authenticated() {
      return this.$store.state.auth.loggedIn
    }
  },
  methods: {
    addOrder() {
      this.$router.push(`${this.$i18n.locale}/account/new/order`)      
    },
    addTravel() {
      this.$router.push(`${this.$i18n.locale}/account/new/travel`)      
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
