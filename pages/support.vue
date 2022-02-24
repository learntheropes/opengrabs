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
    middleware ({ store, app, redirect }) {
        if(store.state.auth.loggedIn) {
            return redirect('/' + app.i18n.locale + '/account/tickets')
        }
    },
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
            else if (this.emailError === 'Invalid email') return this.$t('invalidEmail')
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
            }  else {
                const regex = /\S+@\S+\.\S+/
                const isValidFormat = regex.test(this.email)
                if (!isValidFormat) {
                    this.emailType = 'is-danger'
                    this.emailError = 'Invalid email'              
                }
                return isValidFormat                
            }
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
                const ticket = {
                    language: this.$i18n.locale,
                    email: this.email,
                    subject: this.subject,
                }
                const { id } = await this.$tickets.email.create(ticket)
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
                        fd.append('tags', `${id},${this.email}`)
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
                    content: this.content,
                    attachments: this.public_ids,
                }
                await this.$tickets.email.messages.create(id, message)
                this.email = null
                this.subject = null
                this.content = null
                this.$refs.fileInput.value = ""
                this.attachments = []
                this.ticketButtonClass = 'button is-primary is-outlined'
                this.$buefy.toast.open({
                    duration: 3000,
                    message: this.$t('toastTicketCreated'),
                    position: 'is-bottom',
                    type: 'is-primary'
                })
            }
        }

    }
}
</script>