<template>
    <section class="section container">
        <h1 class="title">{{ $t('ticket') }} {{ ref }}</h1>
        <h2 class="subtitle">{{ ticket.subject }}</h2>
        <div class="block">
            <b-field :type="messageType" :message="messageMessage">
                <b-input v-model="content" maxlength="400" type="textarea"></b-input>
            </b-field>
            <b-field grouped group-multiline>
                <p class="control">
                    <button class="button is-text" @click="fileReset">{{$t('resetAttachments')}}</button>
                </p>
                <p class="control">
                    <input ref="fileInput" style="display:none" type="file" multiple="multiple" @change="onFileSelected">
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
            <div v-else class="notification">
                <p>
                    <span class="has-text-weight-semibold has-text-grey-light">{{ $t('admin') }}</span><br>
                    <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
                </p>
                <p class="has-new-line">{{ msg.content }}</p>
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
        <b-modal :width="width" :active.sync="isAttachmentModalActive">
            <p class="image">
                <img :src="'https://res.cloudinary.com/opengrabs/image/upload/w_'+width+'/'+modalAttachment">
            </p>
        </b-modal>
    </section>
</template>

<script>
export default {
    name: 'Ticket',
    middleware: 'auth',
    async asyncData({ app, params: { ref }}) {
        const [ticket, messages] = await Promise.all([
            app.$tickets.get(ref),
            app.$tickets.messages.filter(ref)
        ])
        return { ref, ticket, messages }
    },
    data: () => ({
        messageButtonClass: 'button is-primary is-outlined',
        content: null,
        attachments: [],
        messageType: null,
        messageError: false,
        isAttachmentModalActive: false,
        modalAttachment: null,
        width: (process.client) ? parseInt(window.innerWidth*0.7) : 300
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
            this.attachments = null
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
                const message = {
                    content : this.content,
                    attachements: this.attachments,
                } 
                await this.$tickets.messages.create(this.ref, message)
                this.messages = await this.$tickets.messages.filter(this.ref) 
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