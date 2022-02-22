<template>
    <section class="section container">
        <h1 class="title">{{ $t('tickets') }}</h1>
        <b-field grouped group-multiline :type="subjectType" :message="subjectMessage">
            <b-input v-model="subject" :placeholder="$t('subjectPlaceholder')" expanded></b-input>
            <p class="control">
                <b-button :label="$t('openNewTicket')" type="is-primary is-outlined" @click="openNewTicket" />
            </p>
        </b-field>
        <b-table v-if="tickets.length" :data="tickets">
            <template>
                <b-table-column v-slot="props" :label="$t('subject')">
                    {{ props.row.subject }}
                </b-table-column>
                <b-table-column v-slot="props" :label="$t('createdAt')">
                    {{ $moment(props.row.created_at).fromNow() }}
                </b-table-column>
                <b-table-column v-slot="props" :label="$t('updatedAt')">
                    {{ $moment(props.row.updated_at).fromNow() }}
                </b-table-column>
                <b-table-column v-slot="props">
                    <nuxt-link :to="localePath({ name: 'account-tickets-ref', params: { ref: props.row.ref }})">
                        {{ $t('view') }}
                    </nuxt-link>
                </b-table-column>
            </template>
        </b-table>
    </section>
</template>

<script>
export default {
    name: 'Tickets',
    middleware: 'auth', 
    async asyncData({ app }) {
        const tickets = await app.$tickets.filter()
        return { tickets }
    },
    data: () => ({
        subject: null,
        subjectType: null,
        subjectError: false,
        ticketButtonClass: 'button is-primary is-outlined'
    }),
    computed: {
        subjectMessage() {
            if (this.subjectError === 'Field required') return this.$t('requiredField')
            else return null 
        }
    },
    methods: {
        validateSubject() {
            if (!this.subject) {
                this.subjectType = 'is-danger'
                this.subjectError = 'Field required'
                return false
            }
            return true
        }, 
        async openNewTicket() {
            this.subjectType = null
            this.subjectError = false
            const validSubject = this.validateSubject()
            if (validSubject) {
                this.ticketButtonClass = 'button is-primary is-outlined is-loading'
                const ticket = {
                    admin: null,
                    status: 'open',
                    language: this.$i18n.locale,
                    subject: this.subject,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                const { id } = await this.$tickets.create(ticket)
                this.ticketButtonClass = 'button is-primary is-outlined'
                this.$router.push(`/${this.$i18n.locale}/account/tickets/${id}`)
            }
        }
    }  
}
</script>