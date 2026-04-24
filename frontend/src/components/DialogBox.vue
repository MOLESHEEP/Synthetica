<template>
  <transition @enter="onEnter" @leave="onLeave" :css="false">
    <div v-if="store.isDialogOpen" class="dialog-box">
      <!-- 标题栏 -->
      <div class="db-header">
        <div class="db-title">
          <v-icon color="primary" size="16">mdi-message-processing</v-icon>
          <span>实时对话</span>
        </div>
        <div class="db-actions">
          <v-btn icon size="x-small" variant="text" color="success" @click="onSave">
            <v-icon size="16">mdi-content-save</v-icon>
            <v-tooltip activator="parent">保存对话</v-tooltip>
          </v-btn>
          <v-btn icon size="x-small" variant="text" color="error" @click="store.clearCurrentDialog">
            <v-icon size="16">mdi-delete-sweep</v-icon>
            <v-tooltip activator="parent">清空对话</v-tooltip>
          </v-btn>
          <v-btn icon size="x-small" variant="text" @click="store.isDialogOpen = false">
            <v-icon size="16">mdi-chevron-down</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="msgListRef" class="db-messages">
        <transition-group name="msg">
          <div
            v-for="msg in store.currentDialog"
            :key="msg.id"
            class="msg-item"
            :class="msg.petId === 1 ? 'msg-left' : 'msg-right'"
          >
            <div class="msg-avatar" :style="{ background: msg.petColor, boxShadow: `0 0 8px ${msg.petColor}` }">
              {{ msg.petName[0] }}
            </div>
            <div class="msg-bubble" :style="{ '--c': msg.petColor }">
              <div class="msg-name" :style="{ color: msg.petColor }">{{ msg.petName }}</div>
              <div class="msg-text">{{ msg.text }}</div>
              <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>
        </transition-group>

        <!-- 打字指示器 -->
        <transition name="msg">
          <div v-if="store.isTyping" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </transition>

        <!-- 空状态 -->
        <div v-if="!store.currentDialog.length && !store.isTyping" class="db-empty">
          <v-icon color="grey" size="32">mdi-message-outline</v-icon>
          <p>点击下方按钮开始对话</p>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="db-footer">
        <v-btn
          variant="outlined" color="primary" size="small"
          :loading="store.isTyping"
          @click="chat.demoConversation()"
        >
          <v-icon start size="14">mdi-play</v-icon>
          演示对话
        </v-btn>
        <v-btn variant="outlined" color="secondary" size="small" @click="manualInput = true">
          <v-icon start size="14">mdi-pencil</v-icon>
          手动输入
        </v-btn>
      </div>

      <!-- 手动输入区 -->
      <transition name="slide-up">
        <div v-if="manualInput" class="db-manual-input">
          <div class="input-row">
            <v-select
              v-model="selectedPetId"
              :items="petItems"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 100px"
            />
            <v-text-field
              v-model="inputText"
              placeholder="输入消息..."
              density="compact"
              variant="outlined"
              hide-details
              @keyup.enter="sendManual"
            />
            <v-btn icon size="small" color="primary" @click="sendManual">
              <v-icon>mdi-send</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="manualInput = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { usePetStore } from '@/stores/petStore'
import { useChat } from '@/composables/useChat'

const store = usePetStore()
const chat  = useChat()
const msgListRef = ref(null)
const manualInput = ref(false)
const inputText = ref('')
const selectedPetId = ref(1)

const petItems = computed(() => store.pets.map(p => ({ id: p.id, name: p.name })))

watch(() => store.currentDialog.length, async () => {
  await nextTick()
  if (msgListRef.value) {
    msgListRef.value.scrollTop = msgListRef.value.scrollHeight
  }
})

function onEnter(el, done) {
  chat.animateDialogIn(el)
  setTimeout(done, 600)
}
function onLeave(el, done) {
  chat.animateDialogOut(el, done)
}

function onSave() {
  const record = store.saveCurrentConversation()
  if (record) {
    // 可接入 snackbar 通知
  }
}

function sendManual() {
  if (!inputText.value.trim()) return
  store.addMessage(selectedPetId.value, inputText.value.trim())
  inputText.value = ''
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<style scoped>
.dialog-box {
  width: 420px;
  max-width: 95vw;
  background: rgba(7, 7, 26, 0.82);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,245,255,0.05);
}

.db-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px;
  border-bottom: 1px solid rgba(0,245,255,0.1);
  background: rgba(0,245,255,0.03);
}
.db-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Orbitron', monospace;
  font-size: 12px;
  color: #00f5ff;
  letter-spacing: 1px;
}
.db-actions { display: flex; gap: 2px; }

.db-messages {
  height: 260px;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,245,255,0.2) transparent;
}
.db-messages::-webkit-scrollbar { width: 4px; }
.db-messages::-webkit-scrollbar-thumb {
  background: rgba(0,245,255,0.2);
  border-radius: 2px;
}

.db-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  color: rgba(255,255,255,0.25);
  font-size: 12px;
  font-family: 'Share Tech Mono', monospace;
}

.msg-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.msg-right { flex-direction: row-reverse; }

.msg-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #07071a;
}

.msg-bubble {
  max-width: 70%;
  padding: 8px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid color-mix(in srgb, var(--c) 25%, transparent);
  border-radius: 12px;
  position: relative;
}
.msg-right .msg-bubble { border-radius: 12px 4px 12px 12px; }
.msg-left  .msg-bubble { border-radius: 4px 12px 12px 12px; }

.msg-name {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 3px;
}
.msg-text {
  font-size: 13px;
  color: rgba(255,255,255,0.88);
  line-height: 1.5;
  word-break: break-word;
}
.msg-time {
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: rgba(255,255,255,0.25);
  margin-top: 4px;
  text-align: right;
}

.msg-enter-active { transition: all 0.3s ease; }
.msg-enter-from   { opacity: 0; transform: translateY(10px); }

.typing-indicator {
  display: flex; gap: 5px; padding: 8px 12px;
  width: fit-content;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(0,245,255,0.15);
  border-radius: 20px;
}
.typing-indicator span {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #00f5ff;
  animation: bounce-dot 1.2s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.30s; }
@keyframes bounce-dot {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50%       { transform: translateY(-5px); opacity: 1; }
}

.db-footer {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid rgba(0,245,255,0.1);
  background: rgba(0,0,0,0.2);
}

.db-manual-input { padding: 8px 12px 12px; }
.input-row { display: flex; gap: 8px; align-items: center; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>