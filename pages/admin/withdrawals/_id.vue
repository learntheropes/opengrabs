<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Withdrawal {{ id }}</h1>
                <vue-json-pretty :data="withdrawal"> </vue-json-pretty>
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
        const [isAdmin, withdrawal] = await Promise.all([
            app.$admin.isAdmin(),
            app.$axios.get(`/api/admin/withdrawals/${id}`) 
        ])
        return { id, isAdmin, withdrawal: withdrawal.data }
    }
}
</script>