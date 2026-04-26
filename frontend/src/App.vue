<template>
  <v-app class="cyber-app">
    <!-- 背景粒子层 -->
    <div class="bg-particles">
      <div v-for="i in 120" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

    <!-- 状态栏 -->
    <StatusBar />

    <!-- 主体 -->
    <v-main>
      <div v-if="store.isMapVisible" class="main-content">
      <!-- <PetArena /> -->
        <PixleMap />
      </div>
    </v-main>

    <!-- 历史侧边栏 -->
    <ChatHistory />

    <!-- 全局 Snackbar -->
    <v-snackbar v-model="snack.show" :color="snack.color" :timeout="2500" location="bottom center">
      {{ snack.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { reactive } from 'vue'
import StatusBar  from '@/components/StatusBar.vue'
import ChatHistory from '@/components/ChatHistory.vue'
import PixleMap from '@/components/PixleMap.vue'
import { usePetStore } from '@/stores/petStore'

const store = usePetStore()

const snack = reactive({ show: false, text: '', color: 'success' })

function notify(text, color = 'success') {
  snack.text  = text
  snack.color = color
  snack.show  = true
}

function particleStyle(i) {
  const size  = Math.random() * 3 + 1
  const delay = (i * 0.37) % 8
  const dur   = 8 + (i % 5) * 2
  const x     = (i * 5.1) % 100
  const color = i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#bf5af2' : '#ff3b9a'
  return {
    width:  size + 'px',
    height: size + 'px',
    left:   x + '%',
    bottom: '-10px',
    background: color,
    boxShadow: `0 0 ${size * 3}px ${color}`,
    animationDuration: dur + 's',
    animationDelay:    delay + 's',
  }
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0; padding: 0;
  background: #07071a;
  color: #e0e0e0;
  overflow: hidden;
  height: 100%;
}

.cyber-app {
  background: #07071a !important;
  font-family: 'Share Tech Mono', monospace;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  padding-top: 15px !important;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.bg-particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  animation: float-up linear infinite;
  opacity: 0;
}
@keyframes float-up {
  0%   { transform: translateY(0)     scale(1);   opacity: 0; }
  10%  { opacity: 0.8; }
  90%  { opacity: 0.4; }
  100% { transform: translateY(-105vh) scale(0.3); opacity: 0; }
}

.v-btn {
  font-family: 'Share Tech Mono', monospace !important;
  letter-spacing: 1px !important;
}
.v-overlay__content { font-family: 'Share Tech Mono', monospace; }
</style>
