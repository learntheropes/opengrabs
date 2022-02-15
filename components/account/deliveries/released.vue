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
              <img :src="getImage(delivery)" :alt="'Image of ' + delivery.shop.title"/>
            </figure>
          </div>
          <div class="card-content">
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
              {{ $t('releasedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: delivery.buyer.username }})">{{ delivery.buyer.username }}</nuxt-link><br>
              {{ $moment(delivery.released_at).fromNow() }}
            </div>
          </div>
          <footer v-if="delivery.paid_at" class="card-footer">
            <nuxt-link :to="{ name: 'account-withdraw-ref', params: { ref: delivery.ref }}" class="card-footer-item">{{ $t('withdraw') }}</nuxt-link>
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
  },
  methods: {
    getImage(delivery) {
      return delivery.shop.image.replace('https://m.media-amazon.com/images/I/', 'https://res.cloudinary.com/opengrabs/image/upload/h_210/amazon/')
    }
  },
}
</script>
