<template>
    <section class="section container">
        <h1 class="title">{{ $t('fees.title') }}</h1>
        <h2 class="subtitle">{{ $t('fees.subtitle') }}</h2>
        <div class="content"></div>
        <content-article-image src="sample.jpg" alt="Image of grabr.io product price" title="Image of grabr.io product price" loading="lazy" />
    </section>
</template>

<script>
export default {
    auth: false,
    head() {
        return {
            title: this.$t('seo.fees'),
            link: [
                {
                    hid: 'canonical',
                    rel: 'canonical',
                    href: `https://${process.env.URL}/${this.$i18n.locale}/fees`,
                },
            ],
        }
    },
}
</script>
