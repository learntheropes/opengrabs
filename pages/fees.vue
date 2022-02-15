<template>
    <section class="section container">
        <h1 class="title">{{ $t('fees.title') }}</h1>
        <h2 class="subtitle">{{ $t('fees.subtitle') }}</h2>
        <div class="content"></div>
        <content-article-image alt="foo-bar" src="sample.jpg" />
    </section>
</template>

<script>
export default {
    auth: false,
}
</script>
