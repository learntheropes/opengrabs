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
              {{ $t('bookedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { ref: order.traveler.username }})">{{ order.traveler.username }}<br>
              {{ $moment(order.delivery.date).fromNow() }} [{{ $utils.momentDate(order.delivery.date) }}]
            </div>
            <div class="content">
              {{ $t('paidAt') }} {{ $moment(order.paid_at).fromNow() }}
            </div>
          </div>
          <footer class="card-footer">
            <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ order.shop.name }}.{{ order.shop.domain }}</a>
            <nuxt-link :to="{ name: 'account-order-by-ref', params: { ref: order.ref }}" class="card-footer-item">{{ $t('chat') }}</nuxt-link>
            <a href="#" class="card-footer-item" @click="dispute(order.ref)">{{ $t('dispute') }}</a>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'OrdersPaid',
  middleware: 'auth',
  props: {
    orders: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    async dispute(ref) {
      await this.$grab.dispute({ ref })
      const [paid, disputed] = await Promise.all([
        this.$db.account.orders.filter('paid'),
        this.$db.account.orders.filter('disputed'),
      ])
      this.$store.commit('account/orders/setPaid', paid)
      this.$store.commit('account/orders/setDisputed', disputed)
    },
  },
}
</script>
