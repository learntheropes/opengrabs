export default ({ $axios }, inject) => {
    const travel = {
        create: async ({ props }) => {
            const { data } = await $axios.post('/api/travels/create', { props })
            return data
        },        
    }
    inject('travel', travel)
}