export const state = () => ({
    actives: [],
    expired: [],
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
    setActiveTab(store, value) {
        store.activeTab = value
    },
    setInitiated(store, value) {
        store.initiated = value
    }
}