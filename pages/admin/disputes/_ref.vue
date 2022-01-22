<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Dispute {{ grab.ref }}</h1>
            </div>
            <div v-if="grab.dispute.status==='open'" class="buttons">
                <button class="button is-primary" @click="refund(grab.ref)">Refund the Buyer</button>
                <button class="button is-primary" @click="release(grab.ref)">Release to the Traveler</button>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    nuxtI18n: false,
    middleware: 'auth',
    async asyncData({ app, params: { ref }}) {
        const [isAdmin, grab, messages] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.grabs.get(ref),
            app.$admin.messages.list(ref)           
        ])
        return { isAdmin, ref, grab, messages }
    },
    methods: {
        async refund(ref) {
            await this.$axios.post(`/api/admin/disputes/actions/refund/${ref}`)
            this.grab = this.$admin.grabs.get(this.ref)
        },
        async release(ref) {
            await this.$axios.post(`/api/admin/disputes/actions/release/${ref}`)
            this.grab = this.$admin.grabs.get(this.ref)
        }
    }
}
</script>
