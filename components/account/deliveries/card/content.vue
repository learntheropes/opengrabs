<template>
    <div>
        <header class="card-header">
            <p class="card-header-title">{{ delivery.shop.slug.replace(/-/g,' ')}}</p>
        </header> 
        <div class="card-image">
            <figure :style="'background-color:grey;'" class="image">
                <img :src="getImage(delivery)" :alt="'Image of ' + delivery.shop.title"/>
            </figure>
        </div>
      <div class="card-content">
            <div class="content">
                {{ delivery.shop.quantity }} {{ $t('items') }}
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
                        <p>{{ (delivery.shop.price.product+delivery.shop.price.shipping+delivery.shop.price.taxes).toFixed(2) }}<br>
                            {{ delivery.shop.price.reward.toFixed(2) }}<br>
                            {{ (delivery.shop.price.product+delivery.shop.price.shipping+delivery.shop.price.taxes+delivery.shop.price.reward).toFixed(2) }}
                        </p>
                    </div>
                    <div class="column">
                        <p>{{ delivery.shop.currency }}<br>
                            {{ delivery.shop.currency }}<br>
                            {{ delivery.shop.currency }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="content">
                {{ delivery.shop.packaging ? $t('withPackaging') : $t('withoutPackaging') }}
            </div>
            <div class="content">
                {{ $t('deliveryTo') }} {{ delivery.destination.city }} [{{ delivery.destination.country }}]<br>
                {{ $moment(delivery.delivery.date).fromNow() }} [{{ $utils.momentDate(delivery.delivery.date) }}]
            </div>
            <div class="content">
                {{ $t('publishedBy') }} {{ delivery.buyer.name }}<br>
                {{ $moment(delivery.published_at).fromNow() }}
            </div>
            <div v-if="isBooked" class="content">
                {{ $t('bookedAt') }} {{ $moment(delivery.booked_at).fromNow() }}
            </div>
            <div v-if="isBought" class="content">
                {{ $t('boughtAt') }} {{ $moment(delivery.bought_at).fromNow() }}
            </div>
            <div v-if="isDelivered" class="content">
                {{ $t('deliveredAt') }} {{ $moment(delivery.delivered_at).fromNow() }}
            </div>
            <div v-if="isDisputed" class="content">
                {{ $t('disputedAt') }} {{ $moment(delivery.disputed_at).fromNow() }}
            </div>
            <div v-if="isPaid" class="content">
                {{ $t('paidBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: delivery.buyer.username }})">{{ delivery.buyer.username }}</nuxt-link><br>
                {{ $moment(delivery.paid_at).fromNow() }}
            </div>
            <div v-if="isRefunded" class="content">
                {{ $t('refundedTo') }} {{ delivery.buyer.name }}<br>
                {{ $moment(delivery.refunded_at).fromNow() }}
            </div>
            <div v-if="isReleased" class="content">
                {{ $t('releasedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: delivery.buyer.username }})">{{ delivery.buyer.username }}</nuxt-link><br>
                {{ $moment(delivery.released_at).fromNow() }}
            </div>
            <div v-if="isWithdrawn" class="content">
                {{ $t('withdrawnAt') }} {{ $moment(delivery.withdrawn_at).fromNow() }}
            </div>
          </div>
    </div>
</template>

<script>
export default {
    props: {
        delivery: {
            type: Object,
            default: () => {},
        },
    },
    computed: {
        isBooked() {
            return this.delivery.status === 'booked' || this.delivery.status === 'underpaid'
        },
        isBought() {
            return this.delivery.status === 'bought'
        },
        isDelivered() {
            return this.delivery.status === 'delivered'
        },
        isDisputed() {
            return this.delivery.status === 'disputed'
        },
        isPaid() {
            return this.delivery.status === 'paid'
        },
        isRefunded() {
            return this.delivery.status === 'refunded'
        },
        isReleased() {
            return this.delivery.status === 'released'
        },
        isWithdrawn() {
            return this.delivery.status === 'withdrawn'
        }
    },
    methods: {
        getImage(delivery) {
            return delivery.shop.image.replace('https://m.media-amazon.com/images/I/', 'https://ik.imagekit.io/opengrabs/amazon/tr:h-210/')
        },
    }
}
</script>