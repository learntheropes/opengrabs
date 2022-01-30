<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="delivery of deliveries" :key="delivery.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <header class="card-header">
            <p class="card-header-title">{{ delivery.shop.slug.replace(/-/g,' ')}}</p>
          </header> 
          <div class="card-image">
            <figure :style="'background-color:grey;'" class="image">
              <img :src="delivery.shop.image" :alt="'Image of ' + delivery.shop.title"/>
            </figure>
          </div>
          <div class="card-content">
            <div class="content">
              <p>{{ delivery.shop.title }}</p>
            </div>
            <div class="content">
              <a :href="delivery.shop.url" target="_blank" class="card-footer-item">{{ delivery.shop.name }}.{{ delivery.shop.domain }}</a>
            </div>
            <div class="content">
              <div class="columns is-mobile">
                <div class="column">
                  <p>{{ $t('product') }}:<br>
                    {{ $t('reward') }}:<br>
                    {{ $t('total') }}:
                  </p>
                </div>
                <div class="column" align="right">
                  <p>{{ (delivery.shop.price.product+delivery.shop.price.shipping+delivery.shop.price.taxes).toFixed(2) }}<br>
                    {{ delivery.shop.price.reward.toFixed(2) }}<br>
                    {{ (delivery.shop.price.product+delivery.shop.price.shipping+delivery.shop.price.taxes+delivery.shop.price.reward).toFixed(2) }}
                  </p>
                </div>
                <div class="column">
                  <p>{{ delivery.shop.currency }}<br>
                    {{ delivery.shop.currency }}<br>
                    {{ delivery.shop.currency }}
                  </p>
                </div>
              </div>
            </div>
            <div class="content">
              {{ $t('deliveryTo') }} {{ delivery.destination.city }} [{{ delivery.destination.country }}]<br>
              {{ $moment(delivery.delivery.date).fromNow() }} [{{ $utils.momentDate(delivery.delivery.date) }}]
            </div>
            <div class="content">
              {{ $t('refundedTo') }} {{ delivery.buyer.name }}<br>
              {{ $moment(delivery.refunded_at).fromNow() }}
            </div>
          </div>
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
  },
}
</script>