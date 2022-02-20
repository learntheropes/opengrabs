<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 v-if="language === 'en'" class="title">English close tickets</h1>
                <h1 v-if="language === 'es'" class="title">Spanish close tickets</h1>
                <h1 v-if="language === 'pt'" class="title">Portuguese close tickets</h1>
                <h1 v-if="language === 'ru'" class="title">Russian close tickets</h1>
                <b-table :data="tickets">
                    <template>
                        <b-table-column v-slot="props" label="Ref" field="ref" searchable>
                            {{ props.row.ref }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="User" field="user.username" searchable>
                            {{ props.row.user.username }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Subject">
                            {{ props.row.subject }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Created At">
                            {{ $moment(props.row.created_at).fromNow() }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="Updated At">
                            {{ $moment(props.row.updated_at).fromNow() }}
                        </b-table-column>
                        <b-table-column v-slot="props">
                            <nuxt-link :to="'/admin/tickets/'+props.row.ref">
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
    async asyncData({ app, params: { language }}) {
        const [isAdmin, tickets] = await Promise.all([
            app.$admin.isAdmin(),
            app.$admin.tickets.filter('close', language) 
        ])
        return { isAdmin, language, tickets }
    }
}
</script>