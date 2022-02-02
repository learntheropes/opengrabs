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
            <a v-if="!authenticated" class="button is-primary" @click="loginNewOrder">{{ $t('loginToAddOrder') }}</a >
            <a v-if="authenticated" class="button is-primary" @click="addOrder">{{ $t('addOrder') }}</a>
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
            <a v-if="!authenticated" href="#" class="button is-primary" @click="loginNewTravel">{{ $t('loginToAddTravel') }}</a>
            <a v-if="authenticated" class="button is-primary" @click="addTravel">{{ $t('addTravel') }}</a>
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
  async mounted() {
    const sleep = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    // This is only to mount the tawk.to chat to new users
    if (process.env.URL) {
      await sleep(1000)
      if (!this.$Tawk) {
        this.$router.go(0)
      }
      // Set the bitcoin network attribute
      else if (this.$Tawk.$isInit()) {
        const attribute = {
          key: 'bitcoin-network',
          value: (process.env.URL === 'https://opengrabs.com') ? 'mainnet' : 'testnet'
        }
        const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${attribute.value}`)
        attribute.hash = hash

        console.log(attribute)
        this.$Tawk.$setAttribute(attribute)
      }
    }
  },
  methods: {
    addOrder() {
      this.$store.commit('account/new/setActiveTab', 0)
      this.$router.push(`${this.$i18n.locale}/account/new`)      
    },
    addTravel() {
      this.$store.commit('account/new/setActiveTab', 1)
      this.$router.push(`${this.$i18n.locale}/account/new`)      
    },
    loginNewOrder() {
      this.$auth.$storage.setUniversal('redirect', `/${this.$i18n.locale}/account/new?adv=order`)
      this.$auth.loginWith('auth0')
    },
    loginNewTravel() {
      this.$auth.$storage.setUniversal('redirect', `/${this.$i18n.locale}/account/new?adv=travel`)
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
