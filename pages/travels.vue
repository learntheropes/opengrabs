<template>
    <section class="section container">

        <div class="block">
            <b-field position="is-centered" grouped group-multiline>
                <b-select v-model="originCountry" :placeholder="$t('byOriginCountry')">
                    <option v-for="oneCountry in originCountriesSelection" :key="oneCountry" :value="oneCountry">
                        {{ oneCountry }}
                    </option>
                </b-select>
                <p class="control">
                    <b-select v-model="destinationCountry" :placeholder="$t('byDestinationCountry')">
                        <option v-for="oneCountry in destinationCountriesSelection" :key="oneCountry" :value="oneCountry">
                            {{ oneCountry }}
                        </option>
                    </b-select>
                </p>
                <p class="control">
                    <b-select v-model="destinationCity" :placeholder="$t('byDestinationCity')">
                        <option v-for="oneCity in destinationCitiesSelection" :key="oneCity" :value="oneCity">
                            {{ oneCity }}
                        </option>
                    </b-select>
                </p>
                <p class="control">
                    <b-button :label="$t('filter')" class="is-primary" outlined @click="filter" />
                </p>
                <p v-if="filteredTravels" class="control">
                    <b-button :label="$t('removeFilter')" @click="removeFilters" />
                </p>
            </b-field>
        </div>

        <div v-if="filteredTravels" class="columns is-multiline">
            <div v-for="travel of filteredTravels" :key="travel.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
                <travels-card :travel="travel" />
            </div>
        </div>

        <div v-else class="columns is-multiline">
            <div v-for="travel of travels" :key="travel.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
                <travels-card :travel="travel" />
            </div>
        </div>

    </section>
</template>

<script>
import orderBy from 'lodash.orderby'
import filter from 'lodash.filter'
import uniq from 'lodash.uniq'
import { mapState } from 'vuex'
export default {
    name: 'Travels',
    auth: false,
    data: () => ({
        originCountry: null,
        destinationCountry: null,
        destinationCity: null,
        filteredTravels: null
    }),
    async fetch({ app, store }) {
        if (!store.state.travels.initiated) {
            const data = await app.$db.travels.filter('active')
            const travels = orderBy(data, ['data.published_at'], ['desc'])
            store.commit('travels/setTravels', travels)
            store.commit('travels/setInitiated', true)
        }
    },
    head() {
        return {
            title: this.$t('seo.travels'),
            link: [
                {
                    hid: 'canonical',
                    rel: 'canonical',
                    href: `https://${process.env.URL}/${this.$i18n.locale}/travels`,
                },
            ],
        }
    },
    computed: {
        ...mapState({
            travels: (state) => state.travels.list,
        }),
        originCountriesSelection() {
            return uniq(this.travels.map(travel => travel.origin_country))
        },
        destinationCountriesSelection() {
            return uniq(this.travels.map(travel => travel.destination_country))
        },
        destinationCitiesSelection() {
            return uniq(this.travels.map(travel => travel.destination_city))
        }
    },
    methods: {
        filter() {
            if (this.originCountry && this.destinationCountry && this.destinationCity) {
                this.filteredTravels = filter(this.travels, (travel) => travel.origin_country === this.originCountry && travel.destination_country === this.destinationCountry && travel.destination_city === this.destinationCity)
            }
            else if (this.originCountry && this.destinationCountry && !this.destinationCity) {
                this.filteredTravels = filter(this.travels, (travel) => travel.origin_country === this.originCountry && travel.destination_country === this.destinationCountry)
            }
            else if (this.originCountry && !this.destinationCountry && this.destinationCity) {
                this.filteredTravels = filter(this.travels, (travel) => travel.origin_country === this.originCountry && travel.destination_city === this.destinationCity)
            }
            else if (!this.originCountry && this.destinationCountry && this.destinationCity) {
                this.filteredTravels = filter(this.travels, (travel) => travel.destination_country === this.destinationCountry && travel.destination_city === this.destinationCity)
            }
            else if (this.originCountry && !this.destinationCountry && !this.destinationCity) {
                this.filteredTravels = filter(this.travels, (travel) => travel.origin_country === this.originCountry)
            }
            else if (!this.originCountry && !this.destinationCountry && this.destinationCity) {
                this.filteredTravels = filter(this.travels, (travel) => travel.destination_city === this.destinationCity)
            }
            else if (!this.originCountry && this.destinationCountry && !this.destinationCity) {
                this.filteredTravels = filter(this.travels, (travel) => travel.destination_country === this.destinationCountry)
            }
        },
        removeFilters() {
            this.originCountry = null
            this.destinationCountry = null
            this.destinationCity = null
            this.filteredTravels = null
    }
    }
}
</script>
