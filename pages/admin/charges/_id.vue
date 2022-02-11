<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Charge {{ id }}</h1>
                <vue-json-pretty :data="charge"> </vue-json-pretty>
            </div>
        </div>      
    </section>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
export default {
    nuxtI18n: false,
    components:{
        VueJsonPretty,
    },
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app, params: { id }}) {
        const [isAdmin, charge] = await Promise.all([
            app.$admin.isAdmin(),
            app.$axios.get(`/api/admin/charges/${id}`) 
        ])
        return { id, isAdmin, charge: charge.data }
    }
}
</script>