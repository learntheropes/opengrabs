export default ({ $axios }, inject) => {
    const reviews = {
      create: async ({ props }) => {
        const { data } = await $axios.post(`/api/db/reviews/create`, { props })
        return data        
      },
      filter: async (username) => {
        const { data } = await $axios.get(`/api/db/reviews/get/${username}`)
        return data
      }
    }
    inject('reviews', reviews)
  }