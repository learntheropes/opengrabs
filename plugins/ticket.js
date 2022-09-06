export default ({ $axios }, inject) => {
  const tickets = {
    get: async (ref) => {
      const { data } = await $axios.get(`/api/tickets/get/${ref}`)
      return data
    },
    filter: async () => {
      const { data } = await $axios.get(`/api/tickets/filter`)
      return data
    },
    create: async (ticket) => {
      const { data } = await $axios.post('/api/tickets/create', { ticket })
      return data      
    },
    messages: {
      filter: async (ref, width) => {
        const { data } = await $axios.get(`/api/ticket/messages/filter/${ref}/${width}`)
        return data        
      },
      create: async (ref, message) => {
        const { data } = await $axios.post(`/api/ticket/messages/create/${ref}`, { message })
        return data           
      }
    },
    email: {
      create: async (ticket) => {
        const { data } = await $axios.post('/api/tickets/email/create', { ticket })
        return data      
      },
      messages: {
        filter: async (ref) => {
          const { data } = await $axios.get(`/api/ticket/email/messages/filter/${ref}`)
          return data        
        },
        create: async (ref, message) => {
          const { data } = await $axios.post(`/api/ticket/email/messages/create/${ref}`, { message })
          return data           
        }
      },
    }
  }
  inject('tickets', tickets)
}