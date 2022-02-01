export default ({ $axios }, inject) => {
    const user = {
        create: async(locale) => {
          const { data } = await $axios.post('/api/db/user/create', { locale })
          return data
        },
        update: async (props) => {
          const { data } = await $axios.post('/api/db/user/update/email', { props })
          return data
        },
        verify: async (code) => {
            const { data } = await $axios.post(`/api/db/user/verify/${code}`)
            return data
        },
        updateUsername: async (props) => {
          const { data } = await $axios.post('/api/db/user/update/username', { props })
          return data
        },
    }
    inject('user', user)
  }