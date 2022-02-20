<template>
    <aside class="menu">
    <ul class="menu-list">
        <li><nuxt-link :to="localePath({ name: 'index' })">Website homepage</nuxt-link></li>
        <li><nuxt-link to="/admin">Admin homepage</nuxt-link></li>
    </ul>
    <p class="menu-label">Open Tickets</p>
    <ul class="menu-list">
        <li><nuxt-link to="/admin/tickets/open/en">English</nuxt-link></li>
        <li><nuxt-link to="/admin/tickets/open/es">Spanish</nuxt-link></li>
        <li><nuxt-link to="/admin/tickets/open/pt">Portuguese</nuxt-link></li>
        <li><nuxt-link to="/admin/tickets/open/ru">Russina</nuxt-link></li>
    </ul>
    <p class="menu-label">Close Tickets</p>
    <ul class="menu-list">
        <li><nuxt-link to="/admin/tickets/close/en">English</nuxt-link></li>
        <li><nuxt-link to="/admin/tickets/close/es">Spanish</nuxt-link></li>
        <li><nuxt-link to="/admin/tickets/close/pt">Portuguese</nuxt-link></li>
        <li><nuxt-link to="/admin/tickets/close/ru">Russina</nuxt-link></li>
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
        <li><nuxt-link to="/admin/charges/fauna">From grabs</nuxt-link></li>
        <li><nuxt-link to="/admin/charges/create-refund">Create Refund</nuxt-link></li>
    </ul>
    <p class="menu-label">Withdrawals</p>
    <ul class="menu-list">
        <li><nuxt-link to="/admin/withdrawals/list">List</nuxt-link></li>
        <li><nuxt-link to="/admin/withdrawals/fauna">From grabs</nuxt-link></li>
    </ul>
    <p class="menu-label">Feedback</p>
    <ul class="menu-list">
        <li><nuxt-link to="/admin/feedback">By username</nuxt-link></li>
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