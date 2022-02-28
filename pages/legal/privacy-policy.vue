<template>
    <section class="section container">
    </section>
</template>

<script>
export default {
    name: 'PrivacyPolicy',
    auth: false,
    head() {
        return {
            title: this.$t('seo.privacyPolicy')
        }
    },
}
</script>