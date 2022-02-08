export const state = () => ({
    initiated: false
})
  
export const mutations = {
    setInitiated(store, value) {
        store.initiated = value
    }
}