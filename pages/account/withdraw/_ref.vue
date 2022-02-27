<template>
  <section class="section container">
    <b-tabs position="is-centered" class="block" multiline>
      <b-tab-item label="Lightning">
        <div class="columns is-centered">
          <div class="column is-half">
            <div class="block">
              <b-field :label="$t('lightningPaymentRequest')" :type="invoiceType" :message="invoiceMessage">
                <b-input v-model="invoice" type="text" expanded></b-input>
              </b-field>
              <button :class="withdrawButtonClass" @click="withdrawLightning">{{ $t('withdrawOnLn') }}</button>
            </div>
          </div>
        </div>
      </b-tab-item>
      <b-tab-item label="On Chain">
        <div class="columns is-centered">
          <div class="column is-half">
            <div v-if="btc_amount<0.002" class="notification is-primary">
              {{ $t('theMinimumIs') }} <strong>0.002 BTC</strong>. {{ $t('forThisAmountUse') }}.
            </div>
            <div v-else class="block">
              <b-field :label="$t('bitcoinAddress')" :type="addressType" :message="addressMessage">
                <b-input v-model="address" type="text" expanded></b-input>
              </b-field>
              <button :class="withdrawButtonClass" @click="withdrawOnChain">{{ $t('withdrawOnChain') }}</button>
            </div>
          </div>
        </div>
      </b-tab-item>
    </b-tabs>
  </section>
</template>

<script>
export default {
  name: 'WithdrawRef',
  middleware: 'auth',
  async asyncData({ app, params: { ref } }) {
    const grab = await app.$db.grabs.get(ref)
    const { data: rate } = await app.$axios.get(`/api/btc/rate/${grab.shop.currency}`)
    const btc_amount = Number(Math.round(parseFloat(grab.shop.price.total / rate.buy + 'e' + 8)) + 'e-' + 8)
    return { ref, grab, btc_amount }
  },
  data: () => ({
    invoice: null,
    invoiceType: null,
    invoiceError: false,
    address: null,
    addressType: null,
    addressError: false,
    withdrawButtonClass: 'button is-primary is-outlined'
  }),
  head() {
    return {
      title: `${this.$t('seo.withdraw')} ${this.ref}`
    }
  },
  computed: {
    invoiceMessage() {
      if (this.invoiceError === 'Field required') return this.$t('requiredField')
      else return null      
    },
    addressMessage() {
      if (this.addressError === 'Field required') return this.$t('requiredField')
      else return null      
    }
  },
  methods: {
    validateInvoice() {
      if (!this.invoice) {
        this.invoiceType = 'is-danger'
        this.invoiceError = 'Field required'
        return false
      }
      return true
    },
    validateAddress() {
      if (!this.invoice) {
        this.addressType = 'is-danger'
        this.addressError = 'Field required'
        return false
      }
      return true
    },
    async withdrawLightning() {
      this.invoiceType = null
      this.invoiceError = false
      const validInvoice = this.validateInvoice()
      if (validInvoice) {
        this.withdrawButtonClass = 'button is-primary is-outlined is-loading'
        const withdraw = await this.$grab.withdraw({
          ref: this.ref,
          type: 'ln',
          address: this.invoice.replace('lightning:', ''),
        })
        this.withdrawButtonClass = 'button is-primary is-outlined'
        if (withdraw.error) {
          this.addressType = 'is-danger'
          this.addressError = withdraw.error.message
        } else {
          this.$buefy.toast.open({
            duration: 3000,
            message: this.$t('toastWithdrawInitiated'),
            position: 'is-bottom',
            type: 'is-primary'
          })  
        }
      }
    },
    async withdrawOnChain() {
      this.addressType = null
      this.addressError = false
      const validAddress = this.validateAddress()
      if (validAddress) {
        this.withdrawButtonClass = 'button is-primary is-outlined is-loading'
        const withdraw = await this.$grab.withdraw({
          ref: this.ref,
          type: 'chain',
          address: this.address.replace('bitcoin:', ''),
        })
        this.withdrawButtonClass = 'button is-primary is-outlined'
        if (withdraw.error) {
          this.addressType = 'is-danger'
          this.addressError = withdraw.error.message
        } else {
          this.$buefy.toast.open({
            duration: 3000,
            message: this.$t('toastWithdrawInitiated'),
            position: 'is-bottom',
            type: 'is-primary'
          })  
        }
      }
    },
  },
}
</script>
