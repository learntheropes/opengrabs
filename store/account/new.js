export const state = () => ({
  activeTab: 0
})

export const mutations = {
  setActiveTab(store, value) {
    store.activeTab = value
  }
}