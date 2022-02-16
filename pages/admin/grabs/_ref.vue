<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Grab {{ ref }}</h1>
                <div class="columns">
                    <div class="column is-half">
                        <div class="box">
                            <div class="content">
                                <p>Buyer: {{ grab.buyer.username }}</p>
                                <p>Traveler: {{ grab.traveler.username }}</p>
                                <p v-if="grab.shop.slug">Product: <a :href="grab.shop.url" target="_blank">{{ grab.shop.slug.replace(/-/g,' ') || grab.shop.title }}</a></p>
                                <p>Price: {{ grab.shop.price.total.toFixed(2) }} {{ grab.shop.currency }}</p>
                                <p>Delivery date: {{ $moment(grab.delivery.date).fromNow() }} [{{ $utils.momentDate(grab.delivery.date) }}]</p>
                                <p v-if="grab.published_at">Published {{ $moment(grab.published_at).fromNow() }} [{{ $moment(grab.published_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.booked_at">Booked {{ $moment(grab.booked_at).fromNow() }} [{{ $moment(grab.booked_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.paid_at">Paid {{ $moment(grab.paid_at).fromNow() }} [{{ $moment(grab.paid_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.bought_at">Bought {{ $moment(grab.bought_at).fromNow() }} [{{ $moment(grab.bought_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.delivered_at">Delivered {{ $moment(grab.delivered_at).fromNow() }} [{{ $moment(grab.delivered_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.released_at">Released {{ $moment(grab.released_at).fromNow() }} [{{ $moment(grab.released_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.withdrawn_at">Withdrawn {{ $moment(grab.withdrawn_at).fromNow() }} [{{ $moment(grab.withdrawn_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.refunded_at">Refunded {{ $moment(grab.refunded_at).fromNow() }} [{{ $moment(grab.refunded_at).format('MMMM Do YYYY HH:mm') }}]</p>
                            </div>
                        </div>
                    </div>
                    <div class="column is-half">
                        <div class="box">
                            <div v-for="(msg, index) in messages" :key="index" class="content">
                                <div v-if="msg.user_sub === 'admin|0'" class="notification has-text-centered is-primary is-light">
                                    <span class="has-text-weight-semibold has-text-grey-light">Admin</span><br>
                                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    <p v-if="msg.content === 'published'">Published</p>
                                    <p v-if="msg.content === 'removed'">Removed</p>
                                    <p v-if="msg.content === 'booked'">Booked</p>
                                    <p v-if="msg.content === 'disputed'">Disputed</p>
                                    <p v-if="msg.content === 'paid'">Paid</p>
                                    <p v-if="msg.content === 'bought'">Bought</p>
                                    <p v-if="msg.content === 'delivered'">Delivered</p>
                                    <p v-if="msg.content === 'released'">Released</p>
                                    <p v-if="msg.content === 'withdrawn'">Withdrawn</p> 
                                    <p v-if="msg.content === 'refunded'">Refunded</p>        
                                </div>
                                <div v-if="msg.user_sub.split('|')[0] === 'admin' && msg.user_sub.split('|')[1] !== '0'" class="notification has-text-centered is-primary is-light">
                                    <span class="has-text-weight-semibold has-text-grey-light">Admin</span><br>
                                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    <p class="has-new-line">{{ msg.content }}</p>
                                </div>
                                <div v-if="msg.user_sub === grab.buyer.sub" class="notification">
                                    <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_username }}</span><br>
                                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    <p class="has-new-line">{{ msg.content }}</p>
                                </div>
                                <div v-if="msg.user_sub === grab.traveler.sub" class="notification has-text-right">
                                    <p>
                                        <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_username }}</span><br>
                                        <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    </p>
                                    <p class="has-new-line">{{ msg.content }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'GrabByRef',
    nuxtI18n: false,
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app, params: { ref }}) {
        const [isAdmin, grab, messages] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.grabs.get(ref),
            app.$admin.messages.list(ref)           
        ])
        return { isAdmin, ref, grab, messages }
    }
}
</script>

<style scoped>
.has-new-line {
  white-space: pre-wrap;
}
</style>