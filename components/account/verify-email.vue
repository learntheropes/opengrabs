<template>
    <section class="section">
        <div v-if="show">
            <div class="notification">
                {{ $t('missingEmailWarningOrder')}}
            </div>
            <b-field grouped :type="emailType" :message="emailMessage">
                <b-input v-model="user.email" type="text" :placeholder="$t('emailLabel')" expanded />
                <p class="control">
                    <b-button type="is-primary" outlined @click="updateUserEmail">{{ $t('update') }}</b-button> 
                </p>
            </b-field>
            <b-field grouped :type="codeType" :message="codeMessage">
                <b-input v-model="user.code" type="text" :placeholder="$t('codeLabel')" expanded />
                <p class="control">
                    <b-button type="is-primary" outlined @click="verifyUserEmail">{{ $t('verify') }}</b-button> 
                </p>
            </b-field> 
        </div>
    </section>
</template>

<script>
export default {
    name: 'VerifyEmail',
    middleware: 'auth',
    data: () => ({
        show: false,
        user: {
            email: null,
            email_verified: false,
            code: null,
            locale: null
        },
        emailError: false,
        emailType: null,
        codeError: false,
        codeType: null
    }),
    async fetch() {
        this.user = await this.$user.get()
        if (this.user.email && this.user.email_verified) {
            this.$nuxt.$emit('updateUser', {email: this.user.email, email_verified: this.user.email_verified, username: this.user.username})
        } else {
            const user = this.$store.state.auth.user
            this.user = JSON.parse(JSON.stringify(user))
            if (!this.user.email_verified || !this.user.email) {
                this.show = true
            }
        } 
    },
    computed: {
        emailMessage() {
            if (this.emailError === 'Field required') return this.$t('requiredField')
            else if (this.emailError === 'Invalid email') return this.$t('invalidEmail')
            else return null
        },
        codeMessage() {
            if (this.codeError === 'Field required') return this.$t('requiredField')
            else if (this.codeError === 'Invalid code') return this.$t('invalidCode')
            else return null            
        }     
    },
    methods: {
        validateEmail(){
            if (!this.user.email) {
                this.emailType = 'is-danger'
                this.emailError = 'Field required'
                return false
            } else {
                const regex = /\S+@\S+\.\S+/
                const isValidFormat = regex.test(this.user.email)
                if (!isValidFormat) {
                    this.emailType = 'is-danger'
                    this.emailError = 'Invalid email'              
                }
                return isValidFormat                
            }
        },
        async updateUserEmail() {
            this.emailType = null
            this.emailError = null
            const validEmail = this.validateEmail()
            if (validEmail) {
                this.user.locale = this.$i18n.locale
                await this.$user.updateEmail(this.user)
            }
        },
        validateCode(){
            if (!this.user.code) {
                this.codeType = 'is-danger'
                this.codeError = 'Field required'
                return false
            } else {
                const regex = /^\d{6}$/
                const isValidFormat = regex.test(this.user.code)
                if (!isValidFormat) {
                    this.codeType = 'is-danger'
                    this.codeError = 'Invalid code'                
                }
                return isValidFormat
            }
        },
        async verifyUserEmail() {
            this.codeType = null
            this.codeError = null
            const validCode = this.validateCode()
            if (validCode) {
                this.user = await this.$user.verify(this.user.code)
                if (this.user.error) {
                    this.codeType = 'is-danger'
                    this.codeError = 'Invalid code'
                } else {
                    this.show = false
                    this.$nuxt.$emit('updateUser', {email: this.user.email, email_verified: this.user.email_verified, username: this.user.username})
                    if (process.env.URL && this.user.username && this.user.email && this.$Tawk.$isInit() && !this.$store.state.account.tawk.initiated) {
                        const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${this.user.email}`)
                        this.$Tawk.$updateChatUser({ name: this.user.username, email: this.user.email, hash })
                        const attributes = {
                            'user-sub': this.$store.$auth.user.sub,
                            'bitcoin-network': (process.env.BTC_CHAIN === 'test3') ? 'testnet': 'mainnet'
                        }
                        this.$Tawk.$setAttribute(attributes)
                        this.$store.commit('account/tawk/setInitiated', true)
                    }
                }  
            }     
        }
    }
}
</script>
