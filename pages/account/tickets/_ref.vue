<template>
    <section class="section container">
        <h1 class="title">{{ $t('ticket') }} {{ ref }}</h1>
        <h2 class="subtitle">{{ ticket.subject }}</h2>
        <div class="block">
            <b-field :type="messageType" :message="messageMessage">
                <b-input v-model="content" maxlength="400" type="textarea"></b-input>
            </b-field>
            <div v-if="attachments && attachments.length" class="columns is-multiline is-mobile">
                <div v-for="(attachment, i) in attachments" :key="i"  class="column is-narrow">
                    {{attachment.name}}
                </div>
            </div>
            <b-field grouped group-multiline>
                <p v-if="attachments.length" class="control">
                    <button class="button is-text" @click="fileReset">{{$t('resetAttachments')}}</button>
                </p>
                <p class="control">
                    <input ref="fileInput" style="display:none" type="file" multiple="multiple" accept="image/jpeg,image/jpg,image/png,application/pdf" @change="onFileSelected">
                    <a class="button" @click="$refs.fileInput.click()">{{$t('uploadAttachments')}}</a>
                </p>
                <p class="control">
                    <button :class="messageButtonClass" @click="postNewNessage">{{ $t('postNewMessage') }}</button>
                </p>
            </b-field>
        </div>   

        <div v-for="(msg, index) in messages" :key="index" class="content">
            <div v-if="msg.user.sub === me" class="notification has-text-right">
                <p>
                    <span class="has-text-weight-semibold has-text-grey-light">{{ $t('me') }}</span><br>
                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                </p>
                <p class="has-new-line">{{ msg.content }}</p>
                <nav v-if="msg.attachments && msg.attachments.length" class="level">
                    <div class="level-left"></div>
                    <div class="level-right">
                        <div class="level-item">
                            <div class="columns is-multiline is-mobile">
                                <div v-for="(attachment, i) in msg.attachments" :key="msg.user.sub+i"  class="column is-narrow">
                                    <figure class="image" style="width: 128px;">
                                        <img :src="attachment.preview" @click="activateModal(attachment.modal)">
                                    </figure> 
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </div> 
            <div v-else class="notification">
                <p>
                    <span class="has-text-weight-semibold has-text-grey-light">{{ $t('admin') }}</span><br>
                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                </p>
                <p class="has-new-line">{{ msg.content }}</p>
                <div v-if="msg.attachments && msg.attachments.length" class="columns is-multiline is-mobile">
                    <div v-for="(attachment, i) in msg.attachments" :key="msg.user.sub+i"  class="column is-narrow">
                        <figure class="image" style="width: 128px;">
                            <img :src="attachment.preview" @click="activateModal(attachment.modal)">
                        </figure> 
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
import axios from 'axios'
export default {
    name: 'Ticket',
    middleware: 'auth',
    async asyncData({ app, modalWidth, params: { ref }}) {
        const [ticket, messages] = await Promise.all([
            app.$tickets.get(ref),
            app.$tickets.messages.filter(ref, modalWidth)
        ])
        return { ref, modalWidth, ticket, messages }
    },
    data: () => ({
        messageButtonClass: 'button is-primary is-outlined',
        content: null,
        attachments: [],
        public_ids: [],
        messageType: null,
        messageError: false,
        isAttachmentModalActive: false,
        modalAttachment: null,
    }),
    computed: {
        messageMessage() {
            if (this.postError === 'Field required') return this.$t('requiredField')
            else return null 
        },
        me() {
            return this.$store.state.auth.user.sub
        },
    },
    methods: {
        fileReset() {
            this.$refs.fileInput.value = ""
            this.attachments = []
        },    
        onFileSelected(event) {
            this.attachments = Array.from(event.target.files)
        },
        validateMessage() {
            if (!this.content && !this.attachments.length) {
                this.messageType = 'is-danger'
                this.messageError = 'Field required'
                return false
            }
            return true
        },
        async postNewNessage() {
            this.messageType = null
            this.messageError = false
            const validMessage = this.validateMessage()
            if (validMessage) {
                this.messageButtonClass = 'button is-primary is-outlined is-loading'
                if (this.attachments.length) {
                    for (const attachment of this.attachments) {
                        const fd = new FormData()
                        const name = uniqueString()
                        const extension = attachment.name.split('.')[1]
                        fd.append('fileName', `${name}.${extension}`)
                        fd.append('file', attachment)
                        fd.append('publicKey',process.env.IMAGEKIT_PUBLIC_KEY)
                        fd.append('folder', `${process.env.BTC_CHAIN}/tickets`)
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
                const message = {
                    content : this.content,
                    attachments: this.public_ids,
                } 
                await this.$tickets.messages.create(this.ref, message)
                this.messages = await this.$tickets.messages.filter(this.ref, this.modalWidth)
                this.content = null
                this.attachments = []
                this.public_ids = []
                this.messageButtonClass = 'button is-primary is-outlined' 
            }         
        },
        activateModal (attachment) {
            this.isAttachmentModalActive = true
            this.modalAttachment = attachment
        },
    }
}
</script>

<style scoped>
.has-new-line {
  white-space: pre-wrap;
}
</style>