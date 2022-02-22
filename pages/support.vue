<template>
    <section class="section container">
        <h1 class="title">{{ $t('support') }}</h1>
        <div v-if="!authenticated" class="content">
            {{ $t('loginAndOpenA') }} <a @click="login">{{ $t('login') }}</a><br>
            {{ $t('ifYouCantLogin') }}
        </div>
        <div class="block">
            <b-field :type="emailType" :message="emailMessage">
                <b-input v-model="email" :placeholder="$t('emailPlaceholder')" expanded></b-input>
            </b-field>
            <b-field :type="subjectType" :message="subjectMessage">
                <b-input v-model="subject" :placeholder="$t('subjectPlaceholder')" expanded></b-input>
            </b-field>
            <b-field :type="contentType" :message="contentMessage">
                <b-input v-model="content" :placeholder="$t('contentPlaceholder')" maxlength="400" type="textarea"></b-input>
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
                    <button :class="ticketButtonClass" @click="openNewTicket">{{ $t('openNewTicket') }}</button>
                </p>
            </b-field>          
        </div>
    </section>
</template>

<script>
import uniqueString from 'unique-string'
import axios from 'axios'
export default {
    name: "Help",
    auth: false,
    data: () => ({
        ticketButtonClass: 'button is-primary is-outlined',
        email: null,
        emailType: null,
        emailError: false,
        subject: null,
        subjectType: null,
        subjectError: false,
        content: null,
        contentType: null,
        contentError: false,
        attachments: [],
        public_ids: [],
    }),
    fetch() {
        if (this.$store.state.auth.loggedIn) {
            this.$router.push(`/${this.$i18n.locale}/account/tickets`) 
        }
    },
    head() {
        return {
            link: [
                {
                    hid: 'canonical',
                    rel: 'canonical',
                    href: `https://${process.env.URL}/${this.$i18n.locale}/support`,
                },
            ],
        }
    },
    computed: {
        authenticated() {
            return this.$store.state.auth.loggedIn
        },
        emailMessage() {
            if (this.emailError === 'Field required') return this.$t('requiredField')
            else return null 
        },
        subjectMessage() {
            if (this.subjectError === 'Field required') return this.$t('requiredField')
            else return null 
        },
        contentMessage() {
            if (this.contentError === 'Field required') return this.$t('requiredField')
            else return null 
        },
    },
    methods: {
        login() {
            this.$auth.$storage.setUniversal('redirect', `/${this.$i18n.locale}/account/tickets`)
            this.$auth.loginWith('auth0')            
        },
        fileReset() {
            this.$refs.fileInput.value = ""
            this.attachments = []
        },    
        onFileSelected(event) {
            this.attachments = Array.from(event.target.files)
        },
        validateEmail() {
            if (!this.email) {
                this.emailType = 'is-danger'
                this.emailError = 'Field required'
                return false
            }
            return true
        }, 
        validateSubject() {
            if (!this.subject) {
                this.subjectType = 'is-danger'
                this.subjectError = 'Field required'
                return false
            }
            return true
        }, 
        validateContent() {
            if (!this.content) {
                this.contentType = 'is-danger'
                this.contentError = 'Field required'
                return false
            }
            return true
        },
        async openNewTicket() {
            this.emailType = null
            this.emailError = false
            this.subjectType = null
            this.subjectError = false
            this.contentType = null
            this.contentError = false
            const validEmail = this.validateEmail()
            const validSubject = this.validateSubject()
            const validContent = this.validateContent()
            if (validEmail && validSubject && validContent) {
                this.ticketButtonClass = 'button is-primary is-outlined is-loading'
                if (this.attachments.length) {
                    for (const attachment of this.attachments) {
                        const fd = new FormData()
                        fd.append('file', attachment)
                        fd.append('upload_preset','email_tickets')
                        fd.append('public_id', uniqueString())
                        fd.append('tags', this.email)
                        const { data: { public_id }} = await axios.post('https://api.cloudinary.com/v1_1/opengrabs/image/upload', fd) 
                        this.public_ids.push(public_id)
                    } 
                }
                const ticket = {
                    language: this.$i18n.locale,
                    email: this.email,
                    subject: this.subject,
                }
                const message = {
                    content: this.content,
                    attachments: this.public_ids,
                }
                this.email = null
                this.subject = null
                this.content = null
                this.$refs.fileInput.value = ""
                this.attachments = []
                const { id } = await this.$tickets.email.create(ticket)
                await this.$tickets.email.messages.create(id, message)
                this.ticketButtonClass = 'button is-primary is-outlined'
            }
        }

    }
}
</script>