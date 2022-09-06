<template>
  <section class="section">
  <div class="columns is-multiline">
    <div v-for="delivery of deliveries" :key="delivery.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
    <div class="card card-equal-height">
      <account-deliveries-card-content :delivery="delivery" />
    </div>
    </div>
  </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesRefunded',
  middleware: 'auth',
  props: {
  deliveries: {
    type: Array,
    default: () => [],
  },
  }
}
</script>