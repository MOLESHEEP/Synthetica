<template>
  <v-app theme="dark">
    <!-- 顶部状态栏 -->
    <v-app-bar flat border>
      <v-app-bar-title>AI 电子宠物实验室</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-chip class="ma-2" color="pink" prepend-icon="mdi-heart">
        心情值: {{ mood }}
      </v-chip>
    </v-app-bar>

    <v-main>
      <v-container fluid class="fill-height">
        <v-row class="fill-height">
          <!-- 左侧：3D 渲染区域 -->
          <v-col cols="12" md="8" class="d-flex flex-column align-center justify-center relative">
            <div ref="canvasRef" style="width: 100%; height: 500px; cursor: pointer;"></div>
            <div class="text-caption text-grey">提示：可以拖拽旋转，点击宠物有惊喜</div>
          </v-col>

          <!-- 右侧：控制面板 -->
          <v-col cols="12" md="4" class="bg-grey-darken-4 d-flex flex-column justify-center px-8">
            <h2 class="text-h4 mb-6">波比 (Bobo)</h2>
            
            <p class="mb-2">饥饿值</p>
            <v-progress-linear v-model="hunger" color="orange" height="10" rounded class="mb-6"></v-progress-linear>

            <v-btn size="x-large" block color="primary" prepend-icon="mdi-food" class="mb-4" @click="feedPet">
              喂食 (GSAP 缩放)
            </v-btn>

            <v-btn size="x-large" block variant="outlined" prepend-icon="mdi-hand-back-point-ribbon" @click="petDialog = true">
              查看宠物状态
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <!-- Vuetify 对话框 -->
      <v-dialog v-model="petDialog" width="400">
        <v-card prepend-icon="mdi-robot-happy" title="宠物状态详情">
          <v-card-text>
            波比现在很开心！它正在学习如何变成一个真正的 WebGL 实体。
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text="关闭" @click="petDialog = false"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

// 响应式状态
const canvasRef = ref(null)
const petDialog = ref(false)
const hunger = ref(60)
const mood = ref(100)

let scene, camera, renderer, sphere, controls

onMounted(() => {
  // 1. 场景初始化
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, canvasRef.value.clientWidth / 500, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(canvasRef.value.clientWidth, 500)
  canvasRef.value.appendChild(renderer.domElement)

  // 2. 创建宠物 (使用更精致的材料)
  const geometry = new THREE.SphereGeometry(1, 64, 64)
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x00E676, 
    roughness: 0.3,
    metalness: 0.2 
  })
  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  // 3. 灯光
  const light = new THREE.DirectionalLight(0xffffff, 1.5)
  light.position.set(2, 2, 5)
  scene.add(light, new THREE.AmbientLight(0xffffff, 0.5))
  camera.position.z = 4

  // 4. 轨道控制 (点击拖动)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 5. GSAP 基础动画：呼吸效果
  gsap.to(sphere.scale, {
    x: 1.1, y: 1.1, z: 1.1,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  })

  // 6. 渲染循环
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // 监听点击事件 (Raycaster)
  canvasRef.value.addEventListener('click', handleCanvasClick)
})

// 喂食逻辑 (GSAP 动画)
const feedPet = () => {
  if (hunger.value < 100) hunger.value += 10
  
  // 宠物跳动效果
  gsap.to(sphere.position, { y: 0.5, duration: 0.2, yoyo: true, repeat: 1 })
  // 颜色闪烁
  gsap.to(sphere.material.color, { r: 1, g: 1, b: 0, duration: 0.2, yoyo: true, repeat: 1 })
}

// 点击宠物逻辑
const handleCanvasClick = (event) => {
  const rect = renderer.domElement.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(sphere)

  if (intersects.length > 0) {
    mood.value += 5
    // 旋转动画
    gsap.to(sphere.rotation, { y: sphere.rotation.y + Math.PI * 2, duration: 1, ease: "back.out" })
  }
}
</script>

<style>
/* 隐藏滚动条，保持简洁 */
body { overflow: hidden; margin: 0; }
canvas { outline: none; }
</style>
