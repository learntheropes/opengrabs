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
              <img :src="getImage(order)" :alt="'Image of ' + order.shop.title"/>
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
              {{ order.shop.packaging ? $t('withPackaging') : $t('withoutPackaging') }}
            </div>
            <div class="content">
              {{ $t('deliveryTo') }} {{ order.destination.city }} [{{ order.destination.country }}]<br>
              {{ $moment(order.delivery.date).fromNow() }} [{{ $utils.momentDate(order.delivery.date) }}]
            </div>
            <div class="content">
              {{ $t('deliveredBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: order.traveler.username }})">{{ order.traveler.username }}</nuxt-link><br>
              {{ $moment(order.delivered_at).fromNow() }}
            </div>
          </div>
          <footer class="card-footer">
            <nuxt-link :to="localePath({ name: 'account-grab-ref', params: { ref: order.ref }})" class="card-footer-item">{{ $t('chat') }}</nuxt-link>
          </footer>
          <footer class="card-footer">
            <a href="#" :class="disputeButtonClass" @click="dispute(order.ref)">{{ $t('dispute') }}</a>
            <a href="#" :class="releaseButtonClass" @click="release(order.ref)">{{ $t('release') }}</a>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { amazonUrl } from '~/assets/js/image'
export default {
  name: 'OrdersDelivered',
  middleware: 'auth',
  props: {
    orders: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    disputeButtonClass: 'card-footer-item',
    releaseButtonClass: 'card-footer-item'
  }),
  methods: {
    getImage(order) {
      return order.shop.image.replace('https://m.media-amazon.com/images/I/', amazonUrl)
    },
    async dispute(ref) {
      this.disputeButtonClass = 'card-footer-item disabled'
      await this.$grab.dispute({ ref })
      const [bought, disputed] = await Promise.all([
        this.$db.account.products.filter('bought'),
        this.$db.account.products.filter('disputed'),
      ])
      this.$store.commit('account/orders/setBought', bought)
      this.$store.commit('account/orders/setDisputed', disputed)
      this.disputeButtonClass = 'card-footer-item'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabDisputed'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    },
    async release(ref) {
      this.releaseButtonClass = 'card-footer-item disabled'
      await this.$grab.release({ ref })
      const [delivered, released] = await Promise.all([
        this.$db.account.orders.filter('delivered'),
        this.$db.account.orders.filter('released'),
      ])
      this.$store.commit('account/orders/setDelivered', delivered)
      this.$store.commit('account/orders/setReleased', released)
      this.releaseButtonClass = 'card-footer-item'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabReleased'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    },
  },
}
</script>
