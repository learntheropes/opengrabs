<template>
  <div>
    <header class="card-header">
      <p class="card-header-title">{{ travel.origin_country }} - {{  travel.destination_city }}</p>
    </header>
    <div class="card-image card-image-equal-height">
      <figure style="background-color: grey" class="image">
        <img :src="getImage(travel)" :alt="'Image of ' + travel.destination_city" />
      </figure>
    </div>
    <div class="card-content">
      <div class="content">
        {{ $t('travelFrom') }} {{ travel.origin_country }}<br>
        {{ $t('travelTo') }} {{ travel.destination_city}} ({{ travel.destination_country }})<br>
      </div>
      <div class="content">
        {{ $moment(travel.date).fromNow() }} ({{ $moment(travel.date).format('MMMM Do YYYY') }})
      </div>
      <div class="content">
        {{ $t('travelBudget') }} {{ travel.budget.toFixed(0) }} {{ travel.currency }}
      </div>
      <div class="content">
        {{ $t('publishedAt') }} {{ $moment(travel.published_at).fromNow() }} 
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    travle: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    getImage(travel) {
      return travel.destination_photo.replace('https://lh3.googleusercontent.com/places/', '/img/places/tr:h-210/')
    },
  }
}
</script>