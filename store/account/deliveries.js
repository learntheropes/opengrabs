export const state = () => ({
    booked: [],
    paid: [],
    disputed: [],
    refunded: [],
    bought: [],
    delivered: [],
    released: [],
    withdrawn: [],
    activeTab: 0,
    initiated: false
})

export const mutations = {
    setBooked(store, value) {
        store.booked = value
    },
    setPaid(store, value) {
        store.paid = value
    },
    setDisputed(store, value) {
        store.disputed = value
    },
    setRefunded(store, value) {
        store.refunded = value
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
    setWithdrawn(store, value) {
        store.withdrawn = value
    },
    setActiveTab(store, value) {
        store.activeTab = value
    },
    setInitiated(store, value) {
        store.initiated = value
    }
}