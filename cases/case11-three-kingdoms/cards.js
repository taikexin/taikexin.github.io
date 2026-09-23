window.Cards = (() => {
  'use strict'

  function el(tag, cls, text) {
    const node = document.createElement(tag)
    if (cls) node.className = cls
    if (text !== undefined) node.textContent = text
    return node
  }

  const RARITY_CLS = { 普通: '', 精良: 'rare', 传说: 'legend' }

  function build(card, unlocked, imgSrc, idx) {
    const root = el('div', `card-flip${unlocked ? '' : ' locked'}`)
    root.style.setProperty('--idx', idx ?? 0)
    const rarityCls = RARITY_CLS[card.rarity] ?? ''
    const inner = el('div', 'card-inner')

    const front = el('div', `card-face front card ${rarityCls}`)
    front.appendChild(el('span', 'rarity', unlocked ? card.rarity : `${card.minScore} 分解锁`))
    if (unlocked && imgSrc) {
      const img = new Image()
      img.src = imgSrc
      img.alt = `${card.name}立绘`
      img.className = 'card-img'
      img.loading = 'lazy'
      front.appendChild(img)
    }
    const h = el('h3', null, card.name)
    h.appendChild(el('span', 'courtesy', `字${card.courtesyName}`))
    front.appendChild(h)
    front.appendChild(el('p', 'epithet', card.epithet))
    front.appendChild(el('p', 'muted', unlocked ? `兵器：${card.weapon}` : '再战一回，拿更高功勋解锁这张卡。'))
    if (unlocked) front.appendChild(el('p', 'flip-hint', '点击翻面 · 考点速记'))

    const back = el('div', `card-face back card ${rarityCls}`)
    back.appendChild(el('h3', null, `${card.name} · 考点速记`))
    const ul = el('ul')
    for (const pt of card.examPoints) ul.appendChild(el('li', null, pt))
    back.appendChild(ul)
    back.appendChild(el('p', 'appearance', card.appearance))
    back.appendChild(el('p', 'flip-hint', '点击翻回正面'))

    inner.appendChild(front)
    inner.appendChild(back)
    root.appendChild(inner)

    if (unlocked) {
      root.setAttribute('role', 'button')
      root.tabIndex = 0
      root.setAttribute('aria-label', `${card.name}武将卡，点击翻面查看考点`)
      const flip = () => {
        root.classList.toggle('flipped')
        window.Sfx?.play('flip')
      }
      root.addEventListener('click', flip)
      root.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          flip()
        }
      })
    }
    return root
  }

  return { build }
})()
