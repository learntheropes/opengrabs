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
            title: this.$t('seo.privacyPolicy'),
            link: [
                {
                    hid: 'canonical',
                    rel: 'canonical',
                    href: `https://${process.env.URL}/${this.$i18n.locale}/legal/privacy-policy`,
                },
            ],
        }
    },
}
</script>