import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'

export const usePetStore = defineStore('pet', () => {
  // ── 宠物数据 ──────────────────────────────────────────
  const pets = ref([
    {
      id: 1,
      name: 'Nova',
      color: '#00f5ff',
      glowColor: 'rgba(0,245,255,0.6)',
      level: 1,
      exp: 0,
      health: 100,
      happiness: 80,
      energy: 90,
      position: 'left',
      status: 'idle',   // idle | talking | sleeping | playing | excited
      personality: '好奇、活泼',
      avatar: null,     // 未来可替换为图片 URL
    },
    {
      id: 2,
      name: 'Vex',
      color: '#bf5af2',
      glowColor: 'rgba(191,90,242,0.6)',
      level: 1,
      exp: 0,
      health: 100,
      happiness: 70,
      energy: 85,
      position: 'right',
      status: 'idle',
      personality: '冷静、神秘',
      avatar: null,
    },
  ])

  // ── 对话数据 ──────────────────────────────────────────
  const currentDialog = ref([])            // 当前进行中的对话
  const savedConversations = ref(         // 历史对话记录
    storage.loadConversations()
  )
  const isDialogOpen = ref(false)
  const isHistoryOpen = ref(false)
  const isTyping = ref(false)             // 打字指示器
  const isMapVisible = ref(true)

  // ── 系统状态 ──────────────────────────────────────────
  const systemTime = ref(new Date())
  setInterval(() => { systemTime.value = new Date() }, 1000)

  // ── 计算属性 ──────────────────────────────────────────
  const petById = computed(() => (id) => pets.value.find(p => p.id === id))
  const totalMessages = computed(() =>
    savedConversations.value.reduce((n, c) => n + c.messages.length, 0)
  )

  // ── Actions ───────────────────────────────────────────
  function addMessage(petId, text, extra = {}) {
    const pet = petById.value(petId)
    if (!pet) return
    currentDialog.value.push({
      id: Date.now() + Math.random(),
      petId,
      petName: pet.name,
      petColor: pet.color,
      text,
      timestamp: new Date().toISOString(),
      ...extra,
    })
  }

  function saveCurrentConversation(title = '') {
    if (!currentDialog.value.length) return
    const record = {
      id: Date.now(),
      title: title || `对话 #${savedConversations.value.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [...currentDialog.value],
    }
    savedConversations.value.unshift(record)
    storage.saveConversations(savedConversations.value)
    return record
  }

  function clearCurrentDialog() {
    currentDialog.value = []
  }

  function deleteConversation(id) {
    savedConversations.value = savedConversations.value.filter(c => c.id !== id)
    storage.saveConversations(savedConversations.value)
  }

  function setPetStatus(petId, status) {
    const pet = petById.value(petId)
    if (pet) pet.status = status
  }

  function updatePetStats(petId, delta = {}) {
    const pet = petById.value(petId)
    if (!pet) return
    Object.keys(delta).forEach(k => {
      if (k in pet) {
        pet[k] = Math.max(0, Math.min(100, pet[k] + delta[k]))
      }
    })
  }

  function renamePet(petId, name) {
    const pet = petById.value(petId)
    if (pet) pet.name = name
  }

  return {
    pets,
    currentDialog,
    savedConversations,
    isDialogOpen,
    isHistoryOpen,
    isTyping,
    isMapVisible,
    systemTime,
    petById,
    totalMessages,
    addMessage,
    saveCurrentConversation,
    clearCurrentDialog,
    deleteConversation,
    setPetStatus,
    updatePetStats,
    renamePet,
  }
})