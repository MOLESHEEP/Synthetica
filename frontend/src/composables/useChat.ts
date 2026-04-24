import { ref } from 'vue'
import { usePetStore } from '@/stores/petStore'
import { gsap } from 'gsap'

export function useChat() {
  const store = usePetStore()
  const typingText = ref('')

  /**
   * 模拟宠物发言（打字机效果）
   * @param {number} petId
   * @param {string} text
   * @param {number} delay - 开始前延迟 ms
   */
  async function speakAs(petId, text, delay = 0) {
    return new Promise((resolve) => {
      store.setPetStatus(petId, 'talking')
      store.isTyping = true
      setTimeout(() => {
        let i = 0
        typingText.value = ''
        const interval = setInterval(() => {
          typingText.value += text[i]
          i++
          if (i >= text.length) {
            clearInterval(interval)
            store.addMessage(petId, text)
            typingText.value = ''
            store.isTyping = false
            store.setPetStatus(petId, 'idle')
            resolve()
          }
        }, 45)
      }, delay)
    })
  }

  /**
   * 演示：两只宠物互相打招呼
   */
  async function demoConversation() {
    if (!store.isDialogOpen) store.isDialogOpen = true
    await speakAs(1, '嘿，Vex！今天感觉怎么样？', 0)
    await speakAs(2, '还不错，Nova。你准备好迎接新任务了吗？', 800)
    await speakAs(1, '当然！我已经充满能量了！', 800)
    await speakAs(2, '那就出发吧，赛博空间在等着我们。', 800)
  }

  /**
   * 动画弹出对话框
   */
  function animateDialogIn(el) {
    gsap.from(el, {
      y: 60,
      opacity: 0,
      duration: 0.55,
      ease: 'power3.out',
    })
  }

  function animateDialogOut(el, done) {
    gsap.to(el, {
      y: 60,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: done,
    })
  }

  return { typingText, speakAs, demoConversation, animateDialogIn, animateDialogOut }
}