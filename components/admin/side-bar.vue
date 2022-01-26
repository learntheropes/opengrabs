<template>
    <aside class="menu">
    <ul class="menu-list">
        <li><nuxt-link :to="localePath({ name: 'index' })">Website homepage</nuxt-link></li>
        <li><nuxt-link to="/admin">Admin homepage</nuxt-link></li>
    </ul>
    <p class="menu-label">Tawk.to</p>
    <ul class="menu-list">
        <li><a href="https://dashboard.tawk.to" target="_blank">Dashboard</a></li>
    </ul>
    <p class="menu-label">Knowledge Base</p>
    <ul class="menu-list">
        <li><a href="https://opengrabs.tawk.help/" target="_blank">English</a></li>
        <li><a href="https://opengrabs.tawk.help/es" target="_blank">Spanish</a></li>
        <li><a href="https://opengrabs.tawk.help/pt" target="_blank">Portuguese</a></li>
        <li><a href="https://opengrabs.tawk.help/ru" target="_blank">Russina</a></li>
    </ul>
    <p class="menu-label">Grabs</p>
    <ul class="menu-list">
        <li><nuxt-link to="/admin/grabs">Grabs</nuxt-link></li>
    </ul>
    <p class="menu-label">Disputes</p>
    <ul class="menu-list">
        <li><nuxt-link to="/admin/disputes/open">Open</nuxt-link></li>
        <li><nuxt-link to="/admin/disputes/close">Close</nuxt-link></li>
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
    nuxtI18n: false,
    auth: false,    
    async asyncData({ app }) {
        const { data } = await app.$axios.get('/api/admin/is-admin')
        return {isAdmin: data.isAdmin}
    }
}
</script>