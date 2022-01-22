<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="product of deliveries" :key="product.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <div class="card-image">
            <figure :style="'height: 128px; background-color:grey;'" class="image is-square">
              <img :src="product.amazon.image" :alt="'Image of ' + product.amazon.title" />
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-5">
                  {{ product.amazon.title }}
                </p>
              </div>
            </div>
            <div class="content">
              <p>Product: {{ product.amazon.price.product }} {{ product.amazon.currency }}</p>
              <p>Reward: {{ product.amazon.price.reward }} {{ product.amazon.currency }}</p>
            </div>
            <div class="content has-text-weight-bold">
              {{ product.destination.city }} [{{ product.destination.country }}]
            </div>
          </div>
          <footer class="card-footer">
            <a :href="product.amazon.url" target="_blank" class="card-footer-item">Buy on Amazon</a>
            <nuxt-link :to="{ name: 'account-grab-by-ref', params: { ref: product.ref }}" class="card-footer-item">Chat</nuxt-link>
          </footer>
          <footer class="card-footer">
            <a href="#" class="card-footer-item" @click="bought(product.ref)">Mark as Bought</a>
            <a href="#" class="card-footer-item" @click="dispute(product.ref)">Dispute</a>
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
  methods: {
    async bought(ref) {
      await this.$grab.bought({ ref })
      const [paid, bought] = await Promise.all([
        this.$db.account.deliveries.filter('paid'),
        this.$db.account.deliveries.filter('bought'),
      ])
      this.$store.commit('account/deliveries/setPaid', paid)
      this.$store.commit('account/deliveries/setBought', bought)
    },
    async dispute(ref) {
      await this.$grab.dispute({ ref })
      const [paid, disputed] = await Promise.all([
        this.$db.account.deliveries.filter('paid'),
        this.$db.account.deliveries.filter('disputed'),
      ])
      this.$store.commit('account/deliveries/setPaid', paid)
      this.$store.commit('account/deliveries/setDisputed', disputed)
    },
  },
}
</script>
