<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="delivery of deliveries" :key="delivery.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <account-deliveries-card-content :delivery="delivery" />
          <footer class="card-footer">
            <a :href="delivery.shop.url" target="_blank" class="card-footer-item">{{ delivery.shop.name }}.{{ delivery.shop.domain }}</a>
            <nuxt-link :to="localePath({ name: 'account-grab-ref', params: { ref: delivery.ref }})" class="card-footer-item">{{ $t('chat') }}</nuxt-link>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesDisputed',
  middleware: 'auth',
  props: {
    deliveries: {
      type: Array,
      default: () => [],
    }
  }
}
</script>
