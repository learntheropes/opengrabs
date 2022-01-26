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
                                <p>Product: <a :href="grab.amazon.url" target="_blank">{{ grab.amazon.slug.replace('-','') || grab.amazon.title }}</a></p>
                                <p>Price: {{ grab.amazon.price.total.toFix(2) }} {{ grab.amazon.currency }}</p>
                                <p>Delivery date: {{ $moment(grab.delivery.date).fromNow() }} [{{ $utils.momentDate(grab.delivery.date) }}]</p>
                                <p>Max delivery date: {{ $moment(grab.destination.max_delivery_date).fromNow() }} [{{ $utils.momentDate(grab.destination.max_delivery_date) }}]</p>
                                <p v-if="grab.published_at">Published {{ $moment(grab.published_at).fromNow() }}</p>
                                <p v-if="grab.booked_at">Booked {{ $moment(grab.booked_at).fromNow() }}</p>
                                <p v-if="grab.paid_at">Paid {{ $moment(grab.paid_at).fromNow() }}</p>
                                <p v-if="grab.bought_at">Bought {{ $moment(grab.bought_at).fromNow() }}</p>
                                <p v-if="grab.delivered_at">Delivered {{ $moment(grab.delivered_at).fromNow() }}</p>
                                <p v-if="grab.released_at">Released {{ $moment(grab.released_at).fromNow() }}</p>
                                <p v-if="grab.withdrawn_at">Withdrawn {{ $moment(grab.withdrawn_at).fromNow() }}</p>
                                <p v-if="grab.refunded_at">Refunded {{ $moment(grab.refunded_at).fromNow() }}</p>
                            </div>
                            <b-field>
                                <div v-if="isResolveDispute" class="buttons">
                                    <button class="button is-primary" @click="resolveToTheBuyer">Resolve to the buyer</button>
                                    <button class="button is-primary" @click="resolveToTheTraveler">Resolve to the traveler</button>
                                </div>
                            </b-field>
                        </div>
                    </div>
                    <div class="column is-half">
                        <div v-if="isChatable" class="box">
                            <b-field :type="postType" :message="postMessage">
                                <b-input v-model="message" maxlength="400" type="textarea"></b-input>
                            </b-field>

                            <b-field label="Attention required" :type="attentionType" :message="attentionMessage">
                                <b-select v-model="attention" expanded>
                                    <option v-for="hour in hours" :key="hour.value" :value="hour.value">
                                        {{ hour.name }}
                                    </option>
                                </b-select>
                            </b-field>

                            <b-field>
                                <button class="button is-primary" @click="postChatMessage">Post chat message</button>
                            </b-field>
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
        const [isAdmin, isResolveDispute, grab, messages] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.isResolveDispute(),
            app.$admin.grabs.get(ref),
            app.$admin.messages.list(ref)           
        ])
        return { isAdmin, isResolveDispute, grab, messages }
    },
    data: () => ({
        message: null,
        postType: null,
        postError: false,
        hours: [
            {
                value: 1,
                name: '1 hour'
            },
            {
                value: 4,
                name: '4 hours'
            },
            {
                value: 12,
                name: '12 hours'
            },
            {
                value: 24,
                name: '24 hours'
            },
            {
                value: 48,
                name: '2 days'
            },
            {
                value: 72,
                name: '3 days'
            },
        ],
        attention: null,
        attentionType: null,
        attentionError: false
    }),
    computed: {
        postMessage() {
            if (this.postError === 'Field required') return 'Field required'
            else return null 
        },
        attentionMassage() {
            if (this.attentionError === 'Field required') return 'Field required'
            else return null 
        },
        isChatable() {
            return (
                this.grab.status !== 'published' &&
                this.grab.status !== 'released' &&
                this.grab.status !== 'withdrawn'
            )
        }
    },
    methods: {
        validatePost() {
            if (!this.message) {
                this.postType = 'is-danger'
                this.postError = 'Field required'
                return false
            }
            return true
        },
        validateAttention() {
            if (!this.attention) {
                this.attentionType = 'is-danger'
                this.attentionError = 'Field required'
                return false
            }
            return true
        },
        async postChatMessage() {
            this.postType = null
            this.postError = false
            this.attentionType = null
            this.attentionError = false
            const validPost = this.validatePost()
            const validateAttention = this.validateAttention()
            if (validPost && validateAttention) {
                const props = {
                    posted_at: new Date().toISOString(),
                    content: this.message,
                    grab_id: this.ref,
                    user_sub: this.$store.state.auth.user.sub.split('|').shift().unshift('admin').join('|'),
                }
                await this.$admin.grabs.attention(this.ref, this.attention)
                await this.$db.messages.create({ props })
                const messages = await this.$db.messages.filter(this.ref)
                this.messages = messages
                this.message = null
            }
        },
        async resolveToTheBuyer() {
            await this.$admin.disputes.refund(this.ref)
            const grab = await this.$admin.grabs.get(this.ref)
            this.grab = grab
            const messages = await this.$admin.messages.list(this.ref)
            this.messages = messages
        },
        async resolveToTheTraveler() {
            await this.$admin.disputes.release(this.ref)
            const grab = await this.$admin.grabs.get(this.ref)
            this.grab = grab
            const messages = await this.$admin.messages.list(this.ref)
            this.messages = messages
        },        
    },
}
</script>
