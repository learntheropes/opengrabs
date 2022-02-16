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
              {{ delivery.shop.packaging ? $t('withPackaging') : $t('withoutPackaging') }}
            </div>
            <div class="content">
              {{ $t('deliveryTo') }} {{ delivery.destination.city }} [{{ delivery.destination.country }}]<br>
              {{ $moment(delivery.delivery.date).fromNow() }} [{{ $utils.momentDate(delivery.delivery.date) }}]
            </div>
            <div class="content">
              {{ $t('publishedBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: delivery.buyer.username }})">{{ delivery.buyer.username }}</nuxt-link><br>
              {{ $moment(delivery.published_at).fromNow() }}
            </div>
            <div class="content">
              {{ $t('boughtAt') }} {{ $moment(delivery.bought_at).fromNow() }}
            </div>
          </div>
          <footer class="card-footer">
            <nuxt-link :to="{ name: 'account-grab-ref', params: { ref: delivery.ref }}" class="card-footer-item">Chat</nuxt-link>
            <a href="#" :class="deliveredButtonClass" @click="delivered(delivery.ref)">{{ $t('delivered') }}</a>
            <a href="#" :class="disputeButtonClass" @click="dispute(delivery.ref)">{{ $t('dispute') }}</a>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesBought',
  middleware: 'auth',
  props: {
    deliveries: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    deliveredButtonClass: 'card-footer-item',
    disputeButtonClass: 'card-footer-item'
  }),
  methods: {
    getImage(delivery) {
      return delivery.shop.image.replace('https://m.media-amazon.com/images/I/', 'https://res.cloudinary.com/opengrabs/image/upload/h_210/amazon/')
    },
    async delivered(ref) {
      this.deliveredButtonClass = 'card-footer-item disabled'
      await this.$grab.delivered({ ref })
      const [bought, delivered] = await Promise.all([
        this.$db.account.deliveries.filter('bought'),
        this.$db.account.deliveries.filter('delivered'),
      ])
      this.$store.commit('account/deliveries/setBought', bought)
      this.$store.commit('account/deliveries/setDelivered', delivered)
      this.deliveredButtonClass = 'card-footer-item'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabDelivered'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    },
    async dispute(ref) {
      this.disputeButtonClass = 'card-footer-item disabled'
      await this.$grab.dispute({ ref })
      const [bought, disputed] = await Promise.all([
        this.$db.account.deliveries.filter('bought'),
        this.$db.account.deliveries.filter('disputed'),
      ])
      this.$store.commit('account/deliveries/setBought', bought)
      this.$store.commit('account/deliveries/setDisputed', disputed)
      this.disputeButtonClass = 'card-footer-item'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabDisputed'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    },
  },
}
</script>
