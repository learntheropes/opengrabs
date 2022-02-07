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
            </div>
            <div class="content">
              {{ $t('expiredAt') }} {{ $moment(order.destination.max_delivery_date).fromNow() }}
            </div>
          </div>
          <footer class="card-footer">
            <a :href="order.shop.url" target="_blank" class="card-footer-item">{{ order.shop.name }}.{{ order.shop.domain }}</a>
            <a href="#" :class="removeButtonClass" @click="remove(order.ref)">{{ $t('remove') }}</a>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import orderBy from 'lodash.orderby'
import filter from 'lodash.filter'
export default {
  name: 'OrdersPublished',
  middleware: 'auth',
  props: {
    porders: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    removeButtonClass: 'card-footer-item'
  }),
  methods: {
    async remove(ref) {
      this.removeButtonClass = 'card-footer-item disabled'
      await this.$grab.remove({ ref })
      const actives = await this.$db.account.orders.filter('published')
      const expired = orderBy(filter(actives,(o) => new Date(o.destination.max_delivery_date) < new Date()),['published_at'])
      this.$store.commit('account/orders/setExpired', expired)
      this.removeButtonClass = 'card-footer-item'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabRemoved'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    },
  },
}
</script>
