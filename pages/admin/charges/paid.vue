<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Paid Charges</h1>
                <b-table :data="charges.data.items">
                    <template>
                        <b-table-column v-slot="props" label="ID" field="id" searchable>
                            {{ props.row.id }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Order ID" field="order_id" searchable>
                            {{ props.row.order_id}}
                        </b-table-column>                  
                        <b-table-column  v-slot="props" label="Description">
                            <p v-if="props.row.description">{{ props.row.description }}</p>
                        </b-table-column>
                        <b-table-column v-slot="props" label="Created At">
                            {{ $moment(props.row.created_at).format('MMMM Do YYYY HH:mm') }}
                        </b-table-column>
                        <b-table-column v-slot="props">
                            <nuxt-link :to="'/admin/charges/'+props.row.id">View</nuxt-link>
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
            app.$axios.get('/api/admin/charges/paid')
        ])
        return { isAdmin, charges }
    }
}
</script>