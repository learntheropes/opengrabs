<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <header class="card-header">
            <p class="card-header-title">{{ order.shop.slug.replace(/-/g,' ')}}</p>
          </header> 
          <div class="card-image">
            <figure :style="'background-color:grey;'" class="image">
              <img :src="order.shop.image" :alt="'Image of ' + order.shop.title"/>
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
                  <p>{{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes).toFixed(2) }}<br>
                    {{ order.shop.price.reward.toFixed(2) }}<br>
                    {{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes+order.shop.price.reward).toFixed(2) }}
                  </p>
                </div>
                <div class="column">
                  <p>{{ order.shop.currency }}<br>
                    {{ order.shop.currency }}<br>
                    {{ order.shop.currency }}
                  </p>
                </div>
              </div>
            </div>
            <div class="content">
              {{ $t('deliveryTo') }} {{ order.destination.city }} [{{ order.destination.country }}]<br>
              {{ $moment(order.delivery.date).fromNow() }} [{{ $utils.momentDate(order.delivery.date) }}]
            </div>
            <div class="content">
              {{ $t('releasedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: order.traveler.username }})">{{ order.traveler.username }}</nuxt-link><br>
              {{ $moment(order.released_at).fromNow() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'OrdersReleased',
  middleware: 'auth',
  props: {
    'orders': {
      type: Array,
      default: () => []
    }
  }
}
</script>
