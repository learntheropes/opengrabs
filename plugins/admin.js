export default ({ $axios, store }, inject) => {
  const admin = {
    isAdmin: async () => {
      const { data } = await $axios.get('/api/admin/is-admin')
      return data
    },
    isResolveDispute: async () => {
      const { data } = await $axios.get('/api/admin/is-resolve-dispute')
      return data
    },
    isProcessRefund: async () => {
      const { data } = await $axios.get('/api/admin/is-process-refund')
      return data
    },
    grabs: {
      list: async () => {
        const { data } = await $axios.get('/api/admin/grabs/list')
        return data
      },
      get: async (ref) => {
        const { data } = await $axios.get(`/api/admin/grabs/get/${ref}`)
        return data
      },
      update: async (props) => {
        const { data } = await $axios.post('/admin/disputes/actions/update', { props })
        return data           
      },
      attention: async (ref, hours) => {
        const { data } = await $axios.post('/api/admin/grab/update-attention', {
          ref, hours
        })
        return data        
      }
    },
    messages: {
      filter: async (ref, width) => {
        const { data } = await $axios.get(`/api/admin/messages/list/${ref}/${width}`)
        return data
      }
    },
    tickets: {
      filter: async (status, language) => {
        const { data } = await $axios.get(`/api/admin/tickets/filter/${status}/${language}`)
        return data
      },
      get: async (ref) => {
        const { data } = await $axios.get(`/api/admin/tickets/get/${ref}`)
        return data        
      },
      messages: {
        filter: async (ref, width) => {
          const { data } = await $axios.get(`/api/admin/ticket/messages/filter/${ref}/${width}`)
          return data            
        },
        create: async (ref, message) => {
          const { data } = await $axios.post(`/api/admin/ticket/messages/create/${ref}`, { message })
          return data  
        }
      },
      email: {
        get: async (ref) => {
          const { data } = await $axios.get(`/api/admin/tickets/email/get/${ref}`)
          return data
        },
        filter: async (status, language) => {
          const { data } = await $axios.get(`/api/admin/tickets/email/filter/${status}/${language}`)
          return data
        },
        messages: {
          filter: async (ref, width) => {
            const { data } = await $axios.get(`/api/admin/ticket/email/messages/filter/${ref}/${width}`)
            return data            
          },
          create: async (ref, message) => {
            const { data } = await $axios.post(`/api/admin/ticket/email/messages/create/${ref}`, { message })
            return data  
          }
        },
      }
    },
    disputes: {
      filter: async (status) => {
        const { data } = await $axios.get(`/api/admin/disputes/filter/${status}`)
        return data
      },
      release: async (ref) => {
        const { data } = await $axios.post(`/api/admin/disputes/actions/release/${ref}`)
        return data
      },
      refund: async (ref) => {
        const { data } = await $axios.post(`/api/admin/disputes/actions/refund/${ref}`)
        return data
      }
    }
  }
  inject('admin', admin)
}