<template>
    <div class="card card-equal-height">
        <header class="card-header">
            <p class="card-header-title">{{ travel.origin_country }} - {{  travel.destination_city }}</p>
        </header> 
        <div class="card-image">
            <figure style="background-color: grey" class="image">
                <img :src="getImage" :alt="'Image of ' + travel.destination_city" :title="'Image of ' + order.shop.title" loading="lazy" />
            </figure>
        </div>
        <div class="card-content">
            <div class="content">
                {{ $t('travelFrom') }} {{ travel.origin_country }}<br>
                {{ $t('travelTo') }} {{ travel.destination_city}} ({{ travel.destination_country }})<br>
            </div>
            <div class="content">
                {{ $moment(travel.date).fromNow() }} ({{ $moment(travel.date).format('MMMM Do YYYY') }})
            </div>
            <div class="content">
                {{ $t('travelBudget') }} {{ travel.budget.toFixed(0) }} {{ travel.currency }}
            </div>
            <div class="content">
                {{ travel.packaging ? $t('withPackaging') : $t('withoutPackaging') }}
            </div>
            <div class="content">
                {{ $t('publishedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: travel.traveler.username }})">{{ travel.traveler.username }}</nuxt-link><br>
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
        getImage() {
            return this.travel.destination_photo.replace('https://lh3.googleusercontent.com/places/', 'https://res.cloudinary.com/opengrabs/image/upload/h_210/places/')
        }
    },
    methods: {
        login() {
            this.$auth.$storage.setUniversal('redirect', this.$route.path)
            this.$auth.loginWith('auth0')
        },
    }
}
</script>
