<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                
            </div>
        </div>
    </section>
</template>

<script>
export default {
    nuxtI18n: false,
    auth: false,
    layout: 'admin',
    async asyncData({ app }) {
        const isAdmin = await app.$admin.isAdmin()
        if (isAdmin) {
            app.i18n.locale = 'en'
            app.$moment.locale('en')
        }
        return { isAdmin }
    },
}
</script>
