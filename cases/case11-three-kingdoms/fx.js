window.FX = (() => {
  'use strict'
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function floatScore(anchorEl, text, kind) {
    if (reduced || !anchorEl) return
    const r = anchorEl.getBoundingClientRect()
    const f = document.createElement('div')
    f.className = `fx-float ${kind ?? 'gain'}`
    f.textContent = text
    f.style.left = `${r.left + r.width / 2}px`
    f.style.top = `${r.top}px`
    document.body.appendChild(f)
    f.addEventListener('animationend', () => f.remove())
  }

  function celebrate() {
    window.Sfx?.play('victory')
    if (reduced) return
    const wrap = document.createElement('div')
    wrap.className = 'fx-confetti'
    wrap.setAttribute('aria-hidden', 'true')
    const petalColors = ['#e8a7b8', '#f4c9d4']
    const paperColors = ['#9e2b25', '#a8782a', '#4a6b50']
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('span')
      const isPetal = i % 2 === 0
      p.className = isPetal ? 'petal' : 'paper'
      p.style.background = isPetal ? petalColors[i % petalColors.length] : paperColors[i % paperColors.length]
      p.style.left = `${Math.random() * 100}%`
      p.style.animationDelay = `${Math.random() * 0.9}s`
      p.style.animationDuration = `${2.2 + Math.random() * 1.6}s`
      p.style.setProperty('--drift', `${(Math.random() - 0.5) * 180}px`)
      p.style.setProperty('--spin', `${360 + Math.random() * 540}deg`)
      wrap.appendChild(p)
    }
    document.body.appendChild(wrap)
    setTimeout(() => wrap.remove(), 5000)
  }

  function stamp(container, text) {
    const s = document.createElement('span')
    s.className = 'fx-stamp' + (reduced ? ' instant' : '')
    s.textContent = text
    container.appendChild(s)
    return s
  }

  const COMBO_TEXT = {
    2: '二连贯通！',
    3: '三连如虹！',
    4: '四连破阵！',
    5: '五连夺魁！',
  }
  function comboLabel(n) {
    return COMBO_TEXT[n] ?? (n > 5 ? `${n} 连威震华夏！` : '')
  }

  return { floatScore, celebrate, stamp, comboLabel, reduced }
})()
