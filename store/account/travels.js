export const state = () => ({
    actives: [],
    expired: [],
    booked: [],
    activeTab: 0,
    initiated: false
})

export const mutations = {
    setActives(store, value) {
        store.actives = value
    },
    setExpired(store, value) {
        store.expired = value
    },
    setBooked(store, value) {
        store.booked = value
    },
    setActiveTab(store, value) {
        store.activeTab = value
    },
    setInitiated(store, value) {
        store.initiated = value
    }
}