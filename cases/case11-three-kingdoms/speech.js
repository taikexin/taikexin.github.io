window.Speech = (() => {
  'use strict'
  const supported = 'speechSynthesis' in window
  const AUTO_KEY = 'sanguo-auto-speak'
  let voice = null
  let current = null
  let auto = false
  try { auto = localStorage.getItem(AUTO_KEY) === '1' } catch {}

  if (supported) {
    const pick = () => {
      const vs = speechSynthesis.getVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('zh'))
      voice = vs.find((v) => /Tingting|Xiaoxiao|Meijia|Sinji/i.test(v.name)) ?? vs[0] ?? null
    }
    pick()
    speechSynthesis.addEventListener('voiceschanged', pick)
  }

  const ICON = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">'
    + '<path d="M3.5 9.2v5.6h3.6l4.6 3.7V5.5L7.1 9.2H3.5z" fill="currentColor"/>'
    + '<path class="w1" d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8" stroke="currentColor" fill="none" stroke-width="1.7" stroke-linecap="round"/>'
    + '<path class="w2" d="M17.9 7.2a6.8 6.8 0 0 1 0 9.6" stroke="currentColor" fill="none" stroke-width="1.7" stroke-linecap="round"/>'
    + '</svg>'

  function stop() {
    if (!supported) return
    speechSynthesis.cancel()
    if (current) {
      current.classList.remove('speaking')
      current.title = '朗读本段'
      current = null
    }
  }

  function speak(text, btn) {
    if (!supported) return
    stop()
    const u = new SpeechSynthesisUtterance(text)
    if (voice) u.voice = voice
    u.lang = 'zh-CN'
    u.rate = 0.9
    u.onend = u.onerror = () => {
      if (current === btn) {
        btn?.classList.remove('speaking')
        if (btn) btn.title = '朗读本段'
        current = null
      }
    }
    current = btn ?? null
    if (btn) {
      btn.classList.add('speaking')
      btn.title = '停止朗读'
    }
    speechSynthesis.speak(u)
  }

  function attachButton(container, getText, opts) {
    if (!supported) return null
    const btn = document.createElement('button')
    btn.className = 'speak-btn'
    btn.title = '朗读本段'
    btn.setAttribute('aria-label', '朗读本段文字')
    btn.insertAdjacentHTML('afterbegin', ICON)
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (current === btn) stop()
      else speak(getText(), btn)
    })
    container.appendChild(btn)
    if (auto && opts?.auto) {
      setTimeout(() => {
        if (document.contains(btn) && current !== btn) speak(getText(), btn)
      }, opts.delay ?? 180)
    }
    return btn
  }

  function setAuto(v) {
    auto = !!v
    try { localStorage.setItem(AUTO_KEY, auto ? '1' : '0') } catch {}
    if (!auto) stop()
  }

  function renderToggle(container) {
    if (!supported) return null
    const wrap = document.createElement('button')
    wrap.className = 'auto-toggle'
    wrap.setAttribute('role', 'switch')
    const track = document.createElement('span')
    track.className = 'toggle-track'
    const knob = document.createElement('span')
    knob.className = 'toggle-knob'
    track.appendChild(knob)
    const label = document.createElement('span')
    label.className = 'toggle-label'
    label.textContent = '自动朗读'
    wrap.appendChild(track)
    wrap.appendChild(label)
    const sync = () => {
      wrap.classList.toggle('on', auto)
      wrap.setAttribute('aria-checked', String(auto))
      wrap.title = auto ? '自动朗读已开启，点击关闭' : '自动朗读已关闭，点击开启'
    }
    sync()
    wrap.addEventListener('click', () => {
      setAuto(!auto)
      sync()
    })
    container.appendChild(wrap)
    return wrap
  }

  return { supported, stop, speak, attachButton, renderToggle, setAuto, get auto() { return auto } }
})()
