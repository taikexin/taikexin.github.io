window.Comic = (() => {
  'use strict'
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let typerTimer = null

  function stopTyper() {
    if (typerTimer) {
      clearInterval(typerTimer)
      typerTimer = null
    }
  }

  function typeInto(node, text, onDone) {
    stopTyper()
    if (reduced) {
      node.textContent = text
      onDone?.()
      return () => {}
    }
    let i = 0
    node.textContent = ''
    typerTimer = setInterval(() => {
      i = Math.min(text.length, i + 2)
      node.textContent = text.slice(0, i)
      if (i >= text.length) {
        stopTyper()
        onDone?.()
      }
    }, 45)
    return () => {
      stopTyper()
      node.textContent = text
      onDone?.()
    }
  }

  function renderNode(stage, el, node, imgSrc, buildChoices) {
    stopTyper()
    const wrap = el('div', 'comic-node')

    const frame = el('div', 'comic-frame')
    if (imgSrc) {
      const img = new Image()
      img.src = imgSrc
      img.alt = ''
      img.className = 'comic-img' + (reduced ? '' : ' kenburns')
      frame.appendChild(img)
    } else {
      frame.classList.add('no-img')
    }

    const caption = el('div', 'comic-caption')
    const captionText = el('p', 'comic-caption-text')
    caption.appendChild(captionText)
    frame.appendChild(caption)
    let skipHintShown = false
    try { skipHintShown = localStorage.getItem('sanguo-tut-skip') === '1' } catch {}
    if (imgSrc && !reduced && !skipHintShown) {
      const hint = el('span', 'skip-hint', '点击画面跳过 ▸')
      frame.appendChild(hint)
      frame.addEventListener('click', () => {
        try { localStorage.setItem('sanguo-tut-skip', '1') } catch {}
        hint.remove()
      }, { once: true })
    }
    wrap.appendChild(frame)

    const after = el('div', 'comic-after')
    wrap.appendChild(after)

    let revealed = false
    const reveal = () => {
      if (revealed) return
      revealed = true
      frame.classList.remove('typing')
      if (node.dialog) {
        const bubble = el('div', 'comic-bubble')
        if (node.speaker) bubble.appendChild(el('span', 'bubble-speaker', node.speaker))
        bubble.appendChild(el('p', null, node.dialog))
        after.appendChild(bubble)
      }
      const choicesHost = el('div', 'comic-choices')
      after.appendChild(choicesHost)
      buildChoices(choicesHost)
    }

    frame.classList.add('typing')
    let skip = typeInto(captionText, node.scene, reveal)
    frame.addEventListener('click', () => skip(), { once: true })
    frame.title = '点击跳过'

    stage.appendChild(wrap)
    return wrap
  }

  return { renderNode, stopTyper }
})()
