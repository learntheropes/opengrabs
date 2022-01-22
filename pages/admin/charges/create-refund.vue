<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Create Refund</h1>
                <b-field label="Charge ID">
                    <b-input v-model="checkout_id" />
                </b-field>
                <b-field label="Address">        
                    <b-input v-model="address" />
                </b-field>
                <b-field label="Email">        
                    <b-input v-model="email" type="email" />
                </b-field>
                <b-button @click="refund">Refund</b-button>
                <div>{{ response }}</div>
            </div>
        </div>
    </section>
</template>

<script>
// https://developers.opennode.com/reference/create-refund
export default {
    nuxtI18n: false,
    middleware: 'auth',
    async asyncData({ app }) {
        const isAdmin = await app.$admin.isAdmin()
        return { isAdmin }
    },
    data: () => ({
        address: null,
        checkout_id: null,
        email: null,
        response: null
    }),
    methods: {
        async refund() {
            const { data: response } = await this.$axios.post('/api/admin/charges/create-refund', {
                address: this.address,
                checkout_id: this.checkout_id,
                email: this.email
            })
            this.response = response
        }
    }
}
</script>
