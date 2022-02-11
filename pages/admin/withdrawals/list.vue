<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Withdrawals</h1>
                <b-table :data="withdrawals.data.items">
                    <template>
                        <b-table-column v-slot="props" label="ID" field="id" searchable>
                            {{ props.row.id }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Type" field="type" searchable>
                            {{ props.row.type}}
                        </b-table-column>                 
                        <b-table-column v-slot="props" label="Processed At">
                            {{ $moment(props.row.processed_at).format('MMMM Do YYYY HH:mm') }}
                        </b-table-column>
                        <b-table-column v-slot="props">
                            <nuxt-link :to="'/admin/withdrawals/'+props.row.id">View</nuxt-link>
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
        const [isAdmin, withdrawals] = await Promise.all([
            app.$admin.isAdmin(),
            app.$axios.get('/api/admin/withdrawals/list')
        ])
        return { isAdmin, withdrawals }
    }
}
</script>