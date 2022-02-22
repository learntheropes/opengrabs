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
                            <a class="button" @click="$refs.fileInput.click()">Upload attachmernts</a>
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
                                            <figure class="image is-128x128">
                                                <img
                                                    :src="'https://res.cloudinary.com/opengrabs/image/upload/w_400/'+attachment"
                                                    :alt="attachment.name"
                                                    @click="activateModal(attachment)"
                                                >
                                            </figure> 
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
                                <figure class="image is-128x128">
                                    <img
                                        :src="'https://res.cloudinary.com/opengrabs/image/upload/w_400/'+attachment"
                                        :alt="attachment.name"
                                        @click="activateModal(attachment)"
                                    >
                                </figure> 
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
import axios from 'axios'
const getDefaultEmailText = (ticket) => {
    switch (ticket.language) {
        case 'en':
return `Hi ${ticket.user.username},



Cheers,
Opengrabs`
        case 'es':
return `Hola ${ticket.user.username},



Saludos,
Opengrabs`
        case 'pt':
return `Oi ${ticket.user.username},



Saúde,
Opengrabs`
        case 'ru':
return `Привет ${ticket.user.username},



Ваше здоровье,
Opengrabs`        
    }
}
export default {
    nuxtI18n: false,
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app, params: { ref }}) {
        const [isAdmin, ticket, messages] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.tickets.get(ref),
            app.$admin.tickets.messages.filter(ref)
        ])
        const content = getDefaultEmailText(ticket)
        return { isAdmin, ref, ticket, messages, content }
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
        width: (process.client) ? parseInt(window.innerWidth*0.7) : 300
    }),
    computed: {
        messageMessage() {
            if (this.postError === 'Field required') return 'Required field'
            else return null 
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
                        fd.append('file', attachment)
                        fd.append('upload_preset','tickets')
                        fd.append('public_id', uniqueString())
                        fd.append('tags', 'admin')
                        const { data: { public_id }} = await axios.post('https://api.cloudinary.com/v1_1/opengrabs/image/upload', fd) 
                        this.public_ids.push(public_id)
                    } 
                }  
                const message = {
                    content : this.content,
                    attachments: this.public_ids,
                } 
                await this.$admin.tickets.messages.create(this.ref, message)
                this.messages = await this.$admin.tickets.messages.filter(this.ref) 
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