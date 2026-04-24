<template>
  <div class="arena">
    <!-- 背景网格 -->
    <canvas ref="gridCanvas" class="grid-canvas"></canvas>

    <!-- 扫描线覆盖 -->
    <div class="scanlines"></div>

    <!-- 宠物区域 -->
    <div class="pets-stage">
      <PetEntity :pet="store.pets[0]" />

      <!-- 中央操作区 -->
      <div class="center-panel">
        <div class="hex-decor"></div>
        <v-btn
          fab size="large"
          :color="store.isDialogOpen ? 'error' : 'primary'"
          variant="elevated"
          class="dialog-toggle-btn"
          @click="store.isDialogOpen = !store.isDialogOpen"
        >
          <v-icon>{{ store.isDialogOpen ? 'mdi-message-off' : 'mdi-message-plus' }}</v-icon>
        </v-btn>
        <div class="center-label">{{ store.isDialogOpen ? '关闭对话' : '开启对话' }}</div>
      </div>

      <PetEntity :pet="store.pets[1]" />
    </div>

    <!-- 对话框（居中浮动） -->
    <div class="dialog-anchor">
      <DialogBox />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePetStore } from '@/stores/petStore'
import PetEntity from './PetEntity.vue'
import DialogBox  from './DialogBox.vue'

const store = usePetStore()
const gridCanvas = ref(null)
let animFrame = null

function drawGrid() {
  const canvas = gridCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width  = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const CELL = 40
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.04)'
  ctx.lineWidth   = 1

  for (let x = 0; x <= canvas.width; x += CELL) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  for (let y = 0; y <= canvas.height; y += CELL) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }

  const topGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.3)
  topGrad.addColorStop(0,   'rgba(7,7,26,1)')
  topGrad.addColorStop(1,   'rgba(7,7,26,0)')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3)

  const botGrad = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height)
  botGrad.addColorStop(0,   'rgba(7,7,26,0)')
  botGrad.addColorStop(1,   'rgba(7,7,26,1)')
  ctx.fillStyle = botGrad
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3)
}

onMounted(() => {
  drawGrid()
  window.addEventListener('resize', drawGrid)
})
onUnmounted(() => {
  window.removeEventListener('resize', drawGrid)
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<style scoped>
.arena {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.grid-canvas {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0,0,0,0.04) 3px,
    rgba(0,0,0,0.04) 4px
  );
  pointer-events: none;
  z-index: 1;
}

.pets-stage {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex: 1;
  padding: 0 40px;
}

.center-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.hex-decor {
  position: absolute;
  width: 100px; height: 100px;
  background: rgba(0, 245, 255, 0.03);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  animation: hex-pulse 3s ease-in-out infinite;
  border: 1px solid rgba(0,245,255,0.08);
}
@keyframes hex-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50%       { transform: scale(1.15); opacity: 1; }
}

.dialog-toggle-btn {
  z-index: 1;
  box-shadow: 0 0 24px rgba(0, 245, 255, 0.4) !important;
  transition: box-shadow 0.3s !important;
}
.dialog-toggle-btn:hover {
  box-shadow: 0 0 36px rgba(0, 245, 255, 0.7) !important;
}

.center-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: rgba(0, 245, 255, 0.5);
  letter-spacing: 1px;
}

.dialog-anchor {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
</style>