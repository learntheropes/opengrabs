<template>
    <section class="section">
    </section>
</template>

<script>
export default {
    name: 'Login',
    middleware: 'auth',
    asyncData({ from }) {
        console.log(from)
        return { fullPath: from.fullPath, path: from.path }
    },
    created() {
        if (this.path !== '/cb' && this.path !== `${this.$i18n.locale}/orders` && this.path !== `${this.$i18n.locale}/travels`) this.$auth.$storage.setUniversal('redirect', this.fullPath)
        this.$auth.loginWith('auth0')
    }
}
</script>
