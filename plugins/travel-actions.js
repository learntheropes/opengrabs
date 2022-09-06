export default ({ $axios }, inject) => {
  const travel = {
    create: async ({ props }) => {
      const { data } = await $axios.post('/api/travels/actions/create', { props })
      return data
    },
    remove: async (ref) => {
      const { data } = await $axios.post(`/api/travels/actions/remove/${ref}`)
      return data      
    }
  }
  inject('travel', travel)
}