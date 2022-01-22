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
              <p>
                Product: {{ product.amazon.price.product }}
                {{ product.amazon.currency }}
              </p>
              <p>
                Reward: {{ product.amazon.price.reward }}
                {{ product.amazon.currency }}
              </p>
            </div>
            <div class="content has-text-weight-bold">
              {{ product.destination.city }} [{{ product.destination.country }}]
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DeliveriesWithdrawn',
  middleware: 'auth',
  props: {
    deliveries: {
      type: Array,
      default: () => [],
    },
  },
}
</script>
