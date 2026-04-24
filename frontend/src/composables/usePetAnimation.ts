import { gsap } from 'gsap'

/**
 * 为单个宠物球体注入 GSAP 动画
 * @param {Ref<HTMLElement>} sphereRef - 球体 DOM ref
 * @param {Ref<HTMLElement>} glowRef  - 光晕 DOM ref
 * @param {string} color             - 宠物主色
 */
export function usePetAnimation(sphereRef, glowRef, color) {
  let idleTl = null
  let currentAnim = null

  function startIdle() {
    stopCurrent()
    idleTl = gsap.timeline({ repeat: -1, yoyo: true })
    idleTl
      .to(sphereRef.value, {
        y: -18,
        duration: 2.2,
        ease: 'sine.inOut',
      })
      .to(glowRef.value, {
        opacity: 0.5,
        scale: 1.15,
        duration: 2.2,
        ease: 'sine.inOut',
      }, '<')
  }

  function playTalking() {
    stopCurrent()
    currentAnim = gsap.timeline({ repeat: -1 })
    currentAnim
      .to(sphereRef.value, { y: -10, scale: 1.08, duration: 0.18, ease: 'power2.out' })
      .to(sphereRef.value, { y: 0,   scale: 1.0,  duration: 0.18, ease: 'power2.in' })
      .to(glowRef.value,   { opacity: 1, scale: 1.3, duration: 0.18 }, '<')
      .to(glowRef.value,   { opacity: 0.6, scale: 1.0, duration: 0.18 }, '>')
  }

  function playExcited() {
    stopCurrent()
    currentAnim = gsap.timeline({ onComplete: startIdle })
    currentAnim.to(sphereRef.value, {
      keyframes: [
        { y: -25, scale: 1.15, duration: 0.15 },
        { y: 5,   scale: 0.95, duration: 0.12 },
        { y: -15, scale: 1.10, duration: 0.12 },
        { y: 0,   scale: 1.0,  duration: 0.12 },
      ],
      ease: 'power2.inOut',
    })
    gsap.to(glowRef.value, { opacity: 1, scale: 1.5, duration: 0.3, yoyo: true, repeat: 3 })
  }

  function playSleeping() {
    stopCurrent()
    currentAnim = gsap.timeline({ repeat: -1, yoyo: true })
    currentAnim.to(sphereRef.value, { y: -5, scale: 0.97, opacity: 0.7, duration: 3, ease: 'sine.inOut' })
    gsap.to(glowRef.value, { opacity: 0.2, scale: 0.8, duration: 2 })
  }

  function stopCurrent() {
    idleTl?.kill()
    currentAnim?.kill()
    if (sphereRef.value) {
      gsap.killTweensOf(sphereRef.value)
      gsap.set(sphereRef.value, { clearProps: 'all' })
    }
    if (glowRef.value) {
      gsap.killTweensOf(glowRef.value)
      gsap.set(glowRef.value, { clearProps: 'all' })
    }
  }

  function enterAnimation(el) {
    gsap.from(el, {
      scale: 0,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.5)',
      onComplete: startIdle,
    })
  }

  return { startIdle, playTalking, playExcited, playSleeping, stopCurrent, enterAnimation }
}