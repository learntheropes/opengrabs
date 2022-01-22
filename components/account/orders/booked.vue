<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <div class="card-image">
            <figure :style="'height: 128px; background-color:grey;'" class="image is-square">
              <img :src="order.amazon.image" :alt="'Image of ' + order.amazon.title" />
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-5">
                  {{ order.amazon.title }}
                </p>
              </div>
            </div>
            <div class="content">
              <p>Product: {{ order.amazon.price.product }} {{ order.amazon.currency }}</p>
              <p>Reward: {{ order.amazon.price.reward }} {{ order.amazon.currency }}</p>
            </div>
            <div class="content has-text-weight-bold">
              {{ order.destination.city }} [{{ order.destination.country }}]
            </div>
          </div>
          <footer class="card-footer">
            <nuxt-link :to="{ name: 'account-grab-by-ref', params: { ref: order.ref }}" class="card-footer-item">Chat</nuxt-link>
            <nuxt-link :to="{ name: 'account-pay-by-ref', params: { ref: order.ref }}" class="card-footer-item">Pay</nuxt-link>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'OrdersBooked',
  middleware: 'auth',
  props: {
    orders: {
      type: Array,
      default: () => [],
    },
  }
}
</script>
