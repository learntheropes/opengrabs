<template>
    <section class="section">
        <div class="columns is-multiline">
            <div v-for="travel of travels" :key="travel.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
                <div class="card card-equal-height">
                    <div class="card-content">
                        <div class="content">
                            {{ $t('travelFrom') }} {{ travel.origin_country }}<br>
                            {{ $t('travelTo') }} {{ travel.destination_city}} ({{ travel.destination_country }})<br>
                        </div>
                        <div class="content">
                            {{ $moment(travel.date).fromNow() }} ({{ $moment(travel.date).format('MMMM Do YYYY') }})
                        </div>
                        <div class="content">
                            {{ $t('travelBudget') }} {{ travel.budget.toFixed(2) }} {{ travel.currency }}
                        </div>
                        <div class="content">
                            {{ $t('publishedAt') }} {{ $moment(travel.published_at).fromNow() }} 
                        </div>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item" @click="remove(travel.ref)">{{ $t('remove') }}</a>
                    </footer>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'TravelsExpired',
    props: {
        travels: {
            type: Array,
            default: () => [],
        },
    },
    methods: {
        async remove(ref) {
            await this.$travel.remove(ref)
        } 
    }
}
</script>
