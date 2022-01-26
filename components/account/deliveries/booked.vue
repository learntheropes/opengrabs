<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="product of deliveries" :key="product.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <div class="card-image">
            <figure :style="'height: 128px; background-color:grey;'" class="image is-square">
              <img :src="product.shop.image" :alt="'Image of ' + product.shop.title" />
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-5">
                  {{ product.shop.title }}
                </p>
              </div>
            </div>
            <div class="content">
              <p>Product: {{ product.shop.price.product }} {{ product.shop.currency }}</p>
              <p>Reward: {{ product.shop.price.reward }} {{ product.shop.currency }}</p>
            </div>
            <div class="content has-text-weight-bold">
              {{ product.destination.city }} [{{ product.destination.country }}]
            </div>
          </div>
          <footer class="card-footer">
            <nuxt-link :to="{ name: 'account-grab-by-ref', params: { ref: product.ref } }" class="card-footer-item">Chat</nuxt-link>
            <a href="#" class="card-footer-item" @click="dispute(product.ref)">Dispute</a>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesBooked',
  middleware: 'auth',
  props: {
    deliveries: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    async dispute(ref) {
      await this.$grab.dispute({ ref })
      const [booked, disputed] = await Promise.all([
        this.$db.account.deliveries.filter('booked'),
        this.$db.account.deliveries.filter('disputed'),
      ])
      this.$store.commit('account/deliveries/setBooked', booked)
      this.$store.commit('account/deliveries/setDisputed', disputed)
    },
  },
}
</script>
