<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Charge {{ id }}</h1>
                {{ JSON.stringify(charge, null, 2) }}
            </div>
        </div>      
    </section>
</template>

<script>
export default {
    nuxtI18n: false,
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app, params: { id }}) {
        const [isAdmin, charge] = await Promise.all([
            app.$admin.isAdmin(),
            app.$axios.get(`/api/admin/charges/${id}`) 
        ])
        return { id, isAdmin, charge }
    }
}
</script>