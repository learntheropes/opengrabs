<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <div class="columns">
                    <div class="column is-half">
                        <h1 class="title">Grab {{ ref }}</h1>
                        <div class="box">
                            <div class="content">
                                <p>Buyer: {{ grab.buyer.name }}</p>
                                <p>Traveler: {{ grab.traveler.name }}</p>
                                <p>Delivery date: {{ $moment(grab.delivery.date).fromNow() }} [{{ $utils.momentDate(grab.delivery.date) }}]</p>
                                <p>Max delivery date: {{ $moment(grab.destination.max_delivery_date).fromNow() }} [{{ $utils.momentDate(grab.destination.max_delivery_date) }}]</p>
                                <p>Published {{ $moment(grab.published_at).fromNow() }}</p>
                                <p>Booked {{ $moment(grab.booked_at).fromNow() }}</p>
                                <p>Paid {{ $moment(grab.paid_at).fromNow() }}</p>
                                <p>Bought {{ $moment(grab.bought_at).fromNow() }}</p>
                                <p>Delivered {{ $moment(grab.delivered_at).fromNow() }}</p>
                                <p>Released {{ $moment(grab.released_at).fromNow() }}</p>
                                <p>Withdrawn {{ $moment(grab.withdrawn_at).fromNow() }}</p>
                                <p>Refunded {{ $moment(grab.refunded_at).fromNow() }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="column is-half">
                        <div class="box">
                            <div v-for="(msg, index) in messages" :key="index" class="content">
                                <div v-if="msg.user_sub === 'admin|0'" class="notification has-text-centered is-primary">
                                    <span class="has-text-weight-semibold has-text-grey-light">{{ $t('admin') }} </span>,<br>
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
                                <div :else-if="msg.user_sub.split('|')[0] === 'admin'" class="notification has-text-centered is-primary">
                                    <span class="has-text-weight-semibold has-text-grey-light">{{ $t('admin') }} </span>,<br>
                                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    <p>{{ msg.content }}</p>
                                </div>
                                <div v-if="msg.user_sub === grab.buyer.sub" class="notification">
                                    <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_sub }} {{ msg.name }} </span>,<br>
                                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    <p>{{ msg.content }}</p>
                                </div>
                                <div v-if="msg.user_sub === grab.traveler.sub" class="notification has-text-right">
                                    <p>
                                        <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_sub }} {{ msg.name }} </span>,<br>
                                        <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    </p>
                                    <p>{{ msg.content }}</p>
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
        return { isAdmin, grab, messages }
    }
}
</script>