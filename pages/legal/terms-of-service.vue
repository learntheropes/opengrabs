<template>
    <section class="section container">
    </section>
</template>

<script>
export default {
    name: 'TermsOfService',
    auth: false,
    head() {
        return {
            title: this.$t('seo.termsOfService')
        }
    },
}
</script> 