<template>
  <div>
    <b-image
      :alt="alt"
      :src="'https://res.cloudinary.com/opengrabs/image/upload/'+src"
      :placeholder="'https://res.cloudinary.com/opengrabs/image/upload/'+src+'?blur=10'"
      @error="onError"
    />
    <pre>{{ error }}</pre>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    }
  },
  data: () => ({
    error: null
  }),
  methods: {
    onError(event, src) {
      this.error = `${src} fails to load`
    }
  }
}
</script>