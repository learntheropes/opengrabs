<template>
  <section class="section">
    <div class="columns is-multiline">
      <div v-for="order of orders" :key="order.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
        <div class="card card-equal-height">
          <div class="card-image">
            <figure :style="'height: 128px; background-color:grey;'" class="image is-square">
              <img :src="order.shop.image" :alt="'Image of '+ order.shop.title">
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-5">
                {{order.shop.title}}
                </p>
              </div>
            </div>
              <div class="content">
                <p>Product: {{order.shop.price.product}} {{order.shop.currency}}</p>
                <p>Reward: {{order.shop.price.reward}} {{order.shop.currency}}</p>
              </div>
              <div class="content has-text-weight-bold">
                {{order.destination.city}} [{{order.destination.country}}]
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
