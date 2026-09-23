window.BattleFx = (() => {
  'use strict'
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function onceAnim(node, cls) {
    if (!node) return
    node.classList.add(cls)
    node.addEventListener('animationend', () => node.classList.remove(cls), { once: true })
  }

  function ensureLayer(side) {
    let layer = side.querySelector('.slash-layer')
    if (!layer) {
      layer = document.createElement('span')
      layer.className = 'slash-layer'
      side.appendChild(layer)
    }
    return layer
  }

  function slash(side, tone, after = 0) {
    if (!side) return
    setTimeout(() => {
      const s = document.createElement('span')
      s.className = `slash${tone ? ` ${tone}` : ''}`
      ensureLayer(side).appendChild(s)
      onceAnim(side, 'struck')
      window.Sfx?.play(tone === 'gold' ? 'crit' : 'slash')
      setTimeout(() => s.remove(), 400)
    }, after)
  }

  function dmgPop(side, text, big, friendly) {
    if (!side) return
    const d = document.createElement('span')
    d.className = `dmg-pop${big ? ' big' : ''}${friendly ? ' friendly' : ''}`
    d.textContent = text
    side.appendChild(d)
    setTimeout(() => d.remove(), 1100)
  }

  function fallDown(side) {
    if (!side) return
    side.querySelector('.portrait')?.classList.add('defeated')
    const st = document.createElement('span')
    st.className = 'defeat-stamp'
    st.textContent = '败'
    side.appendChild(st)
    window.Sfx?.play('stamp')
  }

  function playFx(events) {
    const hud = document.querySelector('.battle-hud')
    const eSide = hud?.querySelector('.combatant.enemy')
    const pSide = hud?.querySelector('.combatant.player')
    const isCrit = events.some((x) => x.type === 'crit')
    let delay = 80
    for (const e of events) {
      if (e.type === 'hit' || e.type === 'mop') {
        const d = delay
        if (reduced || !hud) { window.Sfx?.play(isCrit ? 'crit' : 'slash') }
        else setTimeout(() => { slash(eSide, isCrit ? 'gold' : ''); dmgPop(eSide, `-${e.dmg}`, isCrit) }, d)
        delay += 720
      } else if (e.type === 'soul-strike') {
        const d = delay
        if (reduced || !hud) { window.Sfx?.play('soul') }
        else setTimeout(() => {
          window.Sfx?.play('soul')
          slash(eSide, 'gold')
          slash(eSide, '', 130)
          slash(eSide, 'gold', 260)
          dmgPop(eSide, `-${e.dmg}`, true)
        }, d)
        delay += 950
      } else if (e.type === 'hurt') {
        const d = delay
        if (reduced || !hud) { window.Sfx?.play('hurt') }
        else setTimeout(() => { window.Sfx?.play('hurt'); onceAnim(pSide, 'struck-back'); dmgPop(pSide, `-${e.dmg}`, false, true) }, d)
        delay += 720
      } else if (e.type === 'defeat') {
        const d = delay
        if (reduced || !hud) { window.Sfx?.play('stamp') }
        else setTimeout(() => fallDown(eSide), d)
        delay += 900
      } else if (e.type === 'victory') {
        const d = delay
        setTimeout(() => window.Sfx?.play('victory'), reduced ? 0 : d)
        delay += 400
      }
    }
  }

  return { playFx, onceAnim }
})()
