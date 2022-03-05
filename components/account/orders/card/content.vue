<template>
    <div>
        <header class="card-header">
            <p class="card-header-title">{{ order.shop.slug.replace(/-/g,' ')}}</p>
        </header> 
        <div class="card-image">
            <figure :style="'background-color:grey;'" class="image">
                <img :src="getImage(order)" :alt="'Image of ' + order.shop.title"/>
            </figure>
        </div>
        <div class="card-content">
            <div class="content">
                {{ order.shop.quantity }} {{ $t('items') }}
            </div>
            <div class="content">
                <div class="columns is-mobile">
                    <div class="column">
                        <p>{{ $t('product') }}:<br>
                            {{ $t('reward') }}:<br>
                            {{ $t('total') }}:
                        </p>
                    </div>
                    <div class="column" align="right">
                        <p>{{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes).toFixed(2) }}<br>
                            {{ order.shop.price.reward.toFixed(2) }}<br>
                            {{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes+order.shop.price.reward).toFixed(2) }}
                        </p>
                    </div>
                    <div class="column">
                        <p>{{ order.shop.currency }}<br>
                            {{ order.shop.currency }}<br>
                            {{ order.shop.currency }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="content">
                {{ order.shop.packaging ? $t('withPackaging') : $t('withoutPackaging') }}
            </div>
            <div class="content">
                {{ $t('deliveryTo') }} {{ order.destination.city }} [{{ order.destination.country }}]<br>
                <p v-if="isPublished">{{ $moment(order.destination.max_delivery_date).fromNow() }} [{{ $utils.momentDate(order.destination.max_delivery_date) }}]</p>
                <p v-else>{{ $moment(order.delivery.date).fromNow() }} [{{ $utils.momentDate(order.delivery.date) }}]</p>
            </div>
            <div class="content">
                {{ $t('publishedAt') }} {{ $moment(order.published_at).fromNow() }}
            </div>
            <div v-if="isBooked" class="content">
                {{ $t('bookedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: order.traveler.username }})">{{ order.traveler.username }}</nuxt-link><br>
                {{ $moment(order.booked_at).fromNow() }}
            </div>
            <div v-if="isUnderpaid" class="content">
                {{ $t('underpaidAt') }} {{ $moment(order.underpaid_at).fromNow() }}
            </div>
            <div v-if="isPaid" class="content">
                {{ $t('paidAt') }} {{ $moment(order.paid_at).fromNow() }}
            </div>
            <div v-if="isBought" class="content">
                {{ $t('boughtBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: order.traveler.username }})">{{ order.traveler.username }}</nuxt-link><br>
                {{ $moment(order.bought_at).fromNow() }}
            </div>
            <div v-if="isDelivered" class="content">
                {{ $t('deliveredBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: order.traveler.username }})">{{ order.traveler.username }}</nuxt-link><br>
                {{ $moment(order.delivered_at).fromNow() }}
            </div>
            <div v-if="isDisputed" class="content">
                {{ $t('disputedAt') }} {{ $moment(order.disputed_at).fromNow() }}
            </div>
            <div v-if="isRefunded" class="content">
                {{ $t('refundedAt') }} {{ $moment(order.refunded_at).fromNow() }}
            </div>
            <div v-if="isReleased" class="content">
                {{ $t('releasedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: order.traveler.username }})">{{ order.traveler.username }}</nuxt-link><br>
                {{ $moment(order.released_at).fromNow() }}
            </div>
            <div v-if="isWithdrawn" class="content">
              {{ $t('withdrawnAt') }} {{ $moment(order.withdrawn_at).fromNow() }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        order: {
            type: Object,
            default: () => {},
        },
    },
    computed: {
        isPublished() {
            return this.order.status === 'published'
        },
        isBooked() {
            return this.order.status !== 'published'
        },
        isUnderpaid() {
            return this.order.status === 'underpaid'
        },
        isPaid() {
            return this.order.status === 'paid'
        },
        isBought() {
            return this.order.status === 'bought'
        },
        isDelivered() {
            return this.order.status === 'delivered'
        },
        isDisputed() {
            return this.order.status === 'disputed'
        },
        isRefunded() {
            return this.order.status === 'refunded'
        },
        isReleased() {
            return this.order.status === 'released'
        },
        isWithdrawn() {
            return this.order.status === 'withdrawn'
        }
    },
    methods: {
        getImage(order) {
            return order.shop.image.replace('https://m.media-amazon.com/images/I/', 'https://ik.imagekit.io/opengrabs/amazon/tr:h-210/')
        }
    }
}
</script>