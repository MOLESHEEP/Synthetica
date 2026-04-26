<template>
  <transition name="pixle-map">
    <div class="pixel-map-wrapper" ref="wrapperRef">

      <!-- 扫描线 -->
      <div class="scanline"></div>

      <!-- 四角装饰 -->
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>

      <!-- 顶栏 -->
      <header class="hud-header">
        <div class="hud-left">
          <span class="hud-title">◈ PIXEL MAP</span>
          <span class="hud-dim">{{ MAP_SIZE }}×{{ MAP_SIZE }} GRID · {{ MAP_SIZE * CELL_SIZE }}×{{ MAP_SIZE * CELL_SIZE }}px</span>
        </div>
        <div class="hud-right">
          <span class="hud-status" ref="statusRef">■ ONLINE</span>
        </div>
      </header>

      <!-- 工具栏 -->
      <div class="toolbar">

        <!-- 图块选择 -->
        <div class="toolbar-group">
          <span class="toolbar-label">BRUSH</span>
          <button
            v-for="tile in tileTypes"
            :key="tile.type"
            class="tool-btn"
            :class="{ active: selectedTile === tile.type }"
            :style="{ '--c': tile.color }"
            @click="selectedTile = tile.type"
          >
            <i class="tile-dot" :style="{ background: tile.color }"></i>
            {{ tile.label }}
          </button>
          <button
            class="tool-btn erase"
            :class="{ active: selectedTile === -1 }"
            @click="selectedTile = -1"
          >
            ✕ ERASE
          </button>
        </div>

        <!-- 分隔线 -->
        <div class="toolbar-sep"></div>

        <!-- 网格开关 -->
        <div class="toolbar-group">
          <span class="toolbar-label">VIEW</span>
          <button
            class="tool-btn grid-btn"
            :class="{ active: showGrid }"
            @click="toggleGrid"
          >
            <span class="grid-icon">⊞</span>
            {{ showGrid ? 'GRID ON' : 'GRID OFF' }}
          </button>
        </div>

      </div>

      <!-- 画布区域 -->
      <div class="canvas-container">
        <canvas
          ref="canvasRef"
          class="pixel-canvas"
          @mousemove="onMouseMove"
          @mousedown="onMouseDown"
          @mouseup="onMouseUp"
          @mouseleave="onMouseLeave"
          @contextmenu.prevent="onRightClick"
        ></canvas>
      </div>

      <!-- 底栏 -->
      <footer class="hud-footer">
        <span>X <b>{{ coords.x }}</b> · Y <b>{{ coords.y }}</b></span>
        <span>BRUSH: <b>{{ currentTileLabel }}</b></span>
        <span>CELL: <b>{{ CELL_SIZE }}×{{ CELL_SIZE }}</b> px</span>
        <span>GRID: <b>{{ showGrid ? 'VISIBLE' : 'HIDDEN' }}</b></span>
      </footer>

    </div>
  </transition>
