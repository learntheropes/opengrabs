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
                        <div class="block">
                            <div class="content">
                                <p>Buyer: {{ grab.buyer.username }}</p>
                                <p>Traveler: {{ grab.traveler.username }}</p>
                                <p v-if="grab.shop.slug">Product: <a :href="grab.shop.url" target="_blank">{{ grab.shop.slug.replace(/-/g,' ') || grab.shop.title }}</a></p>
                                <p>Price: {{ grab.shop.price.total.toFixed(2) }} {{ grab.shop.currency }}</p>
                                <p>Delivery date: {{ $moment(grab.delivery.date).fromNow() }} [{{ $utils.momentDate(grab.delivery.date) }}]</p>
                                <p v-if="grab.published_at">Published {{ $moment(grab.published_at).fromNow() }} [{{ $moment(grab.published_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.booked_at">Booked {{ $moment(grab.booked_at).fromNow() }} [{{ $moment(grab.booked_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.disputed_at">Disputed {{ $moment(grab.disputed_at).fromNow() }} [{{ $moment(grab.disputed_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.paid_at">Paid {{ $moment(grab.paid_at).fromNow() }} [{{ $moment(grab.paid_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.bought_at">Bought {{ $moment(grab.bought_at).fromNow() }} [{{ $moment(grab.bought_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.delivered_at">Delivered {{ $moment(grab.delivered_at).fromNow() }} [{{ $moment(grab.delivered_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.released_at">Released {{ $moment(grab.released_at).fromNow() }} [{{ $moment(grab.released_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.withdrawn_at">Withdrawn {{ $moment(grab.withdrawn_at).fromNow() }} [{{ $moment(grab.withdrawn_at).format('MMMM Do YYYY HH:mm') }}]</p>
                                <p v-if="grab.refunded_at">Refunded {{ $moment(grab.refunded_at).fromNow() }} [{{ $moment(grab.refunded_at).format('MMMM Do YYYY HH:mm') }}]</p>
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
                            <b-field label="Message" :type="postType" :message="postMessage">
                                <b-input v-model="message" maxlength="400" type="textarea"></b-input>
                            </b-field>
                            <b-field label="Attention required" :type="attentionType" :message="attentionMessage">
                                <b-select v-model="attention" expanded>
                                    <option v-for="hour in hours" :key="hour.value" :value="hour.value">
                                        {{ hour.name }}
                                    </option>
                                </b-select>
                            </b-field>
                            <div v-if="attachment" class="block">
                                {{attachment.name}}
                            </div>
                            <b-field grouped group-multiline>
                                <p class="control">
                                    <button class="button is-text" @click="fileReset">{{$t('resetAttachment')}}</button>
                                </p>
                                <p class="control">
                                    <input ref="fileInput" style="display:none" type="file" multiple="multiple" @change="onFileSelected">
                                    <a class="button" @click="$refs.fileInput.click()">{{$t('uploadAttachment')}}</a>
                                </p>
                                <p class="control">
                                    <button class="button is-primary" @click="postChatMessage">Post chat message</button>
                                </p>
                            </b-field>
                            <div v-for="(msg, index) in messages" :key="index" class="content">
                                <div v-if="msg.user_sub === 'admin|0'" class="notification has-text-centered is-primary is-light">
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
                                    <span class="has-text-weight-semibold has-text-grey-light">{{msg.user_sub}}</span><br>
                                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    <p class="has-new-line">{{ msg.content }}</p>
                                    <figure v-if="msg.attachment" class="image">
                                        <img :src="'https://res.cloudinary.com/opengrabs/image/upload/'+msg.attachment">
                                    </figure> 
                                </div>
                                <div v-if="msg.user_sub === grab.buyer.sub" class="notification">
                                    <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_username }}</span><br>
                                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    <p class="has-new-line">{{ msg.content }}</p>
                                    <figure v-if="msg.attachment" class="image">
                                        <img :src="'https://res.cloudinary.com/opengrabs/image/upload/'+msg.attachment">
                                    </figure> 
                                </div>
                                <div v-if="msg.user_sub === grab.traveler.sub" class="notification has-text-right">
                                    <p>
                                        <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_username }}</span><br>
                                        <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    </p>
                                    <p class="has-new-line">{{ msg.content }}</p>
                                    <figure v-if="msg.attachment" class="image">
                                        <img :src="'https://res.cloudinary.com/opengrabs/image/upload/'+msg.attachment">
                                    </figure> 
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
import uniqueString from 'unique-string'
import axios from "axios"
import clone from 'lodash.clone'
export default {
    name: 'DisputeByRef',
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
        return { isAdmin, ref, isResolveDispute, grab, messages }
    },
    data: () => ({
        message: null,
        attachment: null,
        public_id: null,
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
        attentionError: false,
    }),
    computed: {
        postMessage() {
            if (this.postError === 'Field required') return 'Field required'
            else return null 
        },
        attentionMessage() {
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
            if (!this.message && !this.attachment) {
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
        fileReset() {
            this.attachment = null
        },    
        onFileSelected(event) {
            this.attachment = event.target.files[0]
        },
        async postChatMessage() {
            this.postType = null
            this.postError = false
            this.attentionType = null
            this.attentionError = false
            const validPost = this.validatePost()
            const validAttention = this.validateAttention()
            if (validPost && validAttention) {
                if (this.attachment) {
                    const fd = new FormData()
                    fd.append('file', this.attachment)
                    fd.append('upload_preset','clvrfqxc')
                    fd.append('public_id', uniqueString())
                    fd.append('tags', this.ref)
                    const { data: { public_id }} = await axios.post('https://api.cloudinary.com/v1_1/opengrabs/image/upload', fd) 
                    this.public_id = public_id         
                }
                let user_sub = clone(this.$store.state.auth.user.sub).split('|')
                user_sub.shift()
                user_sub.unshift('admin')
                user_sub = user_sub.join('|')
                console.log(user_sub)
                const props = {
                    posted_at: new Date().toISOString(),
                    content: this.message,
                    attachment: (this.attachment) ? this.public_id : null,
                    grab_id: this.ref,
                    user_sub
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

<style scoped>
.has-new-line {
  white-space: pre-wrap;
}
</style>
