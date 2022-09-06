export const state = () => ({
  published: [],
  expired: [],
  booked: [],
  disputed: [],
  refunded: [],
  withdrawn: [],
  underpaid: [],
  paid: [],
  bought: [],
  delivered: [],
  released: [],
  activeTab: 0,
  initiated: false
})

export const mutations = {
  setPublished(store, value) {
    store.published = value
  },
  setExpired(store, value) {
    store.expired = value
  },
  setBooked(store, value) {
    store.booked = value
  },
  setDisputed(store, value) {
    store.disputed = value
  },
  setRefunded(store, value) {
    store.refunded = value
  },
  setWithdrawn(store, value) {
    store.withdrawn = value
  },
  setUnderpaid(store, value) {
    store.underpaid = value
  },
  setPaid(store, value) {
    store.paid = value
  },
  setBought(store, value) {
    store.bought = value
  },
  setDelivered(store, value) {
    store.delivered = value
  },
  setReleased(store, value) {
    store.released = value
  },
  setActiveTab(store, value) {
    store.activeTab = value
  },
  setInitiated(store, value) {
    store.initiated = value
  }
}