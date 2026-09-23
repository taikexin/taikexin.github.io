window.Battle = (() => {
  'use strict'

  const HEROES = [
    { id: 'zhangfei', name: '张飞', skill: '燕人猛攻', desc: '每次攻击伤害 +3', atkBonus: 3, comboMul: 1, guard: 0 },
    { id: 'guanyu', name: '关羽', skill: '武圣连斩', desc: '连击加成翻倍', atkBonus: 0, comboMul: 2, guard: 0 },
    { id: 'liubei', name: '刘备', skill: '仁德之主', desc: '受到的反击伤害减半', atkBonus: 0, comboMul: 1, guard: 8 },
  ]
  const TACTICS = [
    { id: 'normal', name: '平攻', desc: '中规中矩', atkMul: 1, hurtMul: 1 },
    { id: 'fierce', name: '强攻', desc: '伤害×1.5 受击×1.5', atkMul: 1.5, hurtMul: 1.5 },
    { id: 'guard', name: '稳守', desc: '伤害×0.6 受击减半', atkMul: 0.6, hurtMul: 0.5 },
    { id: 'charge', name: '蓄力', desc: '本题不攻 下题×2', atkMul: 0, hurtMul: 1 },
  ]
  const ENEMY_HIT = 15
  const SOUL_MAX = 3
  const SOUL_STRIKE = 25
  const CRIT_MUL = 1.5

  let bt = null
  let hudUpdate = null
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const safeGet = (k) => { try { return localStorage.getItem(k) } catch { return null } }
  const safeSet = (k, v) => { try { localStorage.setItem(k, v) } catch {} }

  const available = (C) => !!C.quiz?.battle

  function perks(insightCount, canonCount, totalNodes) {
    return { tokens: insightCount, oath: canonCount >= 3, shield: canonCount >= totalNodes }
  }

  function start(C, p) {
    const b = C.quiz.battle
    bt = {
      enemies: b.enemies.map((e) => ({ ...e, left: e.hp })),
      idx: 0,
      moraleMax: b.playerMorale,
      morale: b.playerMorale,
      hero: HEROES[0],
      tactic: TACTICS[0],
      charged: false,
      soul: 0,
      turn: 0,
      tokens: p?.tokens ?? 0,
      oath: !!p?.oath,
      shield: !!p?.shield,
      kills: 0,
      retreats: 0,
      crits: 0,
      soulStrikes: 0,
    }
  }

  function serialize() {
    if (!bt) return null
    return {
      enemies: bt.enemies.map((e) => ({ id: e.id, left: e.left, enrageAnnounced: !!e.enrageAnnounced })),
      idx: bt.idx,
      morale: bt.morale,
      charged: bt.charged,
      soul: bt.soul,
      turn: bt.turn,
      tokens: bt.tokens,
      oath: bt.oath,
      shield: bt.shield,
      kills: bt.kills,
      retreats: bt.retreats,
      crits: bt.crits,
      soulStrikes: bt.soulStrikes,
      heroId: bt.hero.id,
      tacticId: bt.tactic.id,
    }
  }

  function restore(C, data) {
    if (!data) return
    start(C, { tokens: data.tokens, oath: data.oath, shield: data.shield })
    for (const e of bt.enemies) {
      const s = data.enemies?.find((x) => x.id === e.id)
      if (s) {
        e.left = s.left
        e.enrageAnnounced = s.enrageAnnounced
      }
    }
    bt.idx = data.idx ?? 0
    bt.morale = data.morale ?? bt.moraleMax
    bt.charged = !!data.charged
    bt.soul = data.soul ?? 0
    bt.turn = data.turn ?? 0
    bt.kills = data.kills ?? 0
    bt.retreats = data.retreats ?? 0
    bt.crits = data.crits ?? 0
    bt.soulStrikes = data.soulStrikes ?? 0
    bt.hero = HEROES.find((h) => h.id === data.heroId) ?? HEROES[0]
    bt.tactic = TACTICS.find((t) => t.id === data.tacticId) ?? TACTICS[0]
  }

  const currentEnemy = () => bt?.enemies[bt.idx] ?? null
  const isEnraged = (e) => e?.skill?.type === 'enrage' && e.left > 0 && e.left / e.hp <= (e.skill.threshold ?? 0.3)

  function smokeTurn() {
    const e = currentEnemy()
    if (!bt || !e || e.left === 0) return false
    return e.skill?.type === 'shuffle' && bt.turn > 0 && bt.turn % (e.skill.every ?? 3) === 0
  }

  function critEligible(comboBefore, qType) {
    if (!bt || qType === 'open') return false
    const enemy = currentEnemy()
    if (!enemy || enemy.left === 0) return false
    return comboBefore >= 1 || bt.tactic.id === 'fierce'
  }

  function applyTurn(earned, combo, critMul) {
    const ev = []
    if (!bt) return ev
    bt.turn++
    const enemy = currentEnemy()
    if (!enemy || enemy.left === 0) {
      if (earned > 0) ev.push({ type: 'mop', dmg: earned })
      else ev.push({ type: 'mop-miss' })
      return ev
    }
    if (earned > 0) {
      let dmg = earned + (bt.hero?.atkBonus ?? 0)
      if (combo >= 2) dmg += combo * 2 * (bt.hero?.comboMul ?? 1)
      let mul = bt.tactic.atkMul
      if (bt.charged) { mul = 2; bt.charged = false; ev.push({ type: 'unleash' }) }
      else if (bt.tactic.id === 'charge') { bt.charged = true; ev.push({ type: 'charging' }) }
      dmg = Math.round(dmg * mul * (critMul ?? 1))
      if ((critMul ?? 1) > 1) { bt.crits++; ev.push({ type: 'crit' }) }
      if (dmg > 0) {
        enemy.left = Math.max(0, enemy.left - dmg)
        ev.push({ type: 'hit', dmg, enemy: enemy.name })
      }
      if (bt.soul < SOUL_MAX) {
        bt.soul++
        if (bt.soul === SOUL_MAX) ev.push({ type: 'soul-ready' })
      }
      checkDefeat(ev)
    } else if (bt.shield) {
      bt.shield = false
      ev.push({ type: 'shielded' })
    } else {
      let hit = Math.max(3, ENEMY_HIT - (bt.hero?.guard ?? 0))
      hit = Math.round(hit * bt.tactic.hurtMul * (isEnraged(enemy) ? (enemy.skill.mul ?? 1.5) : 1))
      bt.morale = Math.max(0, bt.morale - hit)
      ev.push({ type: 'hurt', dmg: hit, enraged: isEnraged(enemy) })
      if (bt.morale === 0) {
        bt.retreats++
        bt.morale = Math.round(bt.moraleMax / 2)
        ev.push({ type: 'rally', morale: bt.morale })
      }
    }
    const en = currentEnemy()
    if (isEnraged(en) && !en.enrageAnnounced) {
      en.enrageAnnounced = true
      ev.push({ type: 'enrage', name: en.name, skill: en.skill.name })
    }
    return ev
  }

  function checkDefeat(ev) {
    const enemy = currentEnemy()
    if (!enemy || enemy.left > 0) return
    bt.kills++
    ev.push({ type: 'defeat', text: enemy.defeat })
    if (bt.idx < bt.enemies.length - 1) {
      bt.idx++
      const nx = currentEnemy()
      ev.push({ type: 'next', enemy: nx.name, title: nx.title, taunt: nx.taunt })
    } else {
      ev.push({ type: 'victory' })
    }
  }

  function soulStrike() {
    const ev = []
    const enemy = currentEnemy()
    if (!bt || bt.soul < SOUL_MAX || !enemy || enemy.left === 0) return ev
    bt.soul = 0
    bt.soulStrikes++
    enemy.left = Math.max(0, enemy.left - SOUL_STRIKE)
    ev.push({ type: 'soul-strike', dmg: SOUL_STRIKE, enemy: enemy.name })
    checkDefeat(ev)
    hudUpdate?.()
    return ev
  }

  function useOath() {
    if (!bt?.oath || bt.morale >= bt.moraleMax) return false
    bt.oath = false
    bt.morale = Math.min(bt.moraleMax, bt.morale + 30)
    return true
  }

  function useToken(q, root) {
    if (!bt || bt.tokens <= 0 || q.type !== 'single') return false
    const btns = [...root.querySelectorAll('.choice-btn')]
    const cands = []
    q.options.forEach((_, i) => {
      if (String(i) !== q.answer && btns[i] && !btns[i].disabled) cands.push(i)
    })
    if (cands.length <= 1) return false
    const pick = cands[Math.floor(Math.random() * cands.length)]
    btns[pick].disabled = true
    btns[pick].classList.add('ruled-out')
    bt.tokens--
    return true
  }

  function summary() {
    if (!bt) return null
    const all = bt.kills === bt.enemies.length
    const feats = []
    if (bt.crits) feats.push(`会心 ${bt.crits} 次`)
    if (bt.soulStrikes) feats.push(`三英合击 ${bt.soulStrikes} 次`)
    return {
      title: all ? (bt.retreats === 0 ? '首功无双' : '破阵先锋') : '且战且学',
      text: (all
        ? `大兴山全胜！斩敌将 ${bt.kills} 员${bt.retreats ? `，虽有 ${bt.retreats} 次鸣金，终成大功。` : '，士气未溃，漂亮的首战！'}`
        : `斩敌将 ${bt.kills} / ${bt.enemies.length} 员，${currentEnemy()?.name ?? '敌军'}带伤败走。连对越多伤害越高，下次试试一鼓作气！`)
        + (feats.length ? `（${feats.join('，')}）` : ''),
    }
  }

  function reset() { bt = null; hudUpdate = null }

  function renderHeroSelect(stage, el, intro, onPick) {
    const wrap = el('div')
    wrap.appendChild(el('h2', null, '破阵之战'))
    wrap.appendChild(el('p', null, intro))
    const got = []
    if (bt.tokens) got.push(`识人锦囊 ×${bt.tokens}（排除一个错误选项）`)
    if (bt.oath) got.push('桃园誓 ×1（恢复 30 士气）')
    if (bt.shield) got.push('青龙护体 ×1（抵挡一次反击）')
    wrap.appendChild(el('p', 'muted', got.length
      ? `亲历所得锦囊：${got.join('、')}`
      : '此番亲历未得锦囊——多观察人物、多依原著行事，下次开战更有底气。'))
    const grid = el('div', 'hero-grid')
    for (const h of HEROES) {
      const btn = el('button', 'hero-pick')
      btn.appendChild(el('strong', null, h.name))
      btn.appendChild(el('span', 'hero-skill', h.skill))
      btn.appendChild(el('span', 'hero-desc', h.desc))
      btn.addEventListener('click', () => { bt.hero = h; onPick() })
      grid.appendChild(btn)
    }
    wrap.appendChild(grid)
    stage.appendChild(wrap)
  }

  function renderHud(container, el, q, assets) {
    const enemy = currentEnemy()
    if (!bt || !enemy) return
    const mopUp = enemy.left === 0
    const hud = el('div', 'battle-hud')

    const eSide = el('div', 'combatant enemy')
    if (assets?.[enemy.id]) {
      const img = new Image()
      img.src = assets[enemy.id]
      img.alt = enemy.name
      img.className = 'portrait' + (mopUp ? ' defeated' : '')
      eSide.appendChild(img)
    }
    const eInfo = el('div', 'cb-info')
    const eName = el('strong', null, mopUp ? '黄巾残兵 · 四散奔逃' : `${enemy.name} · ${enemy.title}`)
    eInfo.appendChild(eName)
    let eFill = null
    let eNum = null
    if (!mopUp) {
      const eBar = el('div', 'bar enemy-bar')
      eFill = el('span', 'fill')
      eBar.appendChild(eFill)
      eInfo.appendChild(eBar)
      eNum = el('span', 'bar-num', '')
      eInfo.appendChild(eNum)
      if (enemy.skill) eInfo.appendChild(el('span', 'enemy-skill', `技：${enemy.skill.name} — ${enemy.skill.desc}`))
    } else {
      eInfo.appendChild(el('span', 'enemy-skill', '敌将已斩，乘胜清剿，答对仍得功勋'))
    }
    eSide.appendChild(eInfo)

    const pSide = el('div', 'combatant player')
    const pInfo = el('div', 'cb-info')
    pInfo.appendChild(el('strong', null, `${bt.hero.name} · ${bt.hero.skill}`))
    const pBar = el('div', 'bar morale-bar')
    const pFill = el('span', 'fill')
    pBar.appendChild(pFill)
    pInfo.appendChild(pBar)
    const pNum = el('span', 'bar-num', '')
    pInfo.appendChild(pNum)
    const soulRow = el('span', 'soul-row')
    const soulPips = []
    for (let i = 0; i < SOUL_MAX; i++) {
      const pip = el('i', 'soul-pip')
      soulPips.push(pip)
      soulRow.appendChild(pip)
    }
    pInfo.appendChild(soulRow)
    pSide.appendChild(pInfo)

    hud.appendChild(eSide)
    hud.appendChild(el('span', 'vs', mopUp ? '清剿' : '对阵'))
    hud.appendChild(pSide)

    if (!mopUp) {
      const tacticRow = el('div', 'tactic-row')
      tacticRow.appendChild(el('span', 'tactic-label', '战术令'))
      const tacticBtns = []
      for (const t of TACTICS) {
        const b = el('button', `tactic-btn${bt.tactic.id === t.id ? ' active' : ''}`, t.name)
        b.title = t.desc
        b.addEventListener('click', () => {
          if (bt.charged) return
          bt.tactic = t
          for (const x of tacticBtns) x.classList.toggle('active', x === b)
          tacticHint.textContent = t.desc
        })
        tacticBtns.push(b)
        tacticRow.appendChild(b)
      }
      const tacticHint = el('span', 'tactic-hint', bt.charged ? '蓄力完成——本题伤害×2！' : bt.tactic.desc)
      tacticRow.appendChild(tacticHint)
      hud.appendChild(tacticRow)
    }

    const items = el('div', 'battle-items')
    const soulBtn = el('button', 'item-btn soul-btn', `三英合击（${SOUL_STRIKE} 伤害）`)
    soulBtn.hidden = bt.soul < SOUL_MAX || mopUp
    soulBtn.addEventListener('click', () => {
      const ev = soulStrike()
      if (ev.length) {
        const box = el('div', 'soul-events')
        renderEvents(box, el, ev)
        hud.insertAdjacentElement('afterend', box)
        soulBtn.hidden = true
      }
    })
    items.appendChild(soulBtn)
    if (!mopUp && bt.tokens > 0 && q.type === 'single') {
      const b = el('button', 'item-btn', `识人锦囊 ×${bt.tokens} · 排除一个错误选项`)
      b.addEventListener('click', () => {
        if (useToken(q, document)) {
          if (bt.tokens > 0) b.textContent = `识人锦囊 ×${bt.tokens} · 排除一个错误选项`
          else b.remove()
        }
      })
      items.appendChild(b)
    }
    if (!mopUp && bt.oath) {
      const b = el('button', 'item-btn', '桃园誓 · 恢复 30 士气')
      b.addEventListener('click', () => { if (useOath()) { hudUpdate?.(); b.remove() } })
      items.appendChild(b)
    }
    if (!mopUp && bt.shield) items.appendChild(el('span', 'item-passive', '青龙护体 · 待命中'))
    hud.appendChild(items)

    hudUpdate = () => {
      const en = currentEnemy() ?? enemy
      if (eFill) eFill.style.transform = `scaleX(${en.left / en.hp})`
      pFill.style.transform = `scaleX(${bt.morale / bt.moraleMax})`
      if (eNum) eNum.textContent = `${en.left} / ${en.hp}`
      pNum.textContent = `士气 ${bt.morale} / ${bt.moraleMax}`
      soulPips.forEach((p, i) => p.classList.toggle('lit', i < bt.soul))
      soulBtn.hidden = bt.soul < SOUL_MAX || (currentEnemy()?.left ?? 0) === 0
      eName.classList.toggle('enraged', isEnraged(en))
    }
    hudUpdate()
    container.appendChild(hud)

    if (!safeGet('sanguo-tut-battle')) {
      const tut = el('div', 'tut-box')
      tut.appendChild(el('strong', null, '军师教你三招'))
      const ul = el('ul')
      ;[
        '答题前选战术令：有把握用「强攻」，没把握用「稳守」',
        '答对就攒武魂，三格亮起可放「三英合击」',
        '「识人锦囊」能划掉一个错误选项，关键时刻别省着',
      ].forEach((t) => ul.appendChild(el('li', null, t)))
      tut.appendChild(ul)
      const ok = el('button', 'btn ghost tut-ok', '知道了，出战！')
      ok.addEventListener('click', () => { safeSet('sanguo-tut-battle', '1'); tut.remove() })
      tut.appendChild(ok)
      container.appendChild(tut)
    }
  }

  function prepareStem(stemEl) {
    if (!smokeTurn() || reduced || !stemEl) return
    stemEl.classList.add('smokeable', 'smoked')
    const note = document.createElement('p')
    note.className = 'battle-event hurt'
    note.textContent = `${currentEnemy().name}施放「${currentEnemy().skill.name}」——烟尘散去方见题目！`
    stemEl.insertAdjacentElement('beforebegin', note)
    setTimeout(() => stemEl.classList.remove('smoked'), 2600)
  }

  function critPhase(container, el, onDone) {
    if (!bt || reduced) { onDone(1); return }
    const box = el('div', 'crit-box')
    box.appendChild(el('span', 'crit-label', '连势已成！金色区域内出手，会心一击！'))
    const track = el('div', 'crit-track')
    const zone = el('span', 'crit-zone')
    const needle = el('span', 'crit-needle')
    track.appendChild(zone)
    track.appendChild(needle)
    box.appendChild(track)
    container.appendChild(box)

    let raf = null
    const t0 = performance.now()
    const tick = (now) => {
      const pos = (Math.sin((now - t0) / 220) + 1) / 2
      needle.style.transform = `translateX(${pos * track.clientWidth - 2}px)`
      needle.dataset.pos = pos
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const finish = (mul, label) => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      track.removeEventListener('click', onClick)
      box.appendChild(el('span', `crit-result${mul > 1 ? ' ok' : ''}`, label))
      if (mul > 1) window.Sfx?.play('crit')
      setTimeout(() => onDone(mul), 450)
    }
    const onClick = () => {
      const pos = Number(needle.dataset.pos ?? 0)
      if (pos >= 0.4 && pos <= 0.6) finish(CRIT_MUL, '会心一击！伤害 +50%')
      else finish(1, '出手稍偏，普通一击')
    }
    track.addEventListener('click', onClick)
    const timer = setTimeout(() => finish(1, '时机已过，普通一击'), 2400)
  }

  function renderEvents(container, el, events) {
    for (const e of events) {
      const line = el('p', `battle-event ${e.type}`)
      if (e.type === 'hit') line.textContent = `${bt.hero.name}出招——${e.enemy}损兵 ${e.dmg}！`
      else if (e.type === 'mop') line.textContent = `残兵不堪一击——又斩获 ${e.dmg} 功勋！`
      else if (e.type === 'mop-miss') line.textContent = '残兵游勇虚晃一枪，稳住阵脚，看过解析再战。'
      else if (e.type === 'crit') line.textContent = '会心一击，刀光如电！'
      else if (e.type === 'charging') line.textContent = '按兵不动，蓄力已成——下一击伤害翻倍！'
      else if (e.type === 'unleash') line.textContent = '蓄力迸发！'
      else if (e.type === 'soul-ready') line.textContent = '武魂已满——三英合击可以释放了！'
      else if (e.type === 'soul-strike') line.textContent = `桃园武魂迸发，刘关张三英合击——${e.enemy}损兵 ${e.dmg}！`
      else if (e.type === 'defeat') line.textContent = e.text
      else if (e.type === 'next') line.textContent = `${e.title}${e.enemy}拍马杀到：「${e.taunt}」`
      else if (e.type === 'hurt') line.textContent = `敌军反击${e.enraged ? '（狂暴中）' : ''}！士气受挫 -${e.dmg}`
      else if (e.type === 'enrage') line.textContent = `${e.name}已是强弩之末，施放「${e.skill}」困兽犹斗——小心他的反击！`
      else if (e.type === 'shielded') line.textContent = '青龙护体光华一闪，挡下了这次反击！'
      else if (e.type === 'rally') line.textContent = `士气溃散，暂且鸣金收兵……读罢解析重整旗鼓，士气恢复至 ${e.morale}！`
      else if (e.type === 'victory') line.textContent = '敌阵已破——大兴山全胜！'
      container.appendChild(line)
    }
    hudUpdate?.()
    window.BattleFx?.playFx(events)
  }

  return { available, perks, start, applyTurn, summary, reset, renderHeroSelect, renderHud, renderEvents, prepareStem, critPhase, critEligible, serialize, restore }
})()
