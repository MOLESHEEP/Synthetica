<template>
  <transition name="history-slide">
    <div v-if="store.isHistoryOpen" class="history-panel">
      <div class="hp-header">
        <div class="hp-title">
          <v-icon color="secondary" size="16">mdi-history</v-icon>
          <span>对话历史</span>
          <span class="hp-count">{{ store.savedConversations.length }}</span>
        </div>
        <v-btn icon size="x-small" variant="text" @click="store.isHistoryOpen = false">
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="hp-list" v-if="store.savedConversations.length">
        <div
          v-for="conv in store.savedConversations"
          :key="conv.id"
          class="conv-item"
          :class="{ active: activeId === conv.id }"
          @click="toggleExpand(conv.id)"
        >
          <div class="conv-meta">
            <span class="conv-title">{{ conv.title }}</span>
            <span class="conv-info">{{ conv.messages.length }} 条 · {{ formatDate(conv.createdAt) }}</span>
          </div>
          <div class="conv-actions">
            <v-btn icon size="x-small" variant="text" color="error" @click.stop="store.deleteConversation(conv.id)">
              <v-icon size="14">mdi-delete</v-icon>
            </v-btn>
          </div>

          <transition name="expand">
            <div v-if="activeId === conv.id" class="conv-messages">
              <div v-for="msg in conv.messages" :key="msg.id" class="hist-msg">
                <span class="hist-name" :style="{ color: msg.petColor }">{{ msg.petName }}：</span>
                <span class="hist-text">{{ msg.text }}</span>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div v-else class="hp-empty">
        <v-icon color="grey" size="28">mdi-chat-sleep-outline</v-icon>
        <p>暂无保存的对话</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { usePetStore } from '@/stores/petStore'

const store = usePetStore()
const activeId = ref(null)

function toggleExpand(id) {
  activeId.value = activeId.value === id ? null : id
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.history-panel {
  position: fixed;
  top: 52px; right: 0; bottom: 0;
  width: 300px;
  background: rgba(7, 7, 26, 0.9);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(191, 90, 242, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 90;
  box-shadow: -8px 0 32px rgba(0,0,0,0.5);
}

.hp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(191,90,242,0.15);
  background: rgba(191,90,242,0.04);
}
.hp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Orbitron', monospace;
  font-size: 12px;
  color: #bf5af2;
  letter-spacing: 1px;
}
.hp-count {
  background: rgba(191,90,242,0.2);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 10px;
}

.hp-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(191,90,242,0.2) transparent;
}

.conv-item {
  border: 1px solid rgba(191,90,242,0.15);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255,255,255,0.02);
}
.conv-item:hover, .conv-item.active {
  border-color: rgba(191,90,242,0.4);
  background: rgba(191,90,242,0.07);
}

.conv-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.conv-title {
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}
.conv-info {
  font-size: 10px;
  color: rgba(255,255,255,0.3);
}
.conv-actions { float: right; margin-top: -2px; }

.conv-messages {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(191,90,242,0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 180px;
  overflow-y: auto;
}
.hist-msg { font-size: 11px; line-height: 1.5; }
.hist-name { font-family: 'Share Tech Mono', monospace; font-weight: bold; }
.hist-text { color: rgba(255,255,255,0.6); }

.hp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  color: rgba(255,255,255,0.25);
  font-size: 12px;
  font-family: 'Share Tech Mono', monospace;
}

.history-slide-enter-active, .history-slide-leave-active { transition: transform 0.35s ease, opacity 0.35s ease; }
.history-slide-enter-from, .history-slide-leave-to { transform: translateX(100%); opacity: 0; }

.expand-enter-active, .expand-leave-active { transition: all 0.3s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to { max-height: 300px; opacity: 1; }
</style>