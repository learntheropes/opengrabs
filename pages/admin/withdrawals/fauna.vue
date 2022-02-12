<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Withdraws from grabs</h1>
                <b-table :data="withdraws.data">
                    <template>
                        <b-table-column v-slot="props" label="ID" field="withdraw.webhook.id" searchable>
                            {{ props.row.withdraw.webhook.id }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Order ID" field="ref" searchable>
                            {{ props.row.ref}}
                        </b-table-column> 
                        <b-table-column v-slot="props" label="Status" field="withdraw.webhook.status" searchable>
                            {{ props.row.withdraw.webhook.status}}
                        </b-table-column> 
                        <b-table-column v-slot="props" label="Payment method" field="withdraw.webhook.payment_method" searchable>
                            {{ props.row.withdraw.webhook.payment_method}}
                        </b-table-column>                                          
                        <b-table-column  v-slot="props" label="Description">
                            <p v-if="props.row.withdraw.webhook.description">{{ props.row.data.withdraw.webhook.description }}</p>
                        </b-table-column>                      
                        <b-table-column v-slot="props" label="Withdrawn At">
                            {{ $moment(props.row.withdrawn_at).format('MMMM Do YYYY HH:mm') }}
                        </b-table-column>
                        <b-table-column v-slot="props">
                            <nuxt-link :to="'/admin/withdraws/'+props.row.withdraw.webhook.id">View</nuxt-link>
                        </b-table-column>
                    </template>
                </b-table>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    nuxtI18n: false,
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app }) {
        const [isAdmin, withdraws] = await Promise.all([
            app.$admin.isAdmin(),
            app.$axios.get('/api/admin/db/withdraws/webhook')
        ])
        return { isAdmin, withdraws }
    }
}
</script>