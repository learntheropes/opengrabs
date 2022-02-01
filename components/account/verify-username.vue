<template>
    <section class="section">
        <div v-if="show">
            <div class="notification">
                {{ $t('missingUsernameWarning')}}
            </div>
            <b-field grouped :type="usernameType" :message="usernameMessage">
                <b-input v-model="username" type="text" :placeholder="$t('usernameLabel')" expanded />
                <p class="control">
                    <b-button @click="verifyUserEmail">{{ $t('verify') }}</b-button> 
                </p>
            </b-field> 
        </div>
    </section>
</template>

<script>
export default {
    name: 'VerifyUsername',
    middleware: 'auth',
    data: () => ({
        show: false,
        username: null,
        usernameError: false,
        usernameType: null,
    }),
    computed: {
        codeMessage() {
            if (this.usernameError === 'Field required') return this.$t('requiredField')
            else if (this.usernameError === 'Invalid username') return this.$t('invalidUsername')
            else if (this.usernameError === 'Username already in use') return this.$t('UsernameAlreadyInUse')
            else return this.$t('UsernameAlphaNumericBetween5and15Caracters')         
        }     
    },
    async created() {
        const user = await this.$user.create(this.$i18n.locale)
        if (user.username) {
            this.$nuxt.$emit('updateUsernameExists', user.username)
        }
        if (process.env.URL) {
            if (user.username && user.email) {
                const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
                this.$Tawk.$updateChatUser({ name: user.username, email: user.email, emailHmac: hash})
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
        validateUsername(){
            if (!this.username) {
                this.emailType = 'is-danger'
                this.emailError = 'Field required'
                return false
            } else {
                const regex = /^[a-zA-Z0-9]{5,15}$/
                const isValidFormat = regex.test(this.username)
                if (!isValidFormat) {
                    this.emailType = 'is-danger'
                    this.emailError = 'Invalid username'              
                }
                return isValidFormat                
            }
        },
        async updateUserUsername() {
            this.usernameType = null
            this.usenrameError = null
            const validUsername = this.validateUsername()
            if (validUsername) {
                const user = await this.$user.updateUsername({ username: this.username })
                if (user.error) {
                    this.usernameType = 'is-danger'
                    this.usernameError = 'Username already in use'
                } else {
                    this.$nuxt.$emit('updateUsernameExists', this.username)
                    if (process.env.URL && user.email && user.username) {
                        const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
                        this.$Tawk.$updateChatUser({ name: user.username, email: user.email, emailHmac: hash})
                    }
                }  
            }
        }
    }
}
</script>