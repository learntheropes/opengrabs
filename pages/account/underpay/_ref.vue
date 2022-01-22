<template>
  <section class= "section container">
    <div v-if="countdown>0 && !paymentDetected">
      <b-tabs v-model="activeTab" position="is-centered" class="block" multiline>
        <b-tab-item label="On Chain">
          <div class="columns is-centered">
            <div class="column is-one-third">
              <figure class="image is-square">
                <qrcode :value="'bitcoin:'+charge.address+'?amount='+charge.missing_amt" :options="{ width: qrCodeWidth }" tag="img" />
              </figure>
              <div class="columns">
                <div class="column">
                  <pre class="has-text-centered">{{ charge.address }}</pre>
                  <pre class="has-text-centered">{{ $utils.round(charge.amount/100000000,8) }}</pre>
                </div>
              </div>
              <div class="buttons is-centered">
                <button class="button" @click="copyBitcoinAddress">Copy Address</button>
                <button class="button" @click="copyBitcoinAmount">Copy Amount</button>
              </div>
            </div>
          </div>
        </b-tab-item>
      </b-tabs>
      <div class="columns is-mobile is-centered">
        <div class="column is-half">
          <b-progress :value="countdown/totalTime*100" size="is-medium" show-value>
            {{formattedCountdown}}
          </b-progress>
        </div>
      </div>
    </div>
    <div v-if="paymentProcessing" class="columns is-centered">
      <div class="column is-one-third">
        <div class="box"><p>Payment processing. We will mark the order as paid as soon as the payment confirms.</p></div>
      </div>
    </div>
    <div v-if="paymentConfirmed" class="columns is-centered">
      <div class="column is-one-third">
        <div class="box"><p>Payment confirmed</p></div>
        <button class="button" @click="goBack">Go Back</button>
      </div>
    </div>
    <div v-if="paymentExpired" class="columns is-centered">
      <div class="column is-one-third">
        <div class="box"><p>Payment expired</p></div>
        <button class="button" @click="reloadPage">Generate a new invoice</button>
      </div>
    </div>
  </section>
</template>

<script>
import Qrcode from '@chenfengyuan/vue-qrcode'
export default {
  name: 'UnderpayByRef',
  components: {
    Qrcode
  },
  middleware: 'auth',
  async asyncData ({ app, params: { ref }}) {
    const grab = await app.$db.grabs.get(ref)
    const charge = {
      missing_amt: app.$utils.round(parseInt(grab.charge.missing_amt)/100000000,8),
      address: grab.charge.address
    }
    return { ref, grab, charge }
  },
  data: () => ({
    qrCodeWidth: 800,
    countdown: 60 * 10 * 1000,
    totalTime: 60 * 10 * 1000,
    paymentProcessing: false,
    paymentConfirmed: false,
    paymentExpired: false
  }),
  computed: {
    activeTab: {
      get () {
        return this.$store.state.account.grab.activeTab
      },
      set (tab) {
        this.$store.commit('account/grab/setActiveTab', tab)
      }
    },
    formattedCountdown () {
      return this.$moment.utc(this.countdown).format('mm:ss')
    }
  },
  created () {
    const checkConfirmations = () => {
      this.countdown = this.countdown -1000
      if (this.countdown % 5000 === 0) {
        this.$axios.get(`/api/btc/charge-info/${this.charge.id}`, {
          progress: false
        })
        .then(({ data }) => {
          if (data.status === 'processing') {
            this.paymentProcessing = true
          } else if (data.status === 'paid') {
            this.paymentProcessing = false
            this.paymentConfirmed = true
            clearInterval(refreshIntervalId)
          } else if (data.status === 'expired') {
            this.paymentExpired = true
            clearInterval(refreshIntervalId)
          }
        })
      }
      if (this.countdown === 0) {
        this.paymentExpired = true
        clearInterval(refreshIntervalId)
      }
    }
    const refreshIntervalId = setInterval(checkConfirmations, 1000)
  },
  methods : {
    copyBitcoinAddress() {
      navigator.clipboard.writeText(this.charge.chain_invoice.address)
    },
    copyBitcoinAmount() {
      navigator.clipboard.writeText(this.$utils.round(this.charge.amount/100000000,8))
    },
    copyLightningInvoice() {
      navigator.clipboard.writeText(this.charge.lightning_invoice.payreq)
    },
    reloadPage() {
      this.$router.app.refresh()
    },
    async goBack() {
      const [underpaid,paid] = await Promise.all([
        this.$db.account.orders.filter('underpaid'),
        this.$db.account.orders.filter('paid')
      ])
      this.$store.commit('account/orders/setUnderpaid', underpaid)
      this.$store.commit('account/orders/setPaid', paid)
      this.$router.go(-1)
    }
  }
}
</script>
