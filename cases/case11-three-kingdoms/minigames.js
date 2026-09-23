window.Minigames = (() => {
  'use strict'

  function memory(q, area, { el, shuffle }, done) {
    const cards = []
    q.pairs.forEach((p) => {
      cards.push({ kind: 'L', key: p.right, text: p.left })
      cards.push({ kind: 'R', key: p.right, text: p.right })
    })
    const deck = shuffle(cards)
    const total = q.pairs.length
    let matched = 0
    let mistakes = 0
    let first = null
    let lock = false

    const status = el('p', 'mg-status', `已配 0 / ${total} 对 · 失误 0 次`)
    area.appendChild(status)
    const grid = el('div', 'mg-grid')
    area.appendChild(grid)

    const updateStatus = () => {
      status.textContent = `已配 ${matched} / ${total} 对 · 失误 ${mistakes} 次`
    }

    deck.forEach((data) => {
      const card = el('button', 'mg-card')
      const inner = el('span', 'mg-inner')
      const back = el('span', 'mg-face mg-back', '？')
      const front = el('span', `mg-face mg-front${data.kind === 'R' ? ' mg-hero' : ''}`, data.text)
      inner.appendChild(back)
      inner.appendChild(front)
      card.appendChild(inner)
      card.addEventListener('click', () => {
        if (lock || card.classList.contains('open') || card.classList.contains('done')) return
        card.classList.add('open')
        window.Sfx?.play('flip')
        if (!first) {
          first = { card, data }
          return
        }
        const a = first
        first = null
        const isPair = a.data.key === data.key && a.data.kind !== data.kind
        if (isPair) {
          matched++
          a.card.classList.add('done')
          card.classList.add('done')
          window.Sfx?.play('pair')
          updateStatus()
          if (matched === total) {
            const earned = mistakes <= 2 ? q.points : mistakes <= 5 ? Math.round(q.points * 0.8) : Math.round(q.points * 0.6)
            status.textContent = `全部配对！失误 ${mistakes} 次，记性不错`
            setTimeout(() => done(earned), 650)
          }
        } else {
          mistakes++
          updateStatus()
          lock = true
          a.card.classList.add('shake-no')
          card.classList.add('shake-no')
          setTimeout(() => {
            a.card.classList.remove('open', 'shake-no')
            card.classList.remove('open', 'shake-no')
            lock = false
          }, 900)
        }
      })
      grid.appendChild(card)
    })
  }

  function arrange(q, area, { el, shuffle }, done) {
    const assets = window.CHAPTER?.assets ?? {}
    const ans = q.answer.map(Number)
    const isSolved = (arr) => arr.every((v, i) => v === ans[i])
    let orderIdx = shuffle([...q.options.keys()])
    while (isSolved(orderIdx)) orderIdx = shuffle([...q.options.keys()])

    let firstSel = null
    let attempts = 0
    const strip = el('div', 'mg-strip')
    area.appendChild(strip)
    const hint = el('p', 'muted', '点击第一幅画卷，再点另一幅交换位置；从左到右 = 从先到后')
    area.appendChild(hint)
    const row = el('div', 'btn-row')
    const submit = el('button', 'btn', '就这么排')
    row.appendChild(submit)
    area.appendChild(row)

    function renderStrip(marks) {
      strip.replaceChildren()
      orderIdx.forEach((optIdx, pos) => {
        const card = el('button', 'mg-scene')
        if (marks) card.classList.add(marks[pos] ? 'right' : 'wrong')
        if (firstSel === pos) card.classList.add('selected')
        const imgId = q.images?.[optIdx]
        if (imgId && assets[imgId]) {
          const img = new Image()
          img.src = assets[imgId]
          img.alt = q.options[optIdx]
          card.appendChild(img)
        }
        card.appendChild(el('span', 'mg-scene-no', `${pos + 1}`))
        card.appendChild(el('span', 'mg-scene-label', q.options[optIdx]))
        card.addEventListener('click', () => {
          if (submit.disabled) return
          if (firstSel === null) {
            firstSel = pos
          } else if (firstSel === pos) {
            firstSel = null
          } else {
            const t = orderIdx[firstSel]
            orderIdx[firstSel] = orderIdx[pos]
            orderIdx[pos] = t
            firstSel = null
            window.Sfx?.play('slide')
          }
          renderStrip()
        })
        strip.appendChild(card)
      })
    }
    renderStrip()

    submit.addEventListener('click', () => {
      attempts++
      if (isSolved(orderIdx)) {
        submit.disabled = true
        firstSel = null
        renderStrip(orderIdx.map(() => true))
        const earned = attempts === 1 ? q.points : Math.max(Math.round(q.points * 0.6), q.points - (attempts - 1) * 2)
        done(earned)
      } else {
        const marks = orderIdx.map((v, i) => v === ans[i])
        renderStrip(marks)
        hint.textContent = `绿框位置已排对——只调整红框的画卷再试一次（已尝试 ${attempts} 次）`
        window.Sfx?.play('wrong')
      }
    })
  }

  const RENDERERS = { memory, arrange }

  function render(q, area, helpers, done) {
    const fn = RENDERERS[q.type]
    if (!fn) return false
    fn(q, area, helpers, done)
    return true
  }

  return { render }
})()
