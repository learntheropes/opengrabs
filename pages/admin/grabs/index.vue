<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Grabs</h1>
                <b-table :data="grabs">
                    <template>
                        <b-table-column v-slot="props" label="Ref">
                            {{ props.row.ref }}
                        </b-table-column>
                        <b-table-column  v-slot="props" label="Status">
                            {{ props.row.status }}
                        </b-table-column>                        
                        <b-table-column  v-slot="props" label="Buyer">
                            <p v-if="props.row.buyer">{{ props.row.buyer.sub }} {{ props.row.buyer.name }}</p>
                        </b-table-column>
                        <b-table-column v-slot="props" label="Traveler">
                            <p v-if="props.row.traveler">{{ props.row.traveler.sub }} {{ props.row.traveler.name }}</p>
                        </b-table-column>
                        <b-table-column v-slot="props" label="Updated At">
                            {{ $moment(props.row.updated_at).fromNow() }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Open">
                            <nuxt-link :to="'/admin/grabs/'+props.row.ref">
                                View
                            </nuxt-link>
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
    middleware: 'auth',
    async asyncData({ app }) {
        const [isAdmin, grabs] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.grabs.list()
        ])
        return { isAdmin, grabs }
    }
}
</script>