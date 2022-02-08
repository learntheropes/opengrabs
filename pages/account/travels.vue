<template>
    <section class="section container">
        <div v-if="!expired.length && ! actives.length" class="box has-text-centered">
            <p>{{ $t('youDontHaveAnyTravel') }}.</p>
            <p>{{ $t('youCanPublish') }} <nuxt-link :to="localePath({ name: 'account-new', query: { adv: 'travel'}})">{{ $t('here') }}</nuxt-link></p>
        </div>
        <b-tabs v-else v-model="activeTab" position="is-centered" class="block" multiline>
            <b-tab-item v-if="expired.length">
                <template #header>
                    <span>{{ $t('expired') }}<b-tag rounded>{{ expired.length }}</b-tag></span>
                </template>
                <account-travels-expired :travels="expired" />
            </b-tab-item>

            <b-tab-item v-if="actives.length">
                <template #header>
                    <span>{{ $t('actives') }}<b-tag rounded>{{ actives.length }}</b-tag></span>
                </template>
                <account-travels-actives :travels="actives" />
            </b-tab-item>
        </b-tabs>
    </section>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'AccountTravels',
    middleware: 'auth',
    async fetch({ app, store }) {
        if (!store.state.account.travels.initiated) {
            const [expired, actives] = await Promise.all([
                app.$db.account.travels.filter('expired'),
                app.$db.account.travels.filter('actives')
            ])
            store.commit('account/travels/setExpired', expired)
            store.commit('account/travels/setActives', actives)
            store.commit('account/travels/setInitiated', true)
        } 
    },
    computed: {
        ...mapState({
            expired: (state) => state.account.travels.expired,
            actives: (state) => state.account.travels.actives
        }),
        activeTab: {
            get() {
                return this.$store.state.account.travels.activeTab
            },
            set(tab) {
                this.$store.commit('account/travels/setActiveTab', tab)
            },
        }
    },
    async created() {
        const user = await this.$user.get()
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
}
</script>