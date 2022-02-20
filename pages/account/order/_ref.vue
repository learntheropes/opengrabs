<template>
    <section class="section container">
        <div class="columns">
            <div class="column is-half">
                <account-verify-username v-if="!user.username" />
                <account-verify-email v-if="!user.email||!user.email_verified" />
                <div v-if="user.username && user.email && user.email_verified">
                    <b-field :label="$t('amazonUrlLabel')" :type="amazonUrlType" :message="amazonUrlMessage">
                        <b-input v-model="url" type="text" expanded></b-input>
                    </b-field>
                    <b-field :label="$t('quantityLabel')" :type="quantityType" :message="quantityMessage">
                        <b-numberinput v-model="quantity" :min="1" :max="10" type="is-light"></b-numberinput>
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
                                {{ $t('total') }}</p>
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
                            {{ $moment(max_delivery_date).fromNow() }} [{{ $utils.momentDate(max_delivery_date) }}]
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
const getSupportedShops = (originCountry) => {
    switch(originCountry) {
        case 'United States':
            return ['amazon.com']
        case 'United Kingdom':
            return ['amazon.co.uk']
        case 'Italy':
            return ['amazon.it']
        case 'Spain':
            return ['amazon.es']
        case 'Germany':
            return ['amazon.de'] 
        case 'France':
            return ['amazon.fr']               
    }
}
export default {
    name: 'OrderRef',
    middleware: 'auth',
    async asyncData({ app, params: { ref }}) {
        const travel = await app.$db.travels.get(ref)
        const country = travel.destination_country
        const city = travel.destination_city
        const packaging = travel.packaging
        const reward = travel.reward
        const date = travel.date
        const max_delivery_date = travel.date
        const currency = travel.currency
        const traveler = travel.traveler
        const domain = travel.domain
        const supportedShops = getSupportedShops(travel.origin_country)
        return { ref, country, city, packaging, reward, date, max_delivery_date, currency, traveler, domain, supportedShops }
    },
    data: () => ({
        user : {
            username: null,
            email: null,
            email_verified: false
        },
        loadAmazonButtonClass: 'button is-primary is-outlined',
        publishButtonClass: 'card-footer-item',
        scrapedProduct: false,
        url: null,
        slug: null,
        dp: null,
        referral: null,
        quantity: 1,
        title: null,
        weight: null,
        image: null,
        price: {},
        amazonUrlError: false,
        amazonUrlType: null,
        quantityType: null,
    }),
    computed: {
        amazonUrlMessage() {
            if (this.amazonUrlError === 'Field required') return this.$t('requiredField')
            else if (this.amazonUrlError === 'Invalid url') return this.$t('invalidUrl')
            else if (this.amazonUrlError === 'Invalid shop') return this.$t('invaliShop')
            else return `${this.$t('amazonUrlMessage1')} ${this.supportedShops.join(', ')}`
        },
        quantityMessage() {
            if (this.quantity < 1 || this.quantity > 10) return this.$t('invalidQuantity')
            else return this.$t('quantityMessage')
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
        validateAmazonUrl() {
            if (!this.url) {
                this.amazonUrlType = 'is-danger'
                this.amazonUrlError = this.$t('requiredField')
                return false
            } else {
                const match = this.url.match(/(?:amazon.)(?<domain>fr|de|it|es|co.uk|com)(?:\/|\?)(?<slug>.+)(?:\/dp\/)(?<dp>\w+)(?:\/|\?|$)/)
                if (!match || !match.groups.domain || !match.groups.dp) {
                    this.amazonUrlType = 'is-danger'
                    this.amazonUrlError = this.$t('invalidUrl')
                return false
                } else if (match.groups.domain !== this.domain) {
                    this.amazonUrlType = 'is-danger'
                    this.amazonUrlError = this.$t('invalidShop')
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
            this.amazonUrlError = false
            this.amazonUrlType = null
            const validUrl = this.validateAmazonUrl()
            const validQuantity =this.validateQuantity()
            if (validUrl && validQuantity) {
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
                max_delivery_date: this.max_delivery_date,
            }
            const delivery = {
                date: this.date
            }
            const traveler = this.traveler
            const ref = this.ref
            await this.$grab.order({ ref, shop, destination, delivery, traveler })
        },
        resetForm() {
            this.scrapedProduct = false
            this.url = null
            this.slug = null
            this.dp = null
            this.referral = null
            this.title = null
            this.weight = null
            this.image = null
            this.quantity = 1
            this.price = {}
        },
        async publishButton() {
            try {
                this.publishButtonClass = 'card-footer-item disabled'
                await this.publishGrab()
                const published = await this.$db.account.orders.filter('published')
                this.$store.commit('account/orders/setPublished', published)
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
    }
}
</script>
