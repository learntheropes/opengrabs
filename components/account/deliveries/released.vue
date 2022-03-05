<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="delivery of deliveries" :key="delivery.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <account-deliveries-card-content :delivery="delivery" />
          <footer v-if="delivery.paid_at" class="card-footer">
            <nuxt-link :to="localePath({ name: 'account-withdraw-ref', params: { ref: delivery.ref }})" class="card-footer-item">{{ $t('withdraw') }}</nuxt-link>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesReleased',
  middleware: 'auth',
  props: {
    deliveries: {
      type: Array,
      default: () => [],
    },
  }
}
</script>
