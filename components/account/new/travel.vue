<template>
    <section class="section container">
        <div class="columns">
            <div class="column is-half">
                <account-verify-email v-if="!emailExists" />
                <div v-else>
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
                    <button class="button" @click="loadTravelButton">{{ $t('previewTravel')}}</button>
                </div>
            </div>
            <div v-if="showPreview" class="column is-half">
                <div class="card">
                    <div class="card-content">
                        <div class="content">
                            {{ $t('travelFrom') }} {{ originObject.name }}<br>
                            {{ $t('travelTo') }} {{ destinationCity}} ({{ destinationCountry }})<br>
                            {{ $t('travelBudget') }} {{ parseFloat(travelBudget).toFixed(2) }} {{ originObject.currency }}
                        </div>
                        <div class="content">
                            {{ $t('publishedBy') }} {{ travelerName }}<br>
                            {{ $moment(travelPublishedAt).fromNow() }} 
                        </div>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item" @click="publishTravelButton">{{ $t('publish')}}</a>
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
        emailExists: false,
        allOrigins: [
            { value: 'us', name: 'United States', currency: 'USD' },
            { value: 'uk', name: 'United Kingdom', currency: 'GBP' },
            { value: 'it', name: 'Italy', currency: 'EUR' },
            { value: 'es', name: 'Spain', currency: 'EUR'  },
            { value: 'de', name: 'Germany', currency: 'EUR'  },
            { value: 'fr', name: 'France', currency: 'EUR'  },
        ],
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
        this.$nuxt.$on('updateEmailExists', ($event) => this.updateEmailExists($event))
    },
    methods: {
        updateEmailExists(values) {
            this.emailExists = values[0]
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
        loadTravelButton() {
            this.originCountryError = false
            this.originCountryType = null
            this.destinationCountryError = false
            this.destinationCountryType = null
            this.destinationCityError = false
            this.destinationCityType = null
            const validOriginCountry = this.validateOriginCountry()
            const validDestinationCountry = this.validateDestinationCountry()
            const validDestinationCity = this.validateDestinationCity()
            const validTravelDate = this.validateTravelDate()
            const validTravelBudget = this.validateTravelBudget()
            if (validOriginCountry && validDestinationCountry && validDestinationCity && validTravelDate && validTravelBudget) {
                this.travelPublishedAt = new Date().toISOString()
                this.showPreview = true
            }
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
            this.showPreview = false
        },
        async publishTravelButton() {
            const props = {
                status: (parseFloat(this.travelBudget) > 0) ? 'active' : 'fully_booked',
                origin_country: this.originCountry,
                destination_country: this.destinationCountry,
                destination_city: this.destinationCity,
                date: this.travelDate.toISOString(),
                reward: this.travelReward,
                budget: parseFloat(this.travelBudget),
                currency: this.travelCurrency,
                published_at: this.travelPublishedAt,
                domain: this.domain
            }
            await this.$db.travels.create({ props })
            this.resetForm()
        }
    }
}
</script>