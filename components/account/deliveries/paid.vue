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
              <img :src="getImage" :alt="'Image of ' + delivery.shop.title"/>
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
              {{ $t('deliveryTo') }} {{ delivery.destination.city }} [{{ delivery.destination.country }}]<br>
              {{ $moment(delivery.delivery.date).fromNow() }} [{{ $utils.momentDate(delivery.delivery.date) }}]
            </div>
            <div class="content">
              {{ $t('paidBy') }} <nuxt-link :to="localePath({ name: 'user-username', params: { username: delivery.buyer.username }})">{{ delivery.buyer.username }}</nuxt-link><br>
              {{ $moment(delivery.paid_at).fromNow() }}
            </div>
          </div>
          <footer class="card-footer">
            <a :href="product.shop.url" target="_blank" class="card-footer-item">Buy on {{ $utils.capitalize(delivery.shop.name) }}</a>
            <nuxt-link :to="{ name: 'account-grab-ref', params: { ref: delivery.ref }}" class="card-footer-item">Chat</nuxt-link>
          </footer>
          <footer class="card-footer">
            <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ order.shop.name }}.{{ order.shop.domain }}</a>
            <a href="#" :class="boughtButtonClass" @click="bought(delivery.ref)">{{ $t('bought') }}</a>
            <a href="#" :class="disputeButtonClass" @click="dispute(delivery.ref)">{{ $t('dispute') }}</a>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesPaid',
  middleware: 'auth',
  props: {
    deliveries: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    boughtButtonClass: 'card-footer-item',
    disputeButtonClass: 'card-footer-item'
  }),
  computed: {
    getImage() {
      return this.delivery.shop.image.replace('https://m.media-amazon.com/images/I/', 'https://res.cloudinary.com/opengrabs/image/upload/h_210/amazon/')
    }
  },
  methods: {
    async bought(ref) {
      this.boughtButtonClass = 'card-footer-item disabled'
      await this.$grab.bought({ ref })
      const [paid, bought] = await Promise.all([
        this.$db.account.deliveries.filter('paid'),
        this.$db.account.deliveries.filter('bought'),
      ])
      this.$store.commit('account/deliveries/setPaid', paid)
      this.$store.commit('account/deliveries/setBought', bought)
      this.boughtButtonClass = 'card-footer-item'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabBought'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    },
    async dispute(ref) {
      this.disputeButtonClass = 'card-footer-item disabled'
      await this.$grab.dispute({ ref })
      const [paid, disputed] = await Promise.all([
        this.$db.account.deliveries.filter('paid'),
        this.$db.account.deliveries.filter('disputed'),
      ])
      this.$store.commit('account/deliveries/setPaid', paid)
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
