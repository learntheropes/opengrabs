export default ({ $axios }, inject) => {
  const db = {
    account: {
      orders: {
        filter: async (status) => {
          const { data } = await $axios.get(`/api/db/account/orders/${status}`)
          return data
        },
        withdrawn: async (status, withdrawn) => {
          const { data } = await $axios.get(`/api/db/account/orders/${status}/${withdrawn}`)
          return data
        }
      },
      deliveries: {
        filter: async (status) => {
          const { data } = await $axios.get(`/api/db/account/deliveries/${status}`)
          return data
        },
        withdrawn: async (status, withdrawn) => {
          const { data } = await $axios.get(`/api/db/account/deliveries/${status}/${withdrawn}`)
          return data
        }
      },
    },
    grabs: {
      get: async (ref) => {
        const { data } = await $axios.get(`/api/db/grabs/get/${ref}`)
        return data
      }
    },
    orders: {
      filter: async (status) => {
        const { data } = await $axios.get(`/api/db/grabs/filter/order/${status}`)
        return data
      },
    },
    travels: {
      filter: async (status) => {
        const { data } = await $axios.get(`/api/db/grabs/filter/travel/${status}`)
        return data
      },
    },
    messages: {
      filter: async (ref) => {
        const { data } = await $axios.get(`/api/db/messages/filter/grab/${ref}`)
        return data
      },
      create: async ({ props }) => {
        const { data } = await $axios.post(`/api/db/messages/create`, { props })
        return data
      }
    }
  }
  inject('db', db)
}
