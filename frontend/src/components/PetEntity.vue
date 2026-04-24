<template>
  <div class="pet-wrapper" :class="`pos-${pet.position}`">
    <!-- 光晕底层 -->
    <div ref="glowRef" class="pet-glow" :style="{ background: `radial-gradient(circle, ${pet.glowColor} 0%, transparent 70%)` }"></div>

    <!-- 球体 -->
    <div
      ref="sphereRef"
      class="pet-sphere"
      :style="sphereStyle"
      @click="onSphereClick"
      @mouseenter="onHover(true)"
      @mouseleave="onHover(false)"
    >
      <!-- 内部高光 -->
      <div class="sphere-highlight"></div>
      <div class="sphere-ring"></div>
      <!-- 状态图标 -->
      <transition name="icon-fade">
        <div v-if="pet.status !== 'idle'" class="status-icon">
          <v-icon :color="pet.color" size="18">{{ statusIcon }}</v-icon>
        </div>
      </transition>
    </div>

    <!-- 宠物信息卡 -->
    <div class="pet-info">
      <div class="pet-name" :style="{ color: pet.color }">{{ pet.name }}</div>
      <div class="pet-level">LV.{{ pet.level }}</div>
    </div>

    <!-- 属性条 -->
    <div class="pet-stats">
      <div class="stat-row">
        <v-icon size="12" :color="pet.color">mdi-heart</v-icon>
        <div class="stat-bar">
          <div class="stat-fill" :style="{ width: pet.health + '%', background: pet.color }"></div>
        </div>
      </div>
      <div class="stat-row">
        <v-icon size="12" color="#ffcc00">mdi-emoticon-happy-outline</v-icon>
        <div class="stat-bar">
          <div class="stat-fill" :style="{ width: pet.happiness + '%', background: '#ffcc00' }"></div>
        </div>
      </div>
      <div class="stat-row">
        <v-icon size="12" color="#39ff14">mdi-lightning-bolt</v-icon>
        <div class="stat-bar">
          <div class="stat-fill" :style="{ width: pet.energy + '%', background: '#39ff14' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePetAnimation } from '@/composables/usePetAnimation'
import { usePetStore } from '@/stores/petStore'

const props = defineProps({
  pet: { type: Object, required: true },
})

const store = usePetStore()
const sphereRef = ref(null)
const glowRef   = ref(null)

const { startIdle, playTalking, playExcited, playSleeping, stopCurrent, enterAnimation } =
  usePetAnimation(sphereRef, glowRef, props.pet.color)

const sphereStyle = computed(() => ({
  background: `
    radial-gradient(circle at 35% 35%,
      color-mix(in srgb, ${props.pet.color} 60%, white) 0%,
      ${props.pet.color} 40%,
      color-mix(in srgb, ${props.pet.color} 40%, #07071a) 100%
    )
  `,
  boxShadow: `
    0 0 20px ${props.pet.glowColor},
    0 0 60px color-mix(in srgb, ${props.pet.color} 30%, transparent),
    inset 0 0 20px rgba(255,255,255,0.08)
  `,
  '--ring-color': props.pet.color,
}))

const statusIcon = computed(() => {
  const m = { talking: 'mdi-message-text', sleeping: 'mdi-sleep', playing: 'mdi-gamepad-variant', excited: 'mdi-star' }
  return m[props.pet.status] ?? ''
})

watch(() => props.pet.status, (s) => {
  if (s === 'talking')  return playTalking()
  if (s === 'sleeping') return playSleeping()
  if (s === 'excited')  return playExcited()
  startIdle()
})

function onSphereClick() {
  store.setPetStatus(props.pet.id, 'excited')
  store.updatePetStats(props.pet.id, { happiness: 5, energy: -2 })
  setTimeout(() => store.setPetStatus(props.pet.id, 'idle'), 1200)
}

function onHover(on) {
  import('gsap').then(({ gsap }) => {
    gsap.to(sphereRef.value, { scale: on ? 1.08 : 1, duration: 0.3, ease: 'power2.out' })
  })
}

onMounted(() => {
  enterAnimation(sphereRef.value)
})
onUnmounted(() => stopCurrent())
</script>

<style scoped>
.pet-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  padding: 20px;
}

.pet-glow {
  position: absolute;
  width: 220px; height: 220px;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0.6;
  filter: blur(20px);
}

.pet-sphere {
  width: 130px; height: 130px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  transition: filter 0.3s;
}
.pet-sphere:hover { filter: brightness(1.2); }

.sphere-highlight {
  position: absolute;
  top: 15%; left: 20%;
  width: 35%; height: 30%;
  background: radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.sphere-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 1.5px solid var(--ring-color, #00f5ff);
  opacity: 0.35;
  animation: ring-rotate 6s linear infinite;
}
@keyframes ring-rotate {
  from { transform: rotate(0deg) scaleX(1) scaleY(0.35); }
  to   { transform: rotate(360deg) scaleX(1) scaleY(0.35); }
}

.status-icon {
  position: absolute;
  top: -8px; right: -8px;
  background: rgba(7,7,26,0.8);
  border-radius: 50%;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
}
.icon-fade-enter-active, .icon-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.icon-fade-enter-from, .icon-fade-leave-to { opacity: 0; transform: scale(0.5); }

.pet-info {
  text-align: center;
  line-height: 1.4;
}
.pet-name {
  font-family: 'Orbitron', monospace;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 0 8px currentColor;
}
.pet-level {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.pet-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 120px;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.stat-bar {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
}
.stat-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
  box-shadow: 0 0 4px currentColor;
}
</style>