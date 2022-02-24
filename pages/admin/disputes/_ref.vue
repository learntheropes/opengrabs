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
                                <b-input v-model="content" maxlength="400" type="textarea"></b-input>
                            </b-field>
                            <b-field label="Attention required" :type="attentionType" :message="attentionMessage">
                                <b-select v-model="attention" expanded>
                                    <option v-for="hour in hours" :key="hour.value" :value="hour.value">
                                        {{ hour.name }}
                                    </option>
                                </b-select>
                            </b-field>
                            <div v-if="attachments && attachments.length" class="columns is-multiline is-mobile">
                                <div v-for="(attachment, i) in attachments" :key="i"  class="column is-narrow">
                                    {{attachment.name}}
                                </div>
                            </div>
                            <b-field grouped group-multiline>
                                <p v-if="attachments.length" class="control">
                                    <button class="button is-text" @click="fileReset">Reset files</button>
                                </p>
                                <p class="control">
                                    <input ref="fileInput" style="display:none" type="file" multiple="multiple" accept="image/jpeg,image/jpg,image/png,application/pdf" @change="onFileSelected">
                                    <a class="button" @click="$refs.fileInput.click()">Upload files</a>
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
                                    <div v-if="msg.attachments && msg.attachments.length" class="columns is-multiline is-mobile is-centered">
                                        <div v-for="(attachment, i) in msg.attachments" :key="'a'+i"  class="column is-narrow">
                                        <img style="width: 128px;" :src="attachment.preview" @click="activateModal(attachment.modal)">
                                        </div>
                                    </div>
                                </div>
                                <div v-if="msg.user_sub === grab.buyer.sub" class="notification">
                                    <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_username }}</span><br>
                                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    <p class="has-new-line">{{ msg.content }}</p>
                                    <div v-if="msg.attachments && msg.attachments.length" class="columns is-multiline is-mobile">
                                        <div v-for="(attachment, i) in msg.attachments" :key="'b'+i"  class="column is-narrow">
                                            <img style="width: 128px;" :src="attachment.preview" @click="activateModal(attachment.modal)">
                                        </div>
                                    </div>
                                </div>
                                <div v-if="msg.user_sub === grab.traveler.sub" class="notification has-text-right">
                                    <p>
                                        <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_username }}</span><br>
                                        <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                                    </p>
                                    <p class="has-new-line">{{ msg.content }}</p>
                                    <nav v-if="msg.attachments && msg.attachments.length" class="level">
                                        <div class="level-left"></div>
                                            <div class="level-right">
                                            <div class="level-item">
                                                <div class="columns is-multiline is-mobile">
                                                    <div v-for="(attachment, i) in msg.attachments" :key="'c'+i"  class="column is-narrow">
                                                        <img style="width: 128px;" :src="attachment.preview" @click="activateModal(attachment.modal)">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <b-modal :active.sync="isAttachmentModalActive">
            <p class="image">
                <img :src="modalAttachment">
            </p>
        </b-modal>
    </section>
</template>

<script>
import uniqueString from 'unique-string'
import axios from "axios"
export default {
    name: 'DisputeByRef',
    nuxtI18n: false,
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app, modalWidth, params: { ref }}) {
        const [isAdmin, isResolveDispute, grab, messages] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.isResolveDispute(),
            app.$admin.grabs.get(ref),
            app.$admin.messages.filter(ref, modalWidth)           
        ])
        return { isAdmin, ref, isResolveDispute, modalWidth, grab, messages }
    },
    data: () => ({
        content: null,
        attachments: [],
        public_ids: [],
        isAttachmentModalActive: false,
        modalAttachment: null,
        width: (process.client) ? parseInt(window.innerWidth*0.7) : 300,
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
        me() {
            return this.$store.state.auth.user.sub
        },
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
            if (!this.content && !this.attachment) {
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
            this.$refs.fileInput.value = ""
            this.attachments = []
        },    
        onFileSelected(event) {
            this.attachments = Array.from(event.target.files)
        },
        async postChatMessage() {
            this.postType = null
            this.postError = false
            this.attentionType = null
            this.attentionError = false
            const validPost = this.validatePost()
            const validAttention = this.validateAttention()
            if (validPost && validAttention) {
                if (this.attachments.length) {
                    for (const attachment of this.attachments) {
                        const fd = new FormData()
                        const name = uniqueString()
                        const extension = attachment.name.split('.')[1]
                        fd.append('fileName', `${name}.${extension}`)
                        fd.append('file', attachment)
                        fd.append('publicKey',process.env.IMAGEKIT_PUBLIC_KEY)
                        fd.append('folder', 'tickets')
                        fd.append('overwriteFile', false)
                        fd.append('tags', `${this.ref},${this.me}`)
                        fd.append('isPrivateFile', true)
                        const { data: { signature, expire, token }} = await this.$axios.post('/api/image/signature', {})
                        fd.append('expire', expire)
                        fd.append('token', token)
                        fd.append('signature', signature)
                        const { data: { filePath }} = await axios.post('https://upload.imagekit.io/api/v1/files/upload', fd) 
                        this.public_ids.push({ path: filePath })
                    }      
                }
                const props = {
                    posted_at: new Date().toISOString(),
                    content: this.content,
                    attachments: this.public_ids,
                    grab_id: this.ref,
                    user_sub: `admin|${this.$store.state.auth.user.sub}`
                }
                await this.$admin.grabs.attention(this.ref, this.attention)
                await this.$admin.grabs.update(props)
                this.messages = await this.$admin.messages.filter(this.ref, this.modalWidth)
                this.content = null
                this.attachments = []
                this.public_ids = []
            }
        },
        activateModal (attachment) {
            this.isAttachmentModalActive = true
            this.modalAttachment = attachment
        },
        async resolveToTheBuyer() {
            await this.$admin.disputes.refund(this.ref)
            const grab = await this.$admin.grabs.get(this.ref)
            this.grab = grab
            const messages = await this.$admin.messages.filter(this.ref, this.modalWidth)
            this.messages = messages
        },
        async resolveToTheTraveler() {
            await this.$admin.disputes.release(this.ref)
            const grab = await this.$admin.grabs.get(this.ref)
            this.grab = grab
            const messages = await this.$admin.messages.filter(this.ref, this.modalWidth)
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
