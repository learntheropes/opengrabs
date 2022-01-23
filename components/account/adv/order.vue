<template>
  <section class="section">
    <div class="columns">
      <div class="column is-half">
        <b-field :label="countryLabel" :type="countryType" :message="countryMessage">
          <b-select v-model="country" :placeholder="countryPlaceholder" expanded>
            <option v-for="oneCountry in countries" :key="oneCountry.alpha2Code" :value="oneCountry.name">
              {{ oneCountry.name }}
            </option>
          </b-select>
        </b-field>
        <b-field :label="cityLabel" :type="cityType" :message="cityMessage">
          <b-select v-model="city" :placeholder="cityPlaceholder" expanded>
            <option v-for="(oneCity, index) in cities" :key="index" :value="oneCity.name">
              {{ oneCity.name }}
            </option>
          </b-select>
        </b-field>
        <b-field :label="dateLabel" :type="dateType" :message="dateMessage">
          <b-datepicker v-model="max_delivery_date" :min-date="new Date()" icon="calendar-today" editable />
        </b-field>
        <b-field :label="amazonUrlLabel" :type="amazonLinkType" :message="amazonUrlMessage">
          <b-input v-model="url" type="text" expanded></b-input>
        </b-field>
        <b-field :label="rewardLabel" :message="rewardMessage">
          <b-slider v-model="reward" :min="5" :max="50" :step="5" ticks />
        </b-field>
        <button :class="loadAmazonButtonClass" @click="loadAmazonButton">{{ $t('getProductInfo')}}</button>
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
    slug: null,
    dp: null,
    referral: null,
    reward: 5,
    title: null,
    weight: null,
    image: null,
    price: {},
    currency: null,
    countryError: false,
    countryType: null,
    cityError: false,
    cityType: null,
    dateError: false,
    dateType: null,
    amazonLinkError: false,
    amazonLinkType: null,
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
    countryLabel() {
      return this.$t('countryLabel')
    },
    countryPlaceholder() {
      return this.$t('countryPlaceholder')
    },
    cityLabel() {
      return this.$t('cityLabel')
    },
    cityPlaceholder() {
      return this.$t('cityPlaceholder')
    },
    countryMessage() {
      if (this.countryError === 'Field required') return this.$t('requiredField')
      else return this.$t('countryMessage')
    },
    cityMessage() {
      if (this.cityError === 'Field required') return this.$t('requiredField')
      else return this.$t('cityMessage')
    },
    dateLabel() {
      return this.$t('dateLabel')
    },
    dateMessage() {
      if (this.dateError === 'Field required') return this.$t('requiredField')
      else return this.$t('dateMessage')
    },
    amazonUrlLabel() {
      return this.$t('amazonUrlLabel')
    },
    amazonUrlMessage() {
      if (this.amazonLinkError === 'Field required') return this.$t('requiredField')
      else if (this.amazonLinkError === 'Invalid url') return this.$t('invalidUrl')
      else return this.$t('amazonUrlMessage')
    },
    rewardLabel() {
      return this.$t('rewardLabel')      
    },
    rewardMessage() {
      return this.$t('rewardMessage')      
    }
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
    validateCountry() {
      if (!this.country) {
        this.countryType = 'is-danger'
        this.countryError = 'Field required'
        return false
      }
      return true
    },
    validateCity() {
      if (!this.city) {
        this.cityType = 'is-danger'
        this.cityError = 'Field required'
        return false
      }
      return true
    },
    validateDate() {
      if (!this.max_delivery_date) {
        this.dateType = 'is-danger'
        this.dateError = 'Field required'
        return false
      }
      return true
    },
    validateAmazonLink() {
      if (!this.url) {
        this.amazonLinkType = 'is-danger'
        this.amazonLinkError = 'Field required'
        return false
      } else {
        const match = this.url.match(/(?:amazon.)(?<domain>fr|de|it|es|co.uk|com)(?:\/|\?)(?<slug>.+)(?:\/dp\/)(?<dp>\w+)(?:\/|\?|$)/)
        if (!match || !match.groups.domain || !match.groups.dp) {
          this.amazonLinkType = 'is-danger'
          this.amazonLinkError = 'Invalid url'
          return false
        }
      }
      return true
    },
    async loadAmazonData() {
      const match = this.url.match(/(?:amazon.)(?<domain>fr|de|it|es|co.uk|com)(?:\/|\?)(?<slug>.+)(?:\/dp\/)(?<dp>\w+)(?:\/|\?|$)/)
      this.domain = match.groups.domain
      this.slug = match.groups.slug
      this.dp = match.groups.dp
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
      this.countryType = null
      this.countryMessage = this.$t('countryMessage')
      this.cityType = null
      this.cityMessage = this.$t('cityMessage')
      this.dateType = null
      this.dateMessage = this.$t('dateMessage')
      this.amazonLinkType = null
      this.amazonLinkMessage = this.$t('amazonLinkMessage')
      const validCountry = this.validateCountry()
      const validCity = this.validateCity()
      const validDate = this.validateDate()
      const validUrl = this.validateAmazonLink()
      if (validCountry && validCity && validDate && validUrl) {
        this.loadAmazonButtonClass = 'button is-loading'
        await this.loadAmazonData()
        this.loadAmazonButtonClass = 'button'        
      }
    },
    async publishGrab() {
      const amazon = {
        domain: this.domain,
        slug: this.slug,
        dp: this.dp,
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
