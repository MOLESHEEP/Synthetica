const STORAGE_KEY = 'cyberpet_conversations'
const PET_STATE_KEY = 'cyberpet_state'

export const storage = {
  saveConversations(conversations) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (e) {
      console.warn('Storage save failed:', e)
    }
  },

  loadConversations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  },

  savePetState(state) {
    try {
      localStorage.setItem(PET_STATE_KEY, JSON.stringify(state))
    } catch (e) {}
  },

  loadPetState() {
    try {
      const raw = localStorage.getItem(PET_STATE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PET_STATE_KEY)
  },
}