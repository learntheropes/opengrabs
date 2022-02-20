<template>
    <section class="section container">
        <h1 class="title">{{ $t('support') }}</h1>
        <div v-if="authenticated" class="content">
            {{ $t('visitThe') }} <nuxt-link :to="localePath({ name: 'account-tickets' })">{{ $t('ticket') }}</nuxt-link> {{ $t('page') }}
        </div>
        <div v-else class="content">
            {{ $t('loginAndOpenA') }} <a @click="login">{{ $t('ticket') }}</a> {{ $t('page') }}.<br>
            {{ $t('ifYouCantLoginWriteUsAn') }} <a target="_blank" :href="`mailto:${$t('help')}@${url}`">{{ $t('email') }}</a> {{ $t('page') }}.
        </div>
    </section>
</template>

<script>
export default {
    name: "Help",
    auth: false,
    computed: {
        authenticated() {
            return this.$store.state.auth.loggedIn
        },
        url() {
            return process.env.URL
        }
    },
    methods: {
        login() {
            this.$auth.$storage.setUniversal('redirect', `/${this.$i18n.locale}/account/tickets`)
            this.$auth.loginWith('auth0')            
        }
    }
}
</script>