</template>

  <script setup>
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import gsap from 'gsap'
  import { usePetStore } from '@/stores/petStore'

  const store = usePetStore()

  // ─── 常量 ────────────────────────────────────────────────
  const CELL_SIZE = 64    // 每格固定 64×64 像素
  const MAP_SIZE  = 16    // 16×16 格 → canvas 内部 1024×1024px

  // ─── 图块配置 ──────────────────────────────────────────
  const tileTypes = [
    { type: 0, label: 'EMPTY',  color: '#0d0d1f' },
    { type: 1, label: 'BLOCK',  color: '#00ffff' },
    { type: 2, label: 'WATER',  color: '#1144ff' },
    { type: 3, label: 'ROAD',   color: '#ff00ff' },
    { type: 4, label: 'ZONE',   color: '#ffee00' },
  ]

  const TILE_COLORS = Object.fromEntries(tileTypes.map(t => [t.type, t.color]))

  // ─── 响应式状态 ─────────────────────────────────────────
  const wrapperRef   = ref(null)
  const canvasRef    = ref(null)
  const statusRef    = ref(null)
  const containerRef = ref(null)

  const coords       = ref({ x: 0, y: 0 })
  const hoveredCell  = ref({ x: -1, y: -1 })
  const selectedTile = ref(1)
  const isDragging   = ref(false)
  const showGrid     = ref(true)   // 默认显示网格

  const currentTileLabel = computed(() => {
    if (selectedTile.value === -1) return 'ERASE'
    return tileTypes.find(t => t.type === selectedTile.value)?.label ?? ''
  })

  // ─── 地图数据 ────────────────────────────────────────────
  const mapData = Array.from({ length: MAP_SIZE }, () =>
  //TODO:从api加载地图初始数据
    Array.from({ length: MAP_SIZE }, () => {
      const r = Math.random()
      if (r < 0.55) return 0
      if (r < 0.72) return 1
      if (r < 0.82) return 2
      if (r < 0.95) return 3
      return 4
    })
  )

  // 存放每格的 Image 对象（放置像素画用）
  const cellImages = Array.from({ length: MAP_SIZE }, () =>
    Array(MAP_SIZE).fill(null)
  )

  // ─── 初始化 canvas ──────────────────────────────────────
  // 内部分辨率固定：MAP_SIZE × CELL_SIZE，始终是 64 的整数倍
  function initCanvas() {
    const canvas = canvasRef.value
    canvas.width  = MAP_SIZE * CELL_SIZE  // 1024
    canvas.height = MAP_SIZE * CELL_SIZE  // 1024
    drawMap()
  }

  // ─── 绘制地图 ────────────────────────────────────────────
  function drawMap() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // 禁止平滑，保持像素风格
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 1. 绘制格子（无偏移、无缝隙）
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const px = x * CELL_SIZE
        const py = y * CELL_SIZE

        if (cellImages[y][x]) {
          // 已放置像素画
          ctx.drawImage(cellImages[y][x], px, py, CELL_SIZE, CELL_SIZE)
        } else {
          // 色块占位
          const type = mapData[y][x]
          ctx.shadowBlur  = (type === 1 || type === 4) ? 10 : 0
          ctx.shadowColor = TILE_COLORS[type]
          ctx.fillStyle   = TILE_COLORS[type]
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE)
        }
      }
    }

    // 2. 网格线（覆盖在格子上，可开关）
    if (showGrid.value) {
      ctx.shadowBlur = 0
      for (let i = 0; i <= MAP_SIZE; i++) {
        const pos = i * CELL_SIZE

        // 每 4 格画一条亮一点的线，其余淡一些
        const isMajor = i % 4 === 0
        ctx.strokeStyle = isMajor
          ? 'rgba(0, 255, 255, 0.35)'
          : 'rgba(0, 255, 255, 0.12)'
        ctx.lineWidth = isMajor ? 1 : 0.5

        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, canvas.height)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0,            pos)
        ctx.lineTo(canvas.width, pos)
        ctx.stroke()
      }
    }

    // 3. 悬停高亮（最顶层）
    const hx = hoveredCell.value.x
    const hy = hoveredCell.value.y
    if (hx >= 0 && hx < MAP_SIZE && hy >= 0 && hy < MAP_SIZE) {
      const px = hx * CELL_SIZE
      const py = hy * CELL_SIZE

      // 半透明白色覆盖
      ctx.shadowBlur  = 0
      ctx.fillStyle   = 'rgba(255, 255, 255, 0.10)'
      ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE)

      // 高亮边框
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur  = 20
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.lineWidth   = 2
      ctx.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2)

      // 准星细线
      ctx.shadowBlur  = 0
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
      ctx.lineWidth   = 1
      ctx.setLineDash([3, 5])

      ctx.beginPath()
      ctx.moveTo(0,            py + CELL_SIZE / 2)
      ctx.lineTo(canvas.width, py + CELL_SIZE / 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(px + CELL_SIZE / 2, 0)
      ctx.lineTo(px + CELL_SIZE / 2, canvas.height)
      ctx.stroke()

      ctx.setLineDash([])
    }
  }

  // ─── 坐标换算（CSS缩放 → canvas内部坐标）──────────────
  function getCellFromEvent(e) {
    const canvas = canvasRef.value
    const rect   = canvas.getBoundingClientRect()
    const scale_x = canvas.width  / rect.width
    const scale_y = canvas.height / rect.height
    return {
      x: Math.floor((e.clientX - rect.left) * scale_x / CELL_SIZE),
      y: Math.floor((e.clientY - rect.top)  * scale_y / CELL_SIZE),
    }
  }

  // ─── 格子涂色 ────────────────────────────────────────────
  function paintCell(x, y, type) {
    if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return
    const new_type = type === -1 ? 0 : type
    if (mapData[y][x] === new_type) return
    mapData[y][x] = new_type
    gsap.fromTo(canvasRef.value,
      { filter: 'brightness(1.6)' },
      { filter: 'brightness(1)', duration: 0.1, ease: 'power1.out' }
    )
    drawMap()
  }

  // ─── 网格开关（带 GSAP 过渡）────────────────────────────
  function toggleGrid() {
    showGrid.value = !showGrid.value
    gsap.fromTo(canvasRef.value,
      { filter: 'brightness(1.3)' },
      { filter: 'brightness(1)', duration: 0.2 }
    )
  }

  // ─── 加载像素画到指定格子 ────────────────────────────────
  function loadImageToCell(x, y, src) {
    const img   = new Image()
    img.onload  = () => { cellImages[y][x] = img; drawMap() }
    img.src     = src
  }

  defineExpose({ loadImageToCell, showGrid })

  // ─── Canvas 事件 ─────────────────────────────────────────
  function onMouseMove(e) {
    const { x, y } = getCellFromEvent(e)
    coords.value = { x, y }
    if (hoveredCell.value.x !== x || hoveredCell.value.y !== y) {
      hoveredCell.value = { x, y }
      drawMap()
    }
    if (isDragging.value) paintCell(x, y, selectedTile.value)
  }

  function onMouseDown(e) {
    if (e.button !== 0) return
    isDragging.value = true
    const { x, y } = getCellFromEvent(e)
    paintCell(x, y, selectedTile.value)
  }

  function onMouseUp()    { isDragging.value = false }
  function onMouseLeave() {
    isDragging.value  = false
    hoveredCell.value = { x: -1, y: -1 }
    drawMap()
  }
  function onRightClick(e) {
    const { x, y } = getCellFromEvent(e)
    paintCell(x, y, -1)
  }

  // ─── GSAP 入场 & 环境动画 ─────────────────────────────────
  function initAnimations() {
    // 整体入场
    gsap.from(wrapperRef.value, {
      duration: 0.8,
      opacity: 0,
      y: 20,
      ease: 'power2.out',
    })

    // 扫描线滚动
    gsap.to('.scanline', {
      duration: 4,
      backgroundPositionY: '100%',
      repeat: -1,
      ease: 'none',
    })

    // 状态灯闪烁
    gsap.to(statusRef.value, {
      opacity: 0.25,
      duration: 0.9,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })

    // 四角闪烁
    gsap.to('.corner', {
      opacity: 0.35,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      stagger: 0.25,
      ease: 'sine.inOut',
    })

    // Glitch 随机格子
    setInterval(() => {
      const canvas = canvasRef.value
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const rx  = Math.floor(Math.random() * MAP_SIZE)
      const ry  = Math.floor(Math.random() * MAP_SIZE)
      gsap.to({}, {
        duration: 0.1,
        onStart:    () => { ctx.fillStyle = '#fff'; ctx.fillRect(rx * CELL_SIZE, ry * CELL_SIZE, CELL_SIZE, CELL_SIZE) },
        onComplete: () => drawMap(),
      })
    }, 500)
  }

  // ─── 生命周期 ─────────────────────────────────────────────
  watch(showGrid, () => drawMap())

  onMounted(() => {
    initCanvas()
    initAnimations()
  })
  </script>

  <style scoped>
  /* ── 整体容器 ────────────────────────────────────────── */
  .pixel-map-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: #06060f;
    border: 1px solid rgba(0, 255, 255, 0.25);
    box-shadow:
      0 0 40px rgba(0, 255, 255, 0.08),
      inset 0 0 40px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
  }

  /* ── 扫描线 ──────────────────────────────────────────── */
  .scanline {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent         0px,
      transparent         3px,
      rgba(0,255,255,0.025) 3px,
      rgba(0,255,255,0.025) 4px
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 20;
  }

  /* ── 四角 ────────────────────────────────────────────── */
  .corner {
    position: absolute;
    width: 14px;
    height: 14px;
    border-color: #00ffff;
    border-style: solid;
    z-index: 10;
  }
  .corner-tl { top: 8px;    left: 8px;    border-width: 2px 0 0 2px; }
  .corner-tr { top: 8px;    right: 8px;   border-width: 2px 2px 0 0; }
  .corner-bl { bottom: 8px; left: 8px;    border-width: 0 0 2px 2px; }
  .corner-br { bottom: 8px; right: 8px;   border-width: 0 2px 2px 0; }

  /* ── 顶栏 ────────────────────────────────────────────── */
  .hud-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 20px;
    border-bottom: 1px solid rgba(0, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .hud-left  { display: flex; align-items: baseline; gap: 14px; }
  .hud-right { display: flex; align-items: center; }

  .hud-title {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    font-weight: bold;
    color: #00ffff;
    letter-spacing: 3px;
    text-shadow: 0 0 10px #00ffff;
  }

  .hud-dim {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: rgba(0, 255, 255, 0.4);
    letter-spacing: 1px;
  }

  .hud-status {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #00ff88;
    letter-spacing: 2px;
    text-shadow: 0 0 8px #00ff88;
  }

  /* ── 工具栏 ──────────────────────────────────────────── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 20px;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
    flex-wrap: wrap;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.3);
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .toolbar-label {
    font-family: 'Courier New', monospace;
    font-size: 9px;
    color: rgba(0, 255, 255, 0.35);
    letter-spacing: 2px;
    padding-right: 4px;
  }

  .toolbar-sep {
    width: 1px;
    height: 20px;
    background: rgba(0, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .tool-btn {
    --c: #00ffff;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: transparent;
    border: 1px solid rgba(0, 255, 255, 0.2);
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: rgba(0, 255, 255, 0.5);
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.15s ease;
    outline: none;
  }

  .tool-btn:hover {
    border-color: var(--c);
    color: var(--c);
    background: color-mix(in srgb, var(--c) 10%, transparent);
  }

  .tool-btn.active {
    border-color: var(--c);
    color: var(--c);
    background: color-mix(in srgb, var(--c) 15%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--c) 30%, transparent);
  }

  .tile-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    flex-shrink: 0;
  }

  .tool-btn.erase       { --c: #ff4455; }
  .tool-btn.grid-btn    { --c: #88ffaa; }

  .grid-icon { font-size: 12px; line-height: 1; }

  /* ── 画布容器 ─────────────────────────────────────────── */
  .canvas-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    padding: 12px;
    box-sizing: border-box;
    min-height: 0;
  }

  /* canvas 内部分辨率固定，CSS 等比缩放适应容器 */
  .pixel-canvas {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    cursor: crosshair;
    /* 轻微外发光 */
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.12);
  }

  /* ── 底栏 ────────────────────────────────────────────── */
  .hud-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 20px;
    border-top: 1px solid rgba(255, 0, 255, 0.12);
    background: rgba(0, 0, 0, 0.3);
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: rgba(255, 0, 255, 0.5);
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  .hud-footer b {
    color: rgba(255, 0, 255, 0.85);
  }

  .pixle-map-enter-active, .pixle-map-leave-active {transition: opacity 0.35s ease; }
  .pixle-map-enter-from, .pixle-map-leave-to { opacity: 0; }
  </style>