window.Huarong = (() => {
  'use strict'
  const COLS = 4
  const ROWS = 5
  const CELL = 76
  const GAP = 4

  const LAYOUT = [
    { id: 'liu', name: '刘备', r: 0, c: 1, w: 2, h: 2, cls: 'hr-liu' },
    { id: 'zhang', name: '张飞', r: 0, c: 0, w: 1, h: 2, cls: 'hr-zhang' },
    { id: 'guan', name: '关羽', r: 0, c: 3, w: 1, h: 2, cls: 'hr-guan' },
    { id: 'yong', name: '乡勇', r: 3, c: 0, w: 1, h: 2, cls: 'hr-yong' },
    { id: 'b1', name: '黄巾', r: 2, c: 0, w: 1, h: 1, cls: 'hr-bing' },
    { id: 'b2', name: '黄巾', r: 2, c: 3, w: 1, h: 1, cls: 'hr-bing' },
    { id: 'b3', name: '黄巾', r: 3, c: 3, w: 1, h: 1, cls: 'hr-bing' },
    { id: 'b4', name: '黄巾', r: 4, c: 1, w: 1, h: 1, cls: 'hr-bing' },
  ]
  const WIN = { r: 3, c: 1 }
  const DIRS = [
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
    { dr: -1, dc: 0 },
  ]

  function render(container, el, onWin) {
    const blocks = LAYOUT.map((b) => ({ ...b }))
    let moves = 0
    let won = false

    const head = el('div', 'hr-head')
    const movesEl = el('span', 'hr-moves', '步数 0')
    head.appendChild(movesEl)
    const resetBtn = el('button', 'item-btn', '重新摆盘')
    head.appendChild(resetBtn)
    container.appendChild(head)

    const board = el('div', 'hr-board')
    board.style.width = `${COLS * CELL + GAP * 2}px`
    board.style.height = `${ROWS * CELL + GAP * 2}px`
    const exit = el('span', 'hr-exit', '突围出口')
    board.appendChild(exit)
    container.appendChild(board)

    const note = el('p', 'muted hr-note', '点一下方块就会朝能走的方向滑一步，把刘备送到底部出口。')
    container.appendChild(note)

    function occupied(skip) {
      const grid = new Set()
      for (const b of blocks) {
        if (b === skip) continue
        for (let r = b.r; r < b.r + b.h; r++) {
          for (let c = b.c; c < b.c + b.w; c++) grid.add(`${r},${c}`)
        }
      }
      return grid
    }

    function canMove(b, dr, dc) {
      const nr = b.r + dr
      const nc = b.c + dc
      if (nr < 0 || nc < 0 || nr + b.h > ROWS || nc + b.w > COLS) return false
      const grid = occupied(b)
      for (let r = nr; r < nr + b.h; r++) {
        for (let c = nc; c < nc + b.w; c++) {
          if (grid.has(`${r},${c}`)) return false
        }
      }
      return true
    }

    function position(node, b) {
      node.style.width = `${b.w * CELL - GAP * 2}px`
      node.style.height = `${b.h * CELL - GAP * 2}px`
      node.style.transform = `translate(${b.c * CELL + GAP * 2}px, ${b.r * CELL + GAP * 2}px)`
    }

    const nodes = new Map()
    for (const b of blocks) {
      const node = el('button', `hr-block ${b.cls}`)
      node.appendChild(el('span', null, b.name))
      position(node, b)
      node.addEventListener('click', () => {
        if (won) return
        const doMove = (dr, dc) => {
          b.r += dr
          b.c += dc
          b.lastDr = dr
          b.lastDc = dc
          position(node, b)
          moves++
          movesEl.textContent = `步数 ${moves}`
          window.Sfx?.play('slide')
          checkWin(b, node)
        }
        const backward = []
        for (const { dr, dc } of DIRS) {
          if (b.lastDr === -dr && b.lastDc === -dc) {
            backward.push({ dr, dc })
            continue
          }
          if (canMove(b, dr, dc)) { doMove(dr, dc); return }
        }
        for (const { dr, dc } of backward) {
          if (canMove(b, dr, dc)) { doMove(dr, dc); return }
        }
        node.classList.add('shake-no')
        node.addEventListener('animationend', () => node.classList.remove('shake-no'), { once: true })
      })
      nodes.set(b.id, node)
      board.appendChild(node)
    }

    function checkWin(b) {
      if (b.id !== 'liu' || b.r !== WIN.r || b.c !== WIN.c || won) return
      won = true
      const liuNode = nodes.get('liu')
      liuNode.classList.add('hr-escape')
      note.textContent = `突围成功！用了 ${moves} 步。`
      const lore = el('div', 'tip-box')
      lore.appendChild(el('h3', null, '为什么这个玩法叫「华容道」？'))
      lore.appendChild(el('p', null, '第五十回，曹操赤壁大败、败走华容道，关羽念旧义放他一条生路——后人把这段故事做成了滑块棋。等你闯到第五十回，就能亲历真正的华容道了！'))
      container.appendChild(lore)
      setTimeout(() => onWin(moves), 700)
    }

    resetBtn.addEventListener('click', () => {
      if (won) return
      blocks.forEach((b, i) => {
        b.r = LAYOUT[i].r
        b.c = LAYOUT[i].c
        position(nodes.get(b.id), b)
      })
      moves = 0
      movesEl.textContent = '步数 0'
    })
  }

  return { render }
})()
