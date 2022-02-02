<template>
    <section class="section">
    </section>
</template>

<script>
export default {
    name: 'Login',
    middleware: 'auth',
    asyncData({ from }) {   
        return { fullPath: from.fullPath}
    },
    created() {
        this.$auth.$storage.setUniversal('redirect', this.fullPath)
        this.$auth.loginWith('auth0')
    }
}
</script>
