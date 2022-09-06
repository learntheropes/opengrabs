export default ({ $axios }, inject) => {
  const feedback = {
    create: async ({ props }) => {
    const { data } = await $axios.post(`/api/db/feedback/create`, { props })
    return data    
    },
    filter: async (username) => {
    const { data } = await $axios.get(`/api/db/feedback/get/${username}`)
    return data
    }
  }
  inject('feedback', feedback)
  }