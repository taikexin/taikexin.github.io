window.Sfx = (() => {
  'use strict'
  const MUTE_KEY = 'sanguo-muted'
  let ctx = null
  let bus = null
  let muted = false
  try { muted = localStorage.getItem(MUTE_KEY) === '1' } catch {}

  const GONG = 261.63
  const SHANG = 293.66
  const JUE = 329.63
  const ZHI = 392.0
  const YU = 440.0

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -18
      comp.knee.value = 24
      comp.ratio.value = 6
      const master = ctx.createBiquadFilter()
      master.type = 'lowpass'
      master.frequency.value = 5200
      const vol = ctx.createGain()
      vol.gain.value = 0.9
      master.connect(comp).connect(vol).connect(ctx.destination)
      bus = master
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }
  document.addEventListener('click', () => { if (!muted) ensure() }, { capture: true })

  function pluck(freq, start, dur, { gain = 0.14, brightness = 2200, detune = 4 } = {}) {
    const c = ensure()
    if (!c) return
    const t0 = c.currentTime + start
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(brightness, t0)
    lp.frequency.exponentialRampToValueAtTime(Math.max(300, brightness * 0.3), t0 + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008)
    g.gain.setTargetAtTime(0.0001, t0 + 0.02, dur / 4)
    const o1 = c.createOscillator()
    o1.type = 'triangle'
    o1.frequency.value = freq
    o1.detune.value = -detune
    const o2 = c.createOscillator()
    o2.type = 'sine'
    o2.frequency.value = freq * 2
    o2.detune.value = detune
    const g2 = c.createGain()
    g2.gain.value = 0.35
    o1.connect(lp)
    o2.connect(g2).connect(lp)
    lp.connect(g).connect(bus)
    o1.start(t0)
    o2.start(t0)
    o1.stop(t0 + dur + 0.1)
    o2.stop(t0 + dur + 0.1)
  }

  function thump(freq, start, dur, gain = 0.3) {
    const c = ensure()
    if (!c) return
    const t0 = c.currentTime + start
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, t0)
    o.frequency.exponentialRampToValueAtTime(Math.max(35, freq * 0.45), t0 + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(gain, t0 + 0.006)
    g.gain.setTargetAtTime(0.0001, t0 + 0.015, dur / 3.5)
    o.connect(g).connect(bus)
    o.start(t0)
    o.stop(t0 + dur + 0.1)
  }

  function whoosh(start, dur, fromHz, toHz, gain = 0.16, q = 2.2) {
    const c = ensure()
    if (!c) return
    const t0 = c.currentTime + start
    const len = Math.ceil(c.sampleRate * dur)
    const buf = c.createBuffer(1, len, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const env = Math.sin((i / len) * Math.PI)
      data[i] = (Math.random() * 2 - 1) * env
    }
    const src = c.createBufferSource()
    src.buffer = buf
    const filter = c.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = q
    filter.frequency.setValueAtTime(fromHz, t0)
    filter.frequency.exponentialRampToValueAtTime(toHz, t0 + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(gain, t0)
    g.gain.setTargetAtTime(0.0001, t0 + dur * 0.6, dur / 5)
    src.connect(filter).connect(g).connect(bus)
    src.start(t0)
  }

  const FX = {
    correct() {
      pluck(GONG * 2, 0, 0.5, { gain: 0.13 })
      pluck(JUE * 2, 0.09, 0.6, { gain: 0.12 })
    },
    wrong() {
      pluck(SHANG, 0, 0.5, { gain: 0.1, brightness: 900 })
      thump(110, 0.02, 0.3, 0.12)
    },
    slash() {
      whoosh(0, 0.18, 1800, 420, 0.2)
      thump(150, 0.1, 0.16, 0.16)
    },
    crit() {
      whoosh(0, 0.16, 2600, 700, 0.18)
      pluck(ZHI * 2, 0.06, 0.55, { gain: 0.15, brightness: 3200 })
      thump(130, 0.1, 0.2, 0.2)
    },
    soul() {
      whoosh(0, 0.14, 1800, 500, 0.16)
      whoosh(0.13, 0.14, 2200, 600, 0.16)
      whoosh(0.26, 0.18, 2800, 700, 0.2)
      pluck(GONG * 2, 0.4, 0.7, { gain: 0.16 })
      pluck(ZHI * 2, 0.5, 0.7, { gain: 0.13 })
    },
    hurt() {
      thump(90, 0, 0.28, 0.22)
      whoosh(0, 0.1, 500, 180, 0.08, 1.2)
    },
    flip() {
      pluck(YU * 2, 0, 0.18, { gain: 0.08, brightness: 2800 })
    },
    pair() {
      pluck(GONG * 2, 0, 0.4, { gain: 0.12 })
      pluck(YU * 2, 0.07, 0.5, { gain: 0.1 })
    },
    slide() {
      whoosh(0, 0.12, 700, 300, 0.07, 1.4)
    },
    stamp() {
      thump(120, 0, 0.32, 0.3)
      whoosh(0.01, 0.07, 700, 250, 0.1, 1.5)
    },
    victory() {
      ;[GONG, SHANG, JUE, ZHI, YU, GONG * 2].forEach((f, i) => {
        pluck(f * 2, i * 0.12, 0.8, { gain: 0.12 })
      })
    },
  }

  function play(name) {
    if (muted || !FX[name]) return
    try { FX[name]() } catch {}
  }

  function setMuted(v) {
    muted = !!v
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0') } catch {}
  }

  function renderToggle(container) {
    const wrap = document.createElement('button')
    wrap.className = 'auto-toggle sound-toggle'
    wrap.setAttribute('role', 'switch')
    const track = document.createElement('span')
    track.className = 'toggle-track'
    const knob = document.createElement('span')
    knob.className = 'toggle-knob'
    track.appendChild(knob)
    const label = document.createElement('span')
    label.className = 'toggle-label'
    label.textContent = '音效'
    wrap.appendChild(track)
    wrap.appendChild(label)
    const sync = () => {
      wrap.classList.toggle('on', !muted)
      wrap.setAttribute('aria-checked', String(!muted))
      wrap.title = muted ? '音效已关闭，点击开启' : '音效已开启，点击关闭'
    }
    sync()
    wrap.addEventListener('click', () => {
      setMuted(!muted)
      if (!muted) { ensure(); play('correct') }
      sync()
    })
    container.appendChild(wrap)
    return wrap
  }

  return { play, setMuted, renderToggle, get muted() { return muted } }
})()
