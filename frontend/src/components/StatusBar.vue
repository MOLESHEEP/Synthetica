<template>
  <div class="status-bar">
    <!-- 左：系统名 -->
    <div class="sb-brand">
      <span class="glitch-text" data-text="CYBERPET OS">CYBERPET OS</span>
      <span class="sb-version">v1.0.0</span>
    </div>

    <!-- 中：宠物快速状态 -->
    <div class="sb-pets">
      <div
        v-for="pet in store.pets"
        :key="pet.id"
        class="sb-pet-chip"
        :style="{ '--pet-color': pet.color }"
      >
        <span class="chip-dot"></span>
        <span class="chip-name">{{ pet.name }}</span>
        <span class="chip-status">{{ statusLabel(pet.status) }}</span>
      </div>
    </div>

    <!-- 右：时间 + 操作 -->
    <div class="sb-right">
      <span class="sb-time">{{ timeStr }}</span>
      <v-btn
        icon size="small" variant="text" color="primary"
        @click="store.isHistoryOpen = !store.isHistoryOpen"
      >
        <v-icon>mdi-history</v-icon>
        <v-tooltip activator="parent" location="bottom">对话历史</v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePetStore } from '@/stores/petStore'

const store = usePetStore()
const timeStr = computed(() => {
  return store.systemTime.toLocaleTimeString('zh-CN', { hour12: false })
})

const statusMap = {
  idle: '待机',
  talking: '对话中',
  sleeping: '休眠',
  playing: '玩耍',
  excited: '兴奋',
}
function statusLabel(s) { return statusMap[s] ?? s }
</script>

<style scoped>
.status-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  background: rgba(7, 7, 26, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 245, 255, 0.15);
}

.sb-brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.glitch-text {
  font-family: 'Orbitron', monospace;
  font-size: 15px;
  font-weight: 700;
  color: #00f5ff;
  letter-spacing: 3px;
  text-shadow: 0 0 10px rgba(0,245,255,0.8);
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  overflow: hidden;
}
.glitch-text::before {
  color: #ff3b9a;
  clip-path: inset(0 0 60% 0);
  animation: glitch-top 4s infinite linear;
}
.glitch-text::after {
  color: #bf5af2;
  clip-path: inset(60% 0 0 0);
  animation: glitch-bot 4s infinite linear;
}
@keyframes glitch-top {
  0%, 90%, 100% { transform: translate(0); opacity: 0 }
  92% { transform: translate(-3px, -1px); opacity: 1 }
  95% { transform: translate(3px, 1px); opacity: 1 }
  98% { transform: translate(0); opacity: 0 }
}
@keyframes glitch-bot {
  0%, 90%, 100% { transform: translate(0); opacity: 0 }
  93% { transform: translate(3px, 1px); opacity: 1 }
  96% { transform: translate(-3px, -1px); opacity: 1 }
  99% { transform: translate(0); opacity: 0 }
}

.sb-version {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: rgba(0,245,255,0.4);
}

.sb-pets {
  display: flex;
  gap: 16px;
}
.sb-pet-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid color-mix(in srgb, var(--pet-color) 30%, transparent);
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
}
.chip-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--pet-color);
  box-shadow: 0 0 6px var(--pet-color);
  animation: dot-pulse 2s infinite;
}
@keyframes dot-pulse {
  0%, 100% { opacity: 1 }
  50% { opacity: 0.4 }
}
.chip-name { color: var(--pet-color); font-weight: bold; }
.chip-status { color: rgba(255,255,255,0.4); font-size: 10px; }

.sb-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sb-time {
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  color: rgba(0,245,255,0.7);
  letter-spacing: 1px;
}
</style>