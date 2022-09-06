<template>
  <section class="section container">
  <div class="columns">
    <div class="column is-half">
    <account-verify-username v-if="!user.username" />
    <account-verify-email v-if="!user.email||!user.email_verified" />
    <div v-if="user.username && user.email && user.email_verified">
      <b-field :label="countryLabel" :type="countryType" :message="countryMessage">
      <b-select v-model="country" :placeholder="countryPlaceholder" expanded>
        <option v-for="oneCountry in countries" :key="oneCountry.alpha2Code" :value="oneCountry.name">
        {{ oneCountry.name }}
        </option>
      </b-select>
      </b-field>
      <b-field :label="cityLabel" :type="cityType" :message="cityMessage">
      <b-select v-model="city" :placeholder="cityPlaceholder" expanded>
        <option v-for="oneCity in cities" :key="oneCity.name" :value="oneCity.name">
        {{ oneCity.name }}
        </option>
      </b-select>
      </b-field>
      <b-field :label="dateLabel" :type="dateType" :message="dateMessage">
      <b-datepicker v-model="max_delivery_date" :min-date="new Date()" icon="calendar-today" editable />
      </b-field>
      <b-field :label="amazonUrlLabel" :type="amazonUrlType" :message="amazonUrlMessage">
      <b-input v-model="url" type="text" expanded></b-input>
      </b-field>
      <b-field :label="quantityLabel" :type="quantityType" :message="quantityMessage">
      <b-numberinput v-model="quantity" :min="1" :max="10" type="is-light"></b-numberinput>
      </b-field>
      <b-field :label="rewardLabel" :message="rewardMessage">
      <b-slider v-model="reward" :min="5" :max="50" :step="5" ticks :custom-formatter="(val) => val + '%'" :tooltip="false" indicator />
      </b-field>
      <b-field :label="packagingLabel">
      <b-switch v-model="packaging" type='is-primary'>{{ packaging ? $t('withPackaging') : $t('withoutPackaging') }}</b-switch>
      </b-field>
      <button :class="loadAmazonButtonClass" @click="loadAmazonButton">{{ $t('getProductInfo')}}</button>
    </div>
    </div>
    <div v-if="scrapedProduct" class="column is-half">
    <div class="card">
      <header class="card-header">
      <p class="card-header-title">{{ slug.replace(/-/g,' ')}}</p>
      </header> 
      <div class="card-image">
      <figure style="background-color: grey" class="image">
        <img :src="getImage" :alt="'Image of ' + title" />
      </figure>
      </div>
      <div class="card-content">
      <div class="content">
        {{ quantity }} {{ $t('items') }}
      </div>
      <div class="content">
        <div class="columns is-mobile">
        <div class="column">
          <p>{{ $t('product')}}:<br>
          {{ $t('shipping')}}:<br>
          {{ $t('taxes') }}:<br>
          {{ $t('reward')}}:<br>
          {{ $t('total')}}:</p>
        </div>
        <div class="column" align="right">
          <p>{{ price.product.toFixed(2) }}<br>
          {{ price.shipping.toFixed(2) }}<br>
          {{ price.taxes.toFixed(2) }}<br>
          {{ price.reward.toFixed(2) }}<br>
          {{ price.total.toFixed(2) }}</p>
        </div>
        <div class="column">
          <p>{{ currency }}<br>
          {{ currency }}<br>
          {{ currency }}<br>
          {{ currency }}<br>
          {{ currency }}</p>
        </div>
        </div>
      </div>
      <div class="content">
        {{ packaging ? $t('withPackaging') : $t('withoutPackaging') }}
      </div>
      <div class="content">
        {{ $t('deliveryTo')}} {{ city }} [{{ country }}]<br>
        {{ $moment(max_delivery_date.toISOString()).fromNow() }} [{{ $utils.momentDate(max_delivery_date.toISOString()) }}]
      </div>
      </div>
      <footer class="card-footer">
      <a href="#" :class="publishButtonClass" @click="publishButton">{{ $t('publish')}}</a>
      </footer>
    </div>
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
  user : {
    username: null,
    email: null,
    email_verified: false
  },
  loadAmazonButtonClass: 'button is-primary is-outlined',
  publishButtonClass: 'card-footer-item',
  scrapedProduct: false,
  country: null,
  city: null,
  max_delivery_date: null,
  url: null,
  domain: null,
  slug: null,
  dp: null,
  referral: null,
  quantity: 1,
  reward: 5,
  title: null,
  weight: null,
  image: null,
  price: {},
  currency: null,
  packaging: false,
  countryError: false,
  countryType: null,
  cityError: false,
  cityType: null,
  dateError: false,
  dateType: null,
  amazonUrlError: false,
  amazonUrlType: null,
  quantityType: null,
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
    if (this.amazonUrlError === 'Field required') return this.$t('requiredField')
    else if (this.amazonUrlError === 'Invalid url') return this.$t('invalidUrl')
    else return this.$t('amazonUrlMessage')
  },
  quantityLabel() {
    return this.$t('quantityLabel') 
  },
  quantityMessage() {
    if (this.quantity < 1 || this.quantity > 10) return this.$t('invalidQuantity')
    else return this.$t('quantityMessage')
  },
  rewardLabel() {
    return this.$t('rewardLabel')    
  },
  rewardMessage() {
    return this.$t('rewardMessage')    
  },
  packagingLabel() {
    return this.$t('packagingLabel')
  },
  getImage() {
    return this.image.replace('https://m.media-amazon.com/images/I/', 'https://res.cloudinary.com/opengrabs/image/upload/h_210/amazon/')
  }
  },
  created() {
  this.$nuxt.$on('updateUser', ($event) => this.updateUser($event))
  },
  methods: {
  updateUser(user) {
    this.user = user
  },
  setCurrencyReferralPrice(domain, price) {
    switch (domain) {
    case 'fr':
      this.currency = 'EUR'
      this.referral = ''
      this.price.taxes = 0
      this.price.total = this.$utils.round((price * 1.06 * (this.reward / 100 + 1)) * this.quantity,2)
      break
    case 'de':
      this.currency = 'EUR'
      this.referral = ''
      this.price.taxes = 0
      this.price.total = this.$utils.round((price * 1.06 * (this.reward / 100 + 1)) * this.quantity,2)
      break
    case 'it':
      this.currency = 'EUR'
      this.referral = ''
      this.price.taxes = 0
      this.price.total = this.$utils.round((price * 1.06 * (this.reward / 100 + 1)) * this.quantity,2)
      break
    case 'es':
      this.currency = 'EUR'
      this.referral = ''
      this.price.taxes = 0
      this.price.total = this.$utils.round((price * 1.06 * (this.reward / 100 + 1)) * this.quantity,2)
      break
    case 'co.uk':
      this.currency = 'GBP'
      this.referral = ''
      this.price.taxes = 0
      this.price.total = this.$utils.round((price * 1.06 * (this.reward / 100 + 1)) * this.quantity,2)
      break
    case 'com':
      this.currency = 'USD'
      this.referral = 'opengrabs-20'
      this.price.taxes = this.$utils.round(price * 0.06 * this.quantity, 2)
      this.price.total = this.$utils.round((price * 1.06 * (this.reward / 100 + 1)) * this.quantity,2)
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
    this.amazonUrlType = 'is-danger'
    this.amazonUrlError = 'Field required'
    return false
    } else {
    const match = this.url.match(/(?:amazon.)(?<domain>fr|de|it|es|co.uk|com)(?:\/|\?)(?<slug>.+)(?:\/dp\/)(?<dp>\w+)(?:\/|\?|$)/)
    if (!match || !match.groups.domain || !match.groups.dp) {
      this.amazonUrlType = 'is-danger'
      this.amazonUrlError = 'Invalid url'
      return false
    }
    }
    return true
  },
  validateQuantity() {
    if (this.quantity < 1 || this.quantity > 10) {
    return false
    }
    return true
  },
  async loadAmazonData() {
    const match = this.url.match(/(?:amazon.)(?<domain>fr|de|it|es|co.uk|com)(?:\/|\?)(?<slug>.+)(?:\/dp\/)(?<dp>\w+)(?:\/|\?|$)/)
    this.domain = match.groups.domain
    this.slug = match.groups.slug
    this.dp = match.groups.dp
    const { data: { specifications: { title, weight, image, price }}} = await this.$axios.get(`/api/amazon/${this.domain}/${this.dp}`)
    this.title = title
    this.weight = weight
    this.image = image
    this.price = {
    product: price * this.quantity,
    shipping: 0.0,
    reward: this.$utils.round((price * 1.06 * (this.reward / 100)) * this.quantity, 2),
    }
    this.setCurrencyReferralPrice(this.domain, price)
    this.scrapedProduct = true
  },
  async loadAmazonButton() {
    this.countryType = null
    this.countryError = null
    this.cityType = null
    this.cityError = null
    this.dateType = null
    this.dateError = null
    this.amazonLinkType = null
    this.amazonUrlError = null
    const validCountry = this.validateCountry()
    const validCity = this.validateCity()
    const validDate = this.validateDate()
    const validUrl = this.validateAmazonLink()
    const validQuantity =this.validateQuantity()
    if (validCountry && validCity && validDate && validUrl && validQuantity) {
    this.loadAmazonButtonClass = 'button is-primary is-outlined is-loading'
    await this.loadAmazonData()
    this.loadAmazonButtonClass = 'button is-primary is-outlined'    
    }
  },
  async publishGrab() {
    const shop = {
    name: 'amazon',
    domain: this.domain,
    slug: this.slug,
    dp: this.dp,
    url: `https://amazon.${this.domain}/dp/${this.dp}?tag=${this.referral}`,
    title: this.title,
    weight: this.weight,
    image: this.image,
    quantity: this.quantity,
    price: this.price,
    currency: this.currency,
    packaging: this.packaging
    }
    const destination = {
    country: this.country,
    city: this.city,
    max_delivery_date: this.max_delivery_date.toISOString(),
    }
    await this.$grab.publish({ shop, destination })
  },
  resetForm() {
    this.scrapedProduct = false
    this.country = null
    this.city = null
    this.max_delivery_date = null
    this.url = null
    this.reward = 5
    this.quantity = 1
    this.packaging = false
  },
  async publishButton() {
    try {
    this.publishButtonClass = 'card-footer-item disabled'
    await this.publishGrab()
    const published = await this.$db.account.orders.filter('published')
    this.$store.commit('account/orders/setPublished', published)
    this.$store.commit('orders/setInitiated', false)
    this.publishButtonClass = 'card-footer-item'
    this.$buefy.toast.open({
      duration: 3000,
      message: this.$t('toastOrderPublished'),
      position: 'is-bottom',
      type: 'is-primary'
    })    
    this.resetForm()
    } catch ({ message }) {
    return message
    }
  },
  },
}
</script>
