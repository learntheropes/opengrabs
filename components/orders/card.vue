<template>
  <div class="card card-equal-height">
    <header class="card-header">
      <p class="card-header-title">{{ order.shop.slug.replace(/-/g,' ') || order.shop.title }}</p>
    </header> 
    <div class="card-image">
      <figure :style="'background-color:grey;'" class="image">
        <img :src="getImage" :alt="'Image of ' + order.shop.title" :title="'Image of ' + order.shop.title" loading="lazy" />
      </figure>
    </div>
    <div class="card-content">
      <div class="content">
        {{ order.shop.quantity }} {{ $t('items') }}
      </div>
      <div class="content">
        <div class="columns is-mobile">
          <div class="column">
            <p>{{ $t('product') }}:<br>
            {{ $t('reward') }}:<br>
            {{ $t('total') }}:</p>
          </div>
          <div class="column" align="right">
            <p>{{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes).toFixed(2) }}<br>
            {{ order.shop.price.reward.toFixed(2) }}<br>
            {{ (order.shop.price.product+order.shop.price.shipping+order.shop.price.taxes+order.shop.price.reward).toFixed(2) }}</p>
          </div>
          <div class="column">
            <p>{{ order.shop.currency }}<br>
            {{ order.shop.currency }}<br>
            {{ order.shop.currency }}</p>
          </div>
        </div>
      </div>
      <div class="content">
        {{ order.shop.packaging ? $t('withPackaging') : $t('withoutPackaging') }}
      </div>
      <div class="content">
        {{ $t('deliveryTo') }} {{ order.destination.city }} [{{ order.destination.country }}]<br>
        {{ $moment(order.destination.max_delivery_date).fromNow() }} [{{ $utils.momentDate(order.destination.max_delivery_date) }}]
      </div>
      <div class="content">
        {{ $t('publishedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: order.buyer.username }})">{{ order.buyer.username }}</nuxt-link><br>
        {{ $moment(order.published_at).fromNow() }}
      </div>
    </div>
    <footer class="card-footer">
      <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ order.shop.name }}.{{ order.shop.domain }}</a>
      <nuxt-link v-if="authenticated && authenticatedUserId !== order.buyer.sub" :to="localePath({ name: 'account-book-ref', params: { ref: order.ref }})" class="card-footer-item">{{ $t('book') }}</nuxt-link>
      <a v-if="!authenticated" href="#" class="card-footer-item" @click="login">{{ $t('loginToBook') }}</a>
    </footer>
  </div>
</template>


<script>
export default {
  name: 'OrderCard',
  props: {
    order: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.loggedIn
    },
    authenticatedUserId() {
      return this.$store.state.auth.loggedIn ? this.$store.state.auth.user.sub : false
    },
    getImage() {
      return this.order.shop.image.replace('https://m.media-amazon.com/images/I/', '/img/amazon/tr:h-210/')
    }
  },
  methods: {
    login() {
      this.$auth.$storage.setUniversal('redirect', this.$route.path)
      this.$auth.loginWith('auth0')
    }
  }
}
</script>