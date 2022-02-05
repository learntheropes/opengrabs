<template>
    <div class="card card-equal-height has-text-centered">
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
                {{ $t('publishedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { ref: travel.traveler.username }})">{{ travel.traveler.username }}</nuxt-link><br>
                {{ $moment(travel.published_at).fromNow() }} 
            </div>
        </div>
        <footer class="card-footer">
            <nuxt-link v-if="authenticated && authenticatedUserId !== travel.traveler.sub" :to="localePath({ name: 'account-order-ref', params: { ref: travel.ref }})" class="card-footer-item">{{ $t('order') }}</nuxt-link>
            <a v-if="!authenticated" href="#" class="card-footer-item" @click="login">{{ $t('loginToOrder') }}</a>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'TravelCard',
    props: {
        travel: {
            type: Object,
            default: () => {},
        },
    },
    computed: {
        authenticated() {
            return this.$store.state.auth.loggedIn
        },
        authenticatedUserId() {
            return this.$store.state.auth.loggedIn ? this.$store.state.auth.user.sub : false
        },
    },
    methods: {
        login() {
            this.$auth.$storage.setUniversal('redirect', this.$route.path)
            this.$auth.loginWith('auth0')
        },
    }
}
</script>