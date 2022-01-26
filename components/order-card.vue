<template>
    <div class="card card-equal-height">
        <div class="card-image">
            <figure :style="'background-color:grey;'" class="image">
                <img :src="order.shop.image" :alt="'Image of ' + order.shop.title"/>
            </figure>
        </div>
        <div class="card-content">
            <div class="media">
                <div class="media-content">
                    <p class="title is-5">
                        {{ order.shop.title }}
                    </p>
                </div>
            </div>
            <div class="content">
                <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ order.shop.name }}.{{ order.shop.domain }}</a>
            </div>
            <div class="content">
                <div class="columns">
                    <div class="column">
                        <p>{{ $t('product') }}:</p>
                        <p>{{ $t('reward') }}:</p>
                        <p>{{ $t('total') }}:</p>
                    </div>
                    <div class="column" align="right">
                        <p>{{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes).toFixed(2) }}</p>
                        <p>{{ order.shop.price.reward.toFixed(2) }}</p>
                        <p>{{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes+order.shop.price.reward).toFixed(2) }}</p>
                    </div>
                    <div class="column">
                        <p>{{ order.shop.currency }}</p>
                        <p>{{ order.shop.currency }}</p>
                        <p>{{ order.shop.currency }}</p>
                    </div>
                </div>
            </div>
            <div class="content">
              {{ $t('deliveryTo') }} <strong>{{ order.destination.city }} [{{ order.destination.country }}]</strong><br>
               {{ $moment(order.destination.max_delivery_date).fromNow() }} <strong>[{{ $utils.momentDate(order.destination.max_delivery_date) }}]</strong>
            </div>
            <div class="content">
              {{ $t('publishedAt') }} {{ $moment(order.published_at).fromNow() }}
            </div>
        </div>
        <footer class="card-footer">
            <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ $utils.capitalize(order.shop.name) }}</a>
            <nuxt-link v-if="authenticated && authenticatedUserId !== order.buyer.sub" :to="{ name: 'account-book-by-ref', params: { ref: order.ref } }" class="card-footer-item">{{ $t('book') }}</nuxt-link>
            <a v-if="!authenticated" href="#" class="card-footer-item" @click="login">{{ $t('loginToBook') }}</a>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'Order',
    props: {
        order: {
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
