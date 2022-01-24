<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Disputes</h1>
                <b-table :data="disputes">
                    <template>
                        <b-table-column v-slot="props" label="Ref">
                            {{ props.row.ref }}
                        </b-table-column>
                        <b-table-column  v-slot="props" label="Buyer">
                            {{ props.row.buyer.sub }} {{ props.row.buyer.name }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Traveler">
                            {{ props.row.traveler.sub }} {{ props.row.traveler.name }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Started By">
                            {{ props.row.dispute.by }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Started At">
                            {{ $moment(props.row.disputed_at).fromNow() }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Open">
                            <nuxt-link :to="'/admin/disputes/'+props.row.ref">
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
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app }) {
        const [isAdmin, disputes] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.disputes.filter('open') 
        ])
        return { isAdmin, disputes }
    }
}
</script>