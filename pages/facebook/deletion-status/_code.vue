<template>
    <section class="section container">
        {{ status }}
    </section>
</template>

<script>
export default {
    auth: false,
    async asyncData ({ app, params: { code }}) {
        const { data: { status }} = await app.$axios.get(`/api/facebook/get/status/${code}`)
        return { status }

    }
}
</script>
