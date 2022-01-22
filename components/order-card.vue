<template>
    <div class="card card-equal-height">
        <div class="card-image">
            <figure :style="'background-color:grey;'" class="image">
                <img :src="order.amazon.image" :alt="'Image of ' + order.amazon.title"/>
            </figure>
        </div>
        <div class="card-content">
            <div class="media">
                <div class="media-content">
                    <p class="title is-5">
                        {{ order.amazon.title }}
                    </p>
                </div>
            </div>
            <div class="content">
                <a :href="order.amazon.url" target="_blank" class="card-footer-item">amazon.{{ order.amazon.domain }}</a>
            </div>
            <div class="content">
                <div class="columns">
                    <div class="column">
                        <p>Product:</p>
                        <p>Reward:</p>
                    </div>
                    <div class="column" align="right">
                        <p>{{ (order.amazon.price.product+order.amazon.price.shipping+order.amazon.price.taxes).toFixed(2) }}</p>
                        <p>{{ order.amazon.price.reward.toFixed(2) }}</p>
                    </div>
                    <div class="column">
                        <p>{{ order.amazon.currency }}</p>
                        <p>{{ order.amazon.currency }}</p>
                    </div>
                </div>
            </div>
            <div class="content">
              Delivery to <strong>{{ order.destination.city }} [{{ order.destination.country }}]</strong><br>
              in max {{ $moment(order.destination.max_delivery_date).fromNow() }} <strong>[{{ $utils.momentDate(order.destination.max_delivery_date) }}]</strong>
            </div>
            <div class="content">
              Published {{ $moment(order.published_at).fromNow() }}
            </div>
        </div>
        <footer class="card-footer">
            <a :href="order.amazon.url" target="_blank" class="card-footer-item">Amazon</a>
            <nuxt-link v-if="authenticated && authenticatedUserId !== order.buyer.sub" :to="{ name: 'account-book-by-ref', params: { ref: order.ref } }" class="card-footer-item">Book</nuxt-link>
            <a v-if="!authenticated" href="#" class="card-footer-item" @click="login">Login to book</a>
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
