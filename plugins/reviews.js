export default ({ $axios }, inject) => {
    const reviews = {
      get: async (username) => {
        const { data } = await $axios.get(`/api/db/reviews/${username}`)
        return data
      }
    }
    inject('reviews', reviews)
  }