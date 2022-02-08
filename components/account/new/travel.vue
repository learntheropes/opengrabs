<template>
    <section class="section container">
        <div class="columns">
            <div class="column is-half">
                <account-verify-username v-if="!user.username" />
                <account-verify-email v-if="!user.email||!user.email_verified" />
                <div v-if="user.username && user.email && user.email_verified">
                    <b-field :label="$t('originCountryLabel')" :type="originCountryType" :message="originCountryMessage">
                        <b-select v-model="originObject" :placeholder="$t('originCountryPlaceholder')" expanded>
                            <option v-for="oneCountry in originCountries" :key="oneCountry.value" :value="oneCountry">
                                {{ oneCountry.name }}
                            </option>
                        </b-select>
                    </b-field>
                    <b-field :label="$t('destinationCountryLabel')" :type="destinationCountryType" :message="destinationCountryMessage">
                        <b-select v-model="destinationCountry" :placeholder="$t('destinationCountryPlaceholder')" expanded>
                            <option v-for="oneCountry in destinationCountries" :key="oneCountry.alpha2Code" :value="oneCountry.name">
                                {{ oneCountry.name }}
                            </option>
                        </b-select>
                    </b-field>
                    <b-field :label="$t('destinationCityLabel')" :type="destinationCityType" :message="destinationCityMessage">
                        <b-select v-model="destinationCity" :placeholder="$t('destinationCityPlaceholder')" expanded>
                            <option v-for="(oneCity, index) in destinationCities" :key="index" :value="oneCity.name">
                                {{ oneCity.name }}
                            </option>
                        </b-select>
                    </b-field>
                    <b-field :label="$t('travelDateLabel')" :type="travelDateType" :message="travelDateMessage">
                        <b-datepicker v-model="travelDate" :min-date="new Date()" icon="calendar-today" editable />
                    </b-field>
                    <b-field :label="$t('travelRewardLabel')" :message="$t('travelRewardMessage')">
                        <b-slider v-model="travelReward" :min="5" :max="50" :step="5" ticks />
                    </b-field>
                    <b-field :label="$t('travelBudgetLabel')" :type="travelBudgetType" :message="travelBudgetMessage">
                        <b-input v-model="travelBudget" type="text" expanded></b-input>
                        <p class="control">
                            <span class="button is-static">{{ travelCurrency }}</span>
                        </p>
                    </b-field>
                    <button :class="loadTravelButtonClass" @click="loadTravelButton">{{ $t('previewTravel')}}</button>
                </div>
            </div>
            <div v-if="showPreview" class="column is-half">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">{{ originCountry }} - {{  destinationCity }}</p>
                    </header> 
                    <div class="card-image">
                        <figure style="background-color: grey" class="image">
                            <img :src="destinationPhoto" :alt="'Image of ' + destinationCity" />
                        </figure>
                    </div>
                    <div class="card-content">
                        <div class="content">
                            {{ $t('travelFrom') }} {{ originObject.name }}<br>
                            {{ $t('travelTo') }} {{ destinationCity}} ({{ destinationCountry }})<br>
                        </div>
                        <div class="content">
                            {{ $t('travelBudget') }} {{ parseFloat(travelBudget).toFixed(0) }} {{ originObject.currency }}
                        </div>
                        <div class="content">
                            {{ $t('publishedBy') }} {{ user.username }}<br>
                            {{ $moment(travelPublishedAt).fromNow() }} 
                        </div>
                    </div>
                    <footer class="card-footer">
                        <a href="#" :class="publishButtonClass" @click="publishTravelButton">{{ $t('publish')}}</a>
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
    name: 'TravelNew',
    middleware: 'auth',
    data: () => ({
        user : {
            username: null,
            email: null,
            email_verified: false
        },
        allOrigins: [
            { value: 'us', name: 'United States', currency: 'USD' },
            { value: 'uk', name: 'United Kingdom', currency: 'GBP' },
            { value: 'it', name: 'Italy', currency: 'EUR' },
            { value: 'es', name: 'Spain', currency: 'EUR'  },
            { value: 'de', name: 'Germany', currency: 'EUR'  },
            { value: 'fr', name: 'France', currency: 'EUR'  },
        ],
        loadTravelButtonClass: 'button is-primary is-outlined',
        publishButtonClass: 'card-footer-item',
        originObject: null,
        originCountryError: false,
        originCountryType: null,
        destinationCountry: null,
        destinationCountryError: false,
        destinationCountryType: null,
        destinationCity: null,
        destinationCityError: false,
        destinationCityType: null,
        travelDate: null,
        travelDateError: false,
        travelDateType: null,
        travelReward: null,
        travelBudget: null,
        travelBudgetError: false,
        travelBudgetType: null,
        travelPublishedAt: null,
        destinationPhoto: null,
        showPreview: false,
    }),
    computed: {
        originCountries() {
            return sortBy(this.allOrigins, 'name')
        },
        originCountry() {
            return (this.originObject) ? this.originObject.name : null
        },
        originCountryMessage() {
            if (this.originCountryError === 'Field required') return this.$t('requiredField')
            else return this.$t('originCountryMessage')
        },
        destinationCountries() {
            return sortBy(allCountries, 'name')
        },
        destinationCountryMessage() {
            if (this.destinationCountryError === 'Field required') return this.$t('requiredField')
            else return this.$t('destinationCountryMessage')
        },
        destinationCities() {
            if (this.destinationCountry) {
                return sortBy(filter(allCities, { country: this.destinationCountry }), 'name')
            } else {
                return []
            }
        },
        destinationCityMessage() {
            if (this.destinationCityError === 'Field required') return this.$t('requiredField')
            else return this.$t('destinationCityMessage')
        },
        travelDateMessage() {
            if (this.travelDateError === 'Field required') return this.$t('requiredField')
            else return this.$t('travelDateMessage')
        },
        travelBudgetMessage() {
            if (this.travelBudgetError === 'Field required') return this.$t('requiredField')
            else if (this.travelBudgetError === 'Invalid badget') return this.$t('invalidBudget')
            else return this.$t('travelBudgetMessage')
        },
        travelCurrency() {
            return (this.originObject) ? this.originObject.currency : null
        },
        travelerName() {
            const user = this.$store.state.auth.user
            return `${user.given_name} ${user.family_name}`.replace(/-/g, ' ')
        },
        domain() {
            switch (this.originObject.name) {
                case 'United States':
                    return 'com'
                case 'United Kingdom':
                    return 'co.uk'
                case 'Italy':
                    return 'it'
                case 'Spain':
                    return 'es'
                case 'Germany':
                    return 'de'
                case 'France':
                    return 'fr'
                default:
                    return null
            }            
        }
    },
    created() {
        this.$nuxt.$on('updateUser', ($event) => this.updateUser($event))
        
        const user = await this.$user.get()
        if (process.env.URL && user.username && user.email && this.$Tawk.$isInit()) {
            const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
            this.$Tawk.$updateChatUser({ name: user.username, email: user.email, emailHmac: hash})

            const attributes = {
                'sub': this.$store.$auth.user.sub,
                'network': (process.env.BTC_CHAIN === 'test3') ? 'testnet': 'mainnet'
            }
            this.$Tawk.$setAttribute(attributes)
        }
    },
    methods: {
        updateUser(user) {
            this.user = user
        },
        validateOriginCountry() {
            if (!this.originCountry) {
                this.originCountryType = 'is-danger'
                this.originCountryError = 'Field required'
                return false
            }
            return true
        },
        validateDestinationCountry() {
            if (!this.destinationCountry) {
                this.destinationCountryType = 'is-danger'
                this.destinationCountryError = 'Field required'
                return false
            }
            return true
        },
        validateDestinationCity() {
            if (!this.destinationCity) {
                this.destinationCityType = 'is-danger'
                this.destinationCityError = 'Field required'
                return false
            }
            return true
        },
        validateTravelDate() {
            if (!this.destinationCity) {
                this.travelDateType = 'is-danger'
                this.travelDateError = 'Field required'
                return false
            }
            return true
        },
        validateTravelBudget() {
            if (!this.travelBudget) {
                this.travelBudgetType = 'is-danger'
                this.travelBudgetError = 'Field required'
                return false                
            } else {
                const regex = /^\d+$/
                const isValidFormat = regex.test(this.travelBudget)
                if (!isValidFormat) {
                    this.travelBudgetType = 'is-danger'
                    this.travelBudgetError = 'Invalid badget'              
                }
                return isValidFormat
            }
        },
        async loadTravelButton() {
            this.originCountryError = false
            this.originCountryType = null
            this.destinationCountryError = false
            this.destinationCountryType = null
            this.destinationCityError = false
            this.destinationCityType = null
            this.loadTravelButtonClass = 'button is-primary is-outlined is-loading'
            const validOriginCountry = this.validateOriginCountry()
            const validDestinationCountry = this.validateDestinationCountry()
            const validDestinationCity = this.validateDestinationCity()
            const validTravelDate = this.validateTravelDate()
            const validTravelBudget = this.validateTravelBudget()
            if (validOriginCountry && validDestinationCountry && validDestinationCity && validTravelDate && validTravelBudget) {
                this.destinationPhoto = await this.$db.travels.getPhoto(`${this.destinationCity},${this.destinationCountry}`)
                this.travelPublishedAt = new Date().toISOString()
                this.showPreview = true
            }
            this.loadTravelButtonClass = 'button is-primary is-outlined'
        },
        resetForm() {
            this.originObject = null
            this.originCountryError = false
            this.originCountryType = null
            this.destinationCountry = null
            this.destinationCountryError = false
            this.destinationCountryType = null
            this.destinationCity = null
            this.destinationCityError = false
            this.destinationCityType = null
            this.travelDate = null
            this.travelDateError = false
            this.travelDateType = null
            this.travelReward = null
            this.travelBudget = null
            this.travelBudgetError = false
            this.travelBudgetType = null
            this.travelPublishedAt = null
            this.destinationPhoto = null
            this.showPreview = false
        },
        async publishTravelButton() {
            this.publishButtonClass = 'card-footer-item disabled'
            const props = {
                status: (parseFloat(this.travelBudget) > 0) ? 'active' : 'fully_booked',
                origin_country: this.originCountry,
                destination_country: this.destinationCountry,
                destination_city: this.destinationCity,
                destination_photo: this.destinationPhoto,
                date: this.travelDate.toISOString(),
                reward: this.travelReward,
                budget: parseFloat(this.travelBudget),
                currency: this.travelCurrency,
                published_at: this.travelPublishedAt,
                domain: this.domain
            }
            await this.$travel.create({ props })
            this.publishButtonClass = 'card-footer-item'
            this.$buefy.toast.open({
                duration: 3000,
                message: this.$t('toastTravelPublished'),
                position: 'is-bottom',
                type: 'is-primary'
            })    
            this.resetForm()
            this.$store.commit('account/travels/setInitiated', false)
            this.$store.commit('travels/setInitiated', false)
        }
    }
}
</script>