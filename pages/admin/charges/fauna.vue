<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Charges from grabs</h1>
                <b-table :data="charges.data">
                    <template>
                        <b-table-column v-slot="props" label="ID" field="charge.id" searchable>
                            {{ props.row.charge.id }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Order ID" field="ref" searchable>
                            {{ props.row.ref}}
                        </b-table-column> 
                        <b-table-column v-slot="props" label="Status" field="charge.status" searchable>
                            {{ props.row.charge.status}}
                        </b-table-column> 
                        <b-table-column v-slot="props" label="Payment method" field="charge.payment_method" searchable>
                            {{ props.row.charge.payment_method}}
                        </b-table-column>                                          
                        <b-table-column  v-slot="props" label="Description">
                            <p v-if="props.row.charge.description">{{ props.row.charge.description }}</p>
                        </b-table-column>
                        <b-table-column  v-slot="props" label="Missing amount">
                            <p v-if="props.row.charge.missing_amt">{{ props.row.charge.missing_amt }}</p>
                        </b-table-column>                        
                        <b-table-column v-slot="props" label="Paid At">
                            {{ $moment(props.row.paid_at).format('MMMM Do YYYY HH:mm') }}
                        </b-table-column>
                        <b-table-column v-slot="props">
                            <nuxt-link :to="'/admin/charges/'+props.row.charge.id">View</nuxt-link>
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
        const [isAdmin, charges] = await Promise.all([
            app.$admin.isAdmin(),
            app.$axios.get('/api/admin/db/charges/webhook')
        ])
        console.log(charges)
        return { isAdmin, charges }
    }
}
</script>