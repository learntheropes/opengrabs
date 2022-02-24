<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Ticket {{ ref }}</h1>
                <h2 class="subtitle">Username: {{ ticket.user.username }} | Title: {{ ticket.subject }}</h2>
                <div class="block">
                    <b-field label="Change language" grouped>
                        <b-select v-model="ticket.language">
                            <option v-for="language in languages" :key="language.value" :value="language.value">{{ language.name }}</option>
                        </b-select>
                        <p class="control">
                            <b-button label="Update language" @click="updateTicketLanguage" />
                        </p>
                    </b-field>
                </div>
                <div class="block">
                    <b-field :type="messageType" :message="messageMessage">
                        <b-input v-model="content" maxlength="1000" rows=6 type="textarea"></b-input>
                    </b-field>
                    <div v-if="attachments && attachments.length" class="columns is-multiline is-mobile">
                        <div v-for="(attachment, i) in attachments" :key="i"  class="column is-narrow">
                            {{attachment.name}}
                        </div>
                    </div>
                    <b-field grouped group-multiline>
                        <p v-if="attachments.length" class="control">
                            <button class="button is-text" @click="fileReset">Reset attachments</button>
                        </p>
                        <p class="control">
                            <input ref="fileInput" style="display:none" type="file" multiple="multiple" accept="image/jpeg,image/jpg,image/png,application/pdf" @change="onFileSelected">
                            <a class="button" @click="$refs.fileInput.click()">Upload attachments</a>
                        </p>
                        <p class="control">
                            <button :class="messageButtonClass" @click="postNewNessage">Post message</button>
                        </p>
                    </b-field>
                </div> 
                <div v-for="(msg, index) in messages" :key="index" class="content">
                    <div v-if="msg.user.sub.split('|')[0] === 'admin'" class="notification has-text-right">
                        <p>
                            <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user.sub }}</span><br>
                            <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                        </p>
                        <p class="has-new-line">{{ msg.content }}</p>
                        <nav v-if="msg.attachments && msg.attachments.length" class="level">
                            <div class="level-left"></div>
                                <div class="level-right">
                                <div class="level-item">
                                    <div v-if="msg.attachments && msg.attachments.length" class="columns is-multiline is-mobile">
                                        <div v-for="(attachment, i) in msg.attachments" :key="msg.user.sub+i"  class="column is-narrow">
                                            <img style="width: 128px;" :src="attachment.preview" @click="activateModal(attachment.modal)">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div> 
                    <div v-else class="notification">
                        <p>
                            <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user.username }}</span><br>
                            <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                        </p>
                        <p class="has-new-line">{{ msg.content }}</p>
                        <div v-if="msg.attachments && msg.attachments.length" class="columns is-multiline is-mobile">
                            <div v-for="(attachment, i) in msg.attachments" :key="msg.user.username+i"  class="column is-narrow">
                                <img style="width: 128px;" :src="attachment.preview" @click="activateModal(attachment.modal)">
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
        </div>
        <b-modal :active.sync="isAttachmentModalActive">
            <p class="image">
                <img :alt="$t('attachmentExpired')" :src="modalAttachment">
            </p>
        </b-modal>
    </section>
</template>

<script>
import uniqueString from 'unique-string'
import axios from 'axios'
const getDefaultEmailText = (ticket) => {
    switch (ticket.language) {
        case 'en':
return `Hi ${ticket.user.username},



Cheers,
${process.env.URL||'testnet.opengrabs.com'}`
        case 'es':
return `Hola ${ticket.user.username},



Saludos,
${process.env.URL||'testnet.opengrabs.com'}`
        case 'pt':
return `Oi ${ticket.user.username},



Saúde,
${process.env.URL||'testnet.opengrabs.com'}`
        case 'ru':
return `Привет ${ticket.user.username},



Ваше здоровье,
${process.env.URL||'testnet.opengrabs.com'}`        
    }
}
export default {
    nuxtI18n: false,
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app, modalWidth, params: { ref }}) {
        const [isAdmin, ticket, messages] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.tickets.get(ref),
            app.$admin.tickets.messages.filter(ref, modalWidth)
        ])
        const content = getDefaultEmailText(ticket)
        return { isAdmin, modalWidth, ref, ticket, messages, content }
    },
    data: () => ({
        languages: [
            { name: 'English', value: 'en'},
            { name: 'Spanish', value: 'es'},
            { name: 'Portuguese', value: 'pt'},
            { name: 'Russian', value: 'ru'}
        ],
        messageButtonClass: 'button',
        attachments: [],
        public_ids: [],
        messageType: null,
        messageError: false,
        isAttachmentModalActive: false,
        modalAttachment: null,
    }),
    computed: {
        messageMessage() {
            if (this.postError === 'Field required') return 'Required field'
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
                this.messageButtonClass = 'button is-loading'
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
                const message = {
                    content : this.content,
                    attachments: this.public_ids,
                } 
                await this.$admin.tickets.messages.create(this.ref, message)
                this.messages = await this.$admin.tickets.messages.filter(this.ref, this.modalWidth) 
                this.content = getDefaultEmailText(this.ticket)
                this.attachments = []
                this.public_ids = []
                this.messageButtonClass = 'button' 
            }         
        },
        async updateTicketLanguage() {
            await this.$axios.post(`/api/admin/tickets/update-language/${this.ref}/${this.ticket.language}`)
            this.ticket = await this.$admin.tickets.get(this.ref)
            this.content = getDefaultEmailText(this.ticket)
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