window.QuizTypes = (() => {
  'use strict'

  function qSingle(q, area, { el }, done) {
    const choices = el('div', 'choices')
    q.options.forEach((opt, i) => {
      const btn = el('button', 'choice-btn', `${'ABCD'[i]}. ${opt}`)
      btn.addEventListener('click', () => {
        for (const b of choices.querySelectorAll('button')) b.disabled = true
        done(String(i) === q.answer ? q.points : 0)
      })
      choices.appendChild(btn)
    })
    area.appendChild(choices)
  }

  function qOrder(q, area, { el }, done) {
    area.appendChild(el('p', 'muted', '点击事件，按先后顺序排好：'))
    const pool = el('div', 'order-pool')
    const picked = el('div', 'order-picked')
    const order = []

    q.options.forEach((opt, i) => {
      const chip = el('button', 'order-chip', opt)
      chip.addEventListener('click', () => {
        if (chip.disabled) return
        chip.disabled = true
        order.push(String(i))
        picked.appendChild(el('span', 'order-chip', `${order.length}. ${opt}`))
        if (order.length === q.options.length) submit.disabled = false
      })
      pool.appendChild(chip)
    })

    const row = el('div', 'btn-row')
    const reset = el('button', 'btn ghost', '重排')
    reset.addEventListener('click', () => {
      order.length = 0
      picked.replaceChildren()
      for (const b of pool.querySelectorAll('button')) b.disabled = false
      submit.disabled = true
    })
    const submit = el('button', 'btn', '就这么排')
    submit.disabled = true
    submit.addEventListener('click', () => {
      reset.disabled = true
      submit.disabled = true
      for (const b of pool.querySelectorAll('button')) b.disabled = true
      done(order.join(',') === q.answer.join(',') ? q.points : 0)
    })
    row.appendChild(reset)
    row.appendChild(submit)
    area.appendChild(pool)
    area.appendChild(picked)
    area.appendChild(row)
  }

  function qMatch(q, area, { el, shuffle }, done) {
    const rights = shuffle(q.pairs.map((p) => p.right))
    const selects = []
    q.pairs.forEach((pair) => {
      const row = el('div', 'match-row')
      row.appendChild(el('span', null, pair.left))
      const sel = el('select', 'match-select')
      sel.appendChild(el('option', null, '请选择'))
      rights.forEach((r) => sel.appendChild(el('option', null, r)))
      selects.push({ sel, want: pair.right })
      row.appendChild(sel)
      area.appendChild(row)
    })
    const row = el('div', 'btn-row')
    const submit = el('button', 'btn', '连好了')
    submit.addEventListener('click', () => {
      if (selects.some(({ sel }) => sel.selectedIndex === 0)) return
      submit.disabled = true
      let hit = 0
      for (const { sel, want } of selects) {
        sel.disabled = true
        if (sel.value === want) hit++
      }
      done(Math.round((q.points * hit) / q.pairs.length))
    })
    row.appendChild(submit)
    area.appendChild(row)
  }

  function qFill(q, area, { el, normalize }, done) {
    const input = el('input', 'fill-input')
    input.placeholder = '把句子补全'
    const row = el('div', 'btn-row')
    const submit = el('button', 'btn', '落笔')
    submit.addEventListener('click', () => {
      if (!input.value.trim()) return
      input.disabled = true
      submit.disabled = true
      done(normalize(input.value) === normalize(q.answer) ? q.points : 0)
    })
    row.appendChild(submit)
    area.appendChild(input)
    area.appendChild(row)
  }

  function qOpen(q, area, { el }, done) {
    const input = el('textarea', 'open-input')
    input.placeholder = '写下你的看法（不少于 15 字），没有标准答案，言之有理就好'
    const row = el('div', 'btn-row')
    const submit = el('button', 'btn', '交卷')
    const hint = el('p', 'muted', '')
    submit.addEventListener('click', () => {
      if (input.value.trim().length < 15) {
        hint.textContent = '再多写两句——观点要有理由支撑才完整。'
        return
      }
      input.disabled = true
      submit.disabled = true
      hint.textContent = ''
      selfReview()
    })
    row.appendChild(submit)
    area.appendChild(input)
    area.appendChild(hint)
    area.appendChild(row)

    function selfReview() {
      area.appendChild(el('div', 'explain', `参考思路：${q.answer}`))
      area.appendChild(el('p', null, '对照参考思路，自评一下你的回答做到了哪几条？'))
      const list = el('ul', 'rubric')
      const boxes = []
      q.openRubric.forEach((r) => {
        const li = el('li')
        const label = el('label')
        const cb = el('input')
        cb.type = 'checkbox'
        boxes.push(cb)
        label.appendChild(cb)
        label.appendChild(document.createTextNode(r))
        li.appendChild(label)
        list.appendChild(li)
      })
      area.appendChild(list)
      const confirmRow = el('div', 'btn-row')
      const confirm = el('button', 'btn', '确认自评')
      confirm.addEventListener('click', () => {
        confirm.disabled = true
        for (const b of boxes) b.disabled = true
        const hit = boxes.filter((b) => b.checked).length
        done(Math.round((q.points * hit) / boxes.length))
      })
      confirmRow.appendChild(confirm)
      area.appendChild(confirmRow)
    }
  }

  const RENDERERS = { single: qSingle, order: qOrder, match: qMatch, fill: qFill, open: qOpen }

  function render(q, area, helpers, done) {
    const fn = RENDERERS[q.type]
    if (fn) fn(q, area, helpers, done)
    else window.Minigames?.render(q, area, helpers, done)
  }

  return { render }
})()
