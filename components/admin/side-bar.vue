<template>
    <aside class="menu">
    <ul class="menu-list">
        <li><nuxt-link :to="localePath({ name: 'index' })">Website homepage</nuxt-link></li>
        <li><nuxt-link to="/admin">Admin homepage</nuxt-link></li>
    </ul>
    <p class="menu-label">Grabs</p>
    <ul class="menu-list">
        <li><nuxt-link to="/admin/grabs">Grabs</nuxt-link></li>
        <li><nuxt-link to="/admin/disputes">Disputes</nuxt-link></li>
    </ul>
    <p class="menu-label">Charges</p>
    <ul class="menu-list">
        <li><nuxt-link to="/admin/charges/paid">Paid</nuxt-link></li>
        <li><nuxt-link to="/admin/charges/create-refund">Create Refund</nuxt-link></li>
    </ul>
    </aside>
</template>

<script>
export default {
    async asyncData({ app }) {
        const { data } = await app.$axios.get('/api/admin/is-admin')
        return {isAdmin: data.isAdmin}
    }
}
</script>