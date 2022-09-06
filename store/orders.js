export const state = () => ({
  list: [],
  initiated: false
  })
  
export const mutations = {
  setOrders(store, value) {
    store.list = value
  },
  setInitiated(store, value) {
    store.initiated = value
  }
}