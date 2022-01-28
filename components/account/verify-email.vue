<template>
    <section class="section">
        <div v-if="show">
        <div class="notification">
            {{ $t('missingEmailWarningOrder')}}
        </div>
        <b-field grouped :type="emailType" :message="emailMessage">
            <b-input v-model="email" type="text" :placeholder="$t('emailLabel')" expanded />
            <p class="control">
                <b-button @click="updateUserEmail">{{ $t('update') }}</b-button> 
            </p>
        </b-field>
        <b-field grouped :type="codeType" :message="codeMessage">
            <b-input v-model="code" type="text" :placeholder="$t('codeLabel')" expanded />
            <p class="control">
                <b-button @click="verifyUserEmail">{{ $t('verify') }}</b-button> 
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
        email: null,
        code: null,
        emailError: false,
        emailType: null,
        codeError: false,
        codeType: null
    }),
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
    async created() {
        const user = await this.$user.create(this.$i18n.locale)
        if (user.email && user.verified) {
            this.$nuxt.$emit('updateEmailExists', user.email)
        }
        if (process.env.URL) {
            if (user.email) {
                const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
                this.$Tawk.$updateChatUser({ name: user.name, email: user.email, emailHmac: hash})
            }
            const attribute = {
                key: 'user-sub',
                value: this.$store.$auth.user.sub
            }
            this.$Tawk.$setAttribute(attribute)
        }
        this.show = true
    },
    methods: {
        validateEmail(){
            if (!this.email) {
                this.emailType = 'is-danger'
                this.emailError = 'Field required'
                return false
            } else {
                const regex = /\S+@\S+\.\S+/
                const isValidFormat = regex.test(this.email)
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
                await this.$user.update({ email: this.email })
            }
        },
        validateCode(){
            if (!this.code) {
                this.codeType = 'is-danger'
                this.codeError = 'Field required'
                return false
            } else {
                const regex = /^\d{6}$/
                const isValidFormat = regex.test(this.code)
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
                const user = await this.$user.verify(this.code)
                if (user.error) {
                    this.codeType = 'is-danger'
                    this.codeError = 'Invalid code'
                } else {
                    this.$nuxt.$emit('updateEmailExists', this.email)
                    if (process.env.URL) {
                        const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
                        this.$Tawk.$updateChatUser({ name: user.name, email: user.email, emailHmac: hash})
                    }
                }  
            }     
        }
    }
}
</script>
