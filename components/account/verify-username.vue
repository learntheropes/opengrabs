<template>
    <section class="section">
        <div v-if="show">
            <div class="notification">
                {{ $t('missingUsernameWarning')}}
            </div>
            <b-field grouped :type="usernameType" :message="usernameMessage">
                <b-input v-model="user.username" type="text" :placeholder="$t('usernameLabel')" expanded />
                <p class="control">
                    <b-button type="is-primary" outlined @click="updateUserUsername">{{ $t('update') }}</b-button> 
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
        user: {
            email: null,
            email_verified: false,
            username: null,
        },
        show: false,
        usernameError: false,
        usernameType: null,
    }),
    async fetch() {
        this.user = await this.$user.get()
        if (this.user.username) {
            this.$nuxt.$emit('updateUser', {email: this.user.email, email_verified: this.user.email_verified, username: this.user.username})
        } else {
            const user = this.$store.state.auth.user
            this.user = JSON.parse(JSON.stringify(user))
            if (!this.user.username) {
                this.show = true
            }
        }
    },
    computed: {
        usernameMessage() {
            if (this.usernameError === 'Field required') return this.$t('requiredField')
            else if (this.usernameError === 'Invalid username') return this.$t('invalidUsername')
            else if (this.usernameError === 'Username already in use') return this.$t('UsernameAlreadyInUse')
            else if (this.usernameError === "You can't change username") return this.$t('youCantChangeUsername')
            else return this.$t('UsernameAlphaNumericBetween5and15Caracters')         
        }     
    },
    async created() {
        const user = await app.$user.get()
        if (process.env.URL && user.username && user.email && this.$Tawk.$isInit()) {
            const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
            this.$Tawk.$updateChatUser({ name: user.username, email: user.email, emailHmac: hash})

            const userSub = {
                key: 'user-sub',
                value: this.$store.$auth.user.sub
            }
            this.$Tawk.$setAttribute(userSub)

            const bitcoinNetwork = {
                key: 'bitcoin-network',
                value: (process.env.BTC_CHAIN === 'test3') ? 'testnet': 'mainnet'
            }
            this.$Tawk.$setAttribute(bitcoinNetwork)
        }
    },
    methods: {
        validateUsername(){
            if (!this.user.username) {
                this.usernameType = 'is-danger'
                this.usernameError = 'Field required'
                return false
            } else {
                const regex = /^[a-zA-Z0-9]{5,15}$/
                const isValidFormat = regex.test(this.user.username)
                console.log(isValidFormat)
                if (!isValidFormat) {
                    this.usernameType = 'is-danger'
                    this.usernameError = 'Invalid username'              
                }
                return isValidFormat                
            }
        },
        async updateUserUsername() {
            this.usernameType = null
            this.usenrameError = null
            const validUsername = this.validateUsername()
            if (validUsername) {
                this.user = await this.$user.update(this.user)
                if (this.user.error) {
                    this.usernameType = 'is-danger'
                    this.usernameError = this.user.error
                } else {
                    this.show = false
                    console.log(this.user.username)
                    this.$nuxt.$emit('updateUser', {email: this.user.email, email_verified: this.user.email_verified, username: this.user.username})
                    if (process.env.URL && this.user.email && this.user.username) {
                        const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${this.user.email}`)
                        this.$Tawk.$updateChatUser({ name: this.user.username, email: this.user.email, emailHmac: hash})
                    }
                }  
            }
        }
    }
}
</script>
