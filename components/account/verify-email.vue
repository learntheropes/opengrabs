<template>
    <section class="section">
        <div class="notification is-danger">
            {{ $t('missingEmailWarning')}}
        </div>
        <b-field :label="$t('emailLabel')" :type="emailType" :message="emailMessage">
            <b-input v-model="email" type="text" expanded></b-input>
        </b-field>
        <button class="button" @click="updateUserEmail">{{ $t('update') }}</button>   
    </section>
</template>

<script>
export default {
    name: 'VerifyEmail',
    middleware: 'auth',
    data: () => ({
        email: null,
        emailError: false,
        emailType: null,
    }),
    computed: {
        emailMessage() {
            if (this.emailError === 'Field required') return this.$t('requiredField')
            else return null
        },        
    },
    async created() {
        const email = await this.$db.user.create({ locale: this.$i18n.locale })
        this.$nuxt.$emit('updateEmailExists', email)
    },
    methods: {
        validateEmail(){
            if (!this.email) {
                this.emailType = 'is-danger'
                this.emailError = 'Field required'
                return false
            }
            return true
        },
        async updateUserEmail() {
            this.emailType = null
            this.emailError = null
            const validEmail = this.validateEmail()
            if (validEmail) {
                const user = await this.$db.user.update({ email: this.email })
                this.$nuxt.$emit('updateEmailExists', user.email)
            }
        },
    }
}
</script>
