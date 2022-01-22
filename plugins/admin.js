export default ({ $axios, store }, inject) => {
    const admin = {
        isAdmin: async () => {
            const { data } = await $axios.get('/api/admin/is-admin')
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
            }
        },
        messages: {
            list: async (ref) => {
                const { data } = await $axios.get(`/api/admin/messages/list/${ref}`)
                return data
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