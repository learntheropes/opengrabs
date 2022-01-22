export default ({ $axios, store }, inject) => {
    const grab = {
        publish: async ({ amazon, destination }) => {
            const data = await $axios.post(`/api/grab/actions/publish`, {
                amazon, destination
            })
            return data
        },
        remove: async ({ ref }) => {
            const data = await $axios.post(`/api/grab/actions/remove/${ref}`)
            return data
        },
        book: async ({ ref, delivery_date }) => {
            const data = await $axios.post(`/api/grab/actions/book/${ref}`, {
                delivery_date
            })
            return data
        },
        dispute: async ({ ref }) => {
            const data = await $axios.post(`/api/grab/actions/dispute/${ref}`)
            return data
        },
        bought: async ({ ref }) => {
            const data = await $axios.post(`/api/grab/actions/bought/${ref}`)
            return data
        },
        delivered: async ({ ref }) => {
            const data = await $axios.post(`/api/grab/actions/delivered/${ref}`)
            return data
        },
        release: async ({ ref }) => {
            const data = await $axios.post(`/api/grab/actions/release/${ref}`)
            return data
        },
        withdraw: async ({ ref, type, address }) => {
            const data = await $axios.post(`/api/grab/actions/withdraw/${ref}`, {
                type, address
            })
            return data
        },
    }
    inject('grab', grab)
}