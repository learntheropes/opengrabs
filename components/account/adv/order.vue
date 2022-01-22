<template>
  <section class="section">
    <div class="columns">
      <div class="column is-half">
        <b-field label="Country" message="Destination Country">
          <b-select v-model="country" placeholder="Select a country" expanded>
            <option v-for="oneCountry in countries" :key="oneCountry.alpha2Code" :value="oneCountry.name">
              {{ oneCountry.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="City" message="Destination city">
          <b-select v-model="city" placeholder="Select a city" expanded>
            <option v-for="(oneCity, index) in cities" :key="index" :value="oneCity.name">
              {{ oneCity.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="Limit delivery date" message="When do you expect to receive the product">
          <b-datepicker v-model="max_delivery_date" :min-date="new Date()" icon="calendar-today" editable />
        </b-field>
        <b-field label="Amazon link" message="Supported stores are amazon.com amazon.co.uk amazon.fr amazon.de amazon.it amazon.es">
          <b-input v-model="url" type="text" expanded></b-input>
        </b-field>
        <b-field label="Reward %" message="Reward in % that you are willing to pay. Minimum is 5% and maximum is 50%">
          <b-slider v-model="reward" :min="5" :max="50" :step="5" ticks />
        </b-field>
        <button :class="loadAmazonButtonClass" @click="loadAmazonButton">Get Product Info</button>
      </div>
      <div v-if="scrapedProduct" class="card">
        <div class="card-image">
          <figure style="background-color: grey" class="image">
            <img :src="image" :alt="'Image of ' + title" />
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">
                {{ title }}
              </p>
            </div>
          </div>
          <div class="content">
            <div class="columns is-mobile">
              <div class="column">
                <p>Product:</p>
                <p>Shipping:</p>
                <p>Taxes:</p>
                <p>Reward:</p>
                <p class="has-text-weight-bold">Total:</p>
              </div>
              <div class="column" align="right">
                <p>{{ price.product.toFixed(2) }}</p>
                <p>{{ price.shipping.toFixed(2) }}</p>
                <p>{{ price.taxes.toFixed(2) }}</p>
                <p>{{ price.reward.toFixed(2) }}</p>
                <p class="has-text-weight-bold">{{ price.total.toFixed(2) }}</p>
              </div>
              <div class="column">
                <p>{{ currency }}</p>
                <p>{{ currency }}</p>
                <p>{{ currency }}</p>
                <p>{{ currency }}</p>
                <p class="has-text-weight-bold">{{ currency }}</p>
              </div>
            </div>
          </div>
          <div class="content">
            Delivery to <strong>{{ city }} [{{ country }}]</strong><br>
            {{ $moment(max_delivery_date.toISOString()).fromNow() }} <strong>[{{ $utils.momentDate(max_delivery_date.toISOString()) }}]</strong>
          </div>
        </div>
        <footer class="card-footer">
          <a href="#" class="card-footer-item" @click="publishButton">Publish</a>
        </footer>
      </div>
    </div>
  </section>
</template>

<script>
import filter from 'lodash.filter'
import sortBy from 'lodash.sortby'
import { allCountries } from '~/assets/js/allCountries'
import { allCities } from '~/assets/js/allCities'

export default {
  name: 'OrderNew',
  middleware: 'auth',
  data: () => ({
    loadAmazonButtonClass: 'button',
    scrapedProduct: false,
    country: null,
    city: null,
    max_delivery_date: null,
    url: null,
    domain: null,
    dp: null,
    referral: null,
    reward: 5,
    title: null,
    weight: null,
    image: null,
    price: {},
    currency: null,
  }),
  computed: {
    countries() {
      return sortBy(allCountries, 'name')
    },
    cities() {
      if (this.country) {
        return sortBy(filter(allCities, { country: this.country }), 'name')
      } else {
        return []
      }
    },
  },
  methods: {
    setCurrencyReferralPrice(domain, price) {
      switch (domain) {
        case 'fr':
          this.currency = 'EUR'
          this.referral = ''
          this.price.taxes = 0
          this.price.total = this.$utils.round(price * (this.reward / 100 + 1),2)
          break
        case 'de':
          this.currency = 'EUR'
          this.referral = ''
          this.price.taxes = 0
          this.price.total = this.$utils.round(price * (this.reward / 100 + 1),2)
          break
        case 'it':
          this.currency = 'EUR'
          this.referral = ''
          this.price.taxes = 0
          this.price.total = this.$utils.round(price * (this.reward / 100 + 1),2)
          break
        case 'es':
          this.currency = 'EUR'
          this.referral = ''
          this.price.taxes = 0
          this.price.total = this.$utils.round(price * (this.reward / 100 + 1),2)
          break
        case 'co.uk':
          this.currency = 'GBP'
          this.referral = ''
          this.price.taxes = 0
          this.price.total = this.$utils.round(price * (this.reward / 100 + 1),2)
          break
        case 'com':
          this.currency = 'USD'
          this.referral = 'localgrabs-20'
          this.price.taxes = this.$utils.round(price * 0.06, 2)
          this.price.total = this.$utils.round(price * 1.06 * (this.reward / 100 + 1),2)
          break
      }
    },
    async loadAmazonData() {
      this.domain = this.url.match(/(amazon.)(fr|de|it|es|co.uk|com)(\/|\?)/)[2]
      this.dp = this.url.match(/(\/dp\/)(\w+)(\/|\?|$)/)[2]
      const {
        data: {
          specifications: { title, weight, image, price },
        },
      } = await this.$axios.get(`/api/amazon/${this.domain}/${this.dp}`)
      this.title = title
      this.weight = weight
      this.image = image
      this.price = {
        product: price,
        shipping: 0.0,
        reward: this.$utils.round(price * 1.06 * (this.reward / 100), 2),
      }
      this.setCurrencyReferralPrice(this.domain, price)
      this.scrapedProduct = true
    },
    async loadAmazonButton() {
      try {
        this.loadAmazonButtonClass = 'button is-loading'
        await this.loadAmazonData()
        this.loadAmazonButtonClass = 'button'
      } catch ({ error }) {
        return error
      }
    },
    async publishGrab() {
      const amazon = {
        dp: this.dp,
        domain: this.domain,
        url: `https://amazon.${this.domain}/dp/${this.dp}/ref=as_li_tl?tag=${this.referral}`,
        title: this.title,
        weight: this.weight,
        image: this.image,
        price: this.price,
        currency: this.currency,
      }
      const destination = {
        country: this.country,
        city: this.city,
        max_delivery_date: this.max_delivery_date.toISOString(),
      }
      await this.$grab.publish({ amazon, destination })
    },
    resetForm() {
      this.scrapedProduct = false
      this.country = null
      this.city = null
      this.max_delivery_date = null
      this.url = null
      this.reward = 5
    },
    async publishButton() {
      try {
        await this.publishGrab()
        const published = await this.$db.account.orders.filter('published')
        this.$store.commit('account/orders/setPublished', published)
        this.resetForm()
      } catch ({ message }) {
        return message
      }
    },
  },
}
</script>
