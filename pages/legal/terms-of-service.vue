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
            title: this.$t('seo.termsOfService'),
            link: [
                {
                    hid: 'canonical',
                    rel: 'canonical',
                    href: `https://${process.env.URL}/${this.$i18n.locale}/legal/terms-of-service`,
                },
            ],
        }
    },
}
</script> 