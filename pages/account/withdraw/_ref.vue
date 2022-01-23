<template>
  <section class="section container">
    <b-tabs position="is-centered" class="block" multiline>
      <b-tab-item label="Lightning">
        <div class="columns is-centered">
          <div class="column is-half">
            <div class="block">
              <b-field :label="$t('lightningPaymentRequest')">
                <b-input v-model="invoice" type="text" expanded></b-input>
              </b-field>
              <button class="button" @click="withdrawLightning">{{ $t('withdrawOnLn') }}</button>
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
              <b-field :label="$t('bitcoinAddress')">
                <b-input v-model="address" type="text" expanded></b-input>
              </b-field>
              <button class="button" @click="withdrawOnChain">{{ $t('withdrawOnChain') }}</button>
            </div>
          </div>
        </div>
      </b-tab-item>
    </b-tabs>
  </section>
</template>

<script>
export default {
  name: 'WithdrawByRef',
  middleware: 'auth',
  async asyncData({ app, params: { ref } }) {
    const grab = await app.$db.grabs.get(ref)
    const { data: rate } = await app.$axios.get(`/api/btc/rate/${grab.amazon.currency}`)
    const btc_amount = Number(Math.round(parseFloat(grab.amazon.price.total / rate.buy + 'e' + 8)) + 'e-' + 8)
    return { ref, grab, btc_amount }
  },
  data: () => ({
    address: null,
    invoice: null,
  }),
  methods: {
    async withdrawOnChain() {
      const withdraw = await this.$grab.withdraw({
        ref: this.ref,
        type: 'chain',
        address: this.address.replace('bitcoin:', ''),
      })
      return withdraw
    },
    async withdrawLightning() {
      const withdraw = await this.$grab.withdraw({
        ref: this.ref,
        type: 'ln',
        address: this.invoice.replace('lightning:', ''),
      })
      return withdraw
    },
  },
}
</script>
