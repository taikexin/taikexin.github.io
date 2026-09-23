(() => {
  'use strict'

  const C = window.CHAPTER
  if (!C) {
    document.getElementById('stage').textContent = '未找到章节数据：请先运行 node scripts/build-data.mjs 001 生成 prototype/data.js'
    return
  }

  const stage = document.getElementById('stage')
  const chapterLabel = document.getElementById('chapter-label')
  const stepsEl = document.getElementById('steps')
  const scorePill = document.getElementById('score-pill')
  const insightPill = document.getElementById('insight-pill')

  const STEPS = [
    { screen: 'story', label: '说书', hint: '听故事开场' },
    { screen: 'play', label: '亲历', hint: '进入亲历故事' },
    { screen: 'quiz', label: '闯关', hint: '直接开始闯关' },
    { screen: 'rewards', label: '战利品', hint: '浏览本回战利品' },
    { screen: 'cliff', label: '下回', hint: '查看下回预告' },
  ]
  const SCREEN_STEP = { story: 0, play: 1, quiz: 2, rewards: 3, cliff: 4 }

  const state = {
    screen: 'cover',
    sectionIdx: 0,
    nodeId: C.interactive.startNode,
    roleIntroStep: 0,
    roleReady: false,
    insights: [],
    quizIdx: 0,
    score: 0,
    combo: 0,
    canonCount: 0,
    battleOn: false,
    huarongDone: false,
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag)
    if (cls) node.className = cls
    if (text !== undefined) node.textContent = text
    return node
  }

  function shuffle(arr) {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  function normalize(s) {
    return (s ?? '').replace(/[\s。．，、！？!?.,；;：:""''「」]/g, '')
  }

  function setSteps() {
    stepsEl.replaceChildren()
    const active = SCREEN_STEP[state.screen]
    STEPS.forEach((step, i) => {
      const li = el('li')
      const button = el('button', 'step-btn', step.label)
      button.type = 'button'
      button.title = step.hint
      button.setAttribute('aria-label', step.hint)
      if (i === active) {
        button.classList.add('active')
        button.setAttribute('aria-current', 'step')
      }
      button.addEventListener('click', () => {
        if (step.screen === 'play') enterPlay()
        else go(step.screen)
      })
      li.appendChild(button)
      stepsEl.appendChild(li)
    })
  }

  function updatePills() {
    scorePill.hidden = state.score === 0
    scorePill.textContent = `功勋 ${state.score} 分`
    insightPill.hidden = state.insights.length === 0
    insightPill.textContent = `识人录 ×${state.insights.length}`
  }

  function go(screen) {
    state.screen = screen
    render()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function enterPlay() {
    state.roleIntroStep = 0
    state.roleReady = false
    state.nodeId = C.interactive.startNode
    go('play')
  }

  function render() {
    window.Speech?.stop()
    window.Comic?.stopTyper()
    setSteps()
    updatePills()
    stage.replaceChildren()
    const views = {
      cover: renderCover,
      story: renderStory,
      play: renderPlay,
      quiz: renderQuiz,
      rewards: renderRewards,
      cliff: renderCliff,
    }
    views[state.screen]()
    if (state.screen !== 'cover') {
      window.Save?.persist(C.meta.id, state, window.Battle?.serialize?.())
    }
  }

  function resetState() {
    state.screen = 'cover'
    state.sectionIdx = 0
    state.nodeId = C.interactive.startNode
    state.roleIntroStep = 0
    state.roleReady = false
    state.insights = []
    state.quizIdx = 0
    state.score = 0
    state.combo = 0
    state.canonCount = 0
    state.battleOn = false
    state.huarongDone = false
    window.Battle?.reset()
  }

  function renderCover() {
    const wrap = el('div')
    wrap.appendChild(el('span', 'vol-tag', C.meta.volume))
    wrap.appendChild(el('h1', null, `第${['零','一','二','三','四','五','六','七','八','九','十'][C.meta.chapterNo] ?? C.meta.chapterNo}回`))
    wrap.appendChild(el('h2', null, C.meta.title))
    wrap.appendChild(el('p', null, C.interactive.intro))
    wrap.appendChild(el('p', 'muted', `预计 ${C.meta.estimatedMinutes} 分钟 · 考点：${C.meta.examTags.join(' / ')}`))

    const quickEntry = el('section', 'quick-entry')
    quickEntry.setAttribute('aria-labelledby', 'quick-entry-title')
    const quickEntryTitle = el('h3', null, '自主选择学习环节')
    quickEntryTitle.id = 'quick-entry-title'
    quickEntry.appendChild(quickEntryTitle)
    quickEntry.appendChild(el('p', 'muted', '可以从任意环节开始，想听故事、亲历情境或直接闯关都可以。'))
    const quickRow = el('div', 'btn-row quick-entry-actions')
    STEPS.forEach((step) => {
      const button = el('button', 'btn ghost', step.hint)
      button.addEventListener('click', () => {
        if (step.screen === 'play') enterPlay()
        else go(step.screen)
      })
      quickRow.appendChild(button)
    })
    quickEntry.appendChild(quickRow)
    wrap.appendChild(quickEntry)

    const saved = window.Save?.load(C.meta.id)
    const row = el('div', 'btn-row')
    if (saved) {
      wrap.appendChild(el('p', 'save-note', window.Save.describe(saved)))
      const resume = el('button', 'btn', '继 续')
      resume.addEventListener('click', () => {
        Object.assign(state, saved.state)
        if (state.battleOn && saved.battle) window.Battle?.restore(C, saved.battle)
        render()
      })
      const restart = el('button', 'btn ghost', '从头开始')
      restart.addEventListener('click', () => {
        window.Save?.clear(C.meta.id)
        resetState()
        render()
      })
      row.appendChild(resume)
      row.appendChild(restart)
    } else {
      const start = el('button', 'btn', '听故事开场')
      start.addEventListener('click', () => go('story'))
      row.appendChild(start)
    }
    wrap.appendChild(row)
    stage.appendChild(wrap)
  }

  function renderStory() {
    const s = C.storytelling.sections[state.sectionIdx]
    const wrap = el('div')
    const heading = el('div', 'section-heading')
    heading.appendChild(el('span', 'no', `${state.sectionIdx + 1} / ${C.storytelling.sections.length}`))
    heading.appendChild(el('h2', null, s.heading))
    window.Speech?.attachButton(heading, () => s.text + (s.quote ? `。${s.quote}` : ''), { auto: true })
    wrap.appendChild(heading)
    if (C.assets?.[s.id]) {
      const img = new Image()
      img.src = C.assets[s.id]
      img.alt = s.heading
      img.className = 'story-img'
      wrap.appendChild(img)
    }
    wrap.appendChild(el('p', null, s.text))
    if (s.quote) wrap.appendChild(el('blockquote', 'quote', s.quote))

    const row = el('div', 'btn-row')
    if (state.sectionIdx > 0) {
      const prev = el('button', 'btn ghost', '上一段')
      prev.addEventListener('click', () => { state.sectionIdx--; render() })
      row.appendChild(prev)
    }
    const isLast = state.sectionIdx === C.storytelling.sections.length - 1
    const next = el('button', 'btn', isLast ? '亲历这段历史' : '接着说')
    next.addEventListener('click', () => {
      if (isLast) enterPlay()
      else { state.sectionIdx++; render() }
    })
    row.appendChild(next)
    wrap.appendChild(row)
    stage.appendChild(wrap)
  }

  function renderPlay() {
    if (!state.roleReady) {
      renderRoleIntro()
      return
    }
    renderNode()
  }

  function renderRoleIntro() {
    const phases = [
      {
        eyebrow: '身份牌 · 第一步',
        title: '你是张飞家的少年小伙计',
        body: '你在张飞家经营的张飞庄帮着送酒、记账、跑腿。东家张飞见你机灵，又能识几个字，常叫你“小军师”。',
        focus: '今天，东家要你抱两坛好酒，送到涿县街上的酒肆。',
        chips: ['东家：张飞', '本事：识字机灵', '随身：两坛好酒'],
        action: '领下小伙计木牌',
      },
      {
        eyebrow: '差事单 · 第二步',
        title: '抱稳酒坛，去涿县送酒',
        body: '街上贴出了太守刘焉的招军榜。你本只是来送酒，却听见人群里有人长叹。',
        focus: '先看清人、再听清话。今天这趟差事，可能会把你带进一件大事里。',
        chips: ['目的地：涿县街头', '要紧事：送酒', '小提醒：先观察'],
        action: '抱好酒坛，出发',
      },
      {
        eyebrow: '入场 · 第三步',
        title: '一脚踏进三国故事',
        body: '春风吹动张飞庄后的桃花，也吹向喧闹的涿县街。你抱着酒坛穿过人群，刘备正望着榜文长叹。',
        focus: '从这一刻起，你的选择会让故事往前走。',
        chips: ['你的身份：小伙计', '第一站：招军榜前', '准备：开始选择'],
        action: '以小伙计身份出发',
      },
    ]
    const step = Math.max(0, Math.min(phases.length - 1, state.roleIntroStep || 0))
    const phase = phases[step]
    const wrap = el('section', 'role-intro')
    wrap.setAttribute('aria-labelledby', 'role-title')

    const stageVisual = el('div', 'role-stage')
    const sceneCopy = el('div', 'role-stage-copy')
    sceneCopy.appendChild(el('span', 'role-location', '张飞庄 · 涿郡'))
    sceneCopy.appendChild(el('p', 'role-stage-line', step === 0 ? '晨雾未散，酒旗已经立在门前。' : step === 1 ? '酒坛抱紧，脚步要快，眼睛更要亮。' : '风过桃园，街上的榜文正等着你。'))
    const taskTag = el('span', 'role-task-tag', '小伙计出发')
    sceneCopy.appendChild(taskTag)
    stageVisual.appendChild(sceneCopy)

    const portraitWrap = el('div', 'role-portrait-wrap')
    const portrait = new Image()
    portrait.src = C.assets?.['card-zhangfei'] || ''
    portrait.alt = '张飞庄的东家张飞'
    portrait.className = 'role-portrait'
    portraitWrap.appendChild(portrait)
    portraitWrap.appendChild(el('span', 'role-portrait-label', '东家张飞'))
    stageVisual.appendChild(portraitWrap)
    wrap.appendChild(stageVisual)

    const trail = el('ol', 'role-trail')
    phases.forEach((item, index) => {
      const itemEl = el('li', `role-trail-item${index === step ? ' active' : ''}${index < step ? ' done' : ''}`)
      itemEl.appendChild(el('span', 'role-trail-count', String(index + 1)))
      itemEl.appendChild(el('span', 'role-trail-label', item.eyebrow.split(' · ')[0]))
      trail.appendChild(itemEl)
    })
    wrap.appendChild(trail)

    const heading = el('div', 'role-heading')
    heading.appendChild(el('p', 'role-eyebrow', phase.eyebrow))
    const title = el('h2', null, phase.title)
    title.id = 'role-title'
    heading.appendChild(title)
    window.Speech?.attachButton(heading, `${phase.title}。${phase.body}${phase.focus}`, { auto: true, delay: 260 })
    wrap.appendChild(heading)
    wrap.appendChild(el('p', 'role-body', phase.body))
    wrap.appendChild(el('p', 'role-focus', phase.focus))

    const chips = el('div', 'role-chips')
    phase.chips.forEach((chip, index) => {
      const chipEl = el('span', 'role-chip', chip)
      chipEl.style.setProperty('--role-index', index)
      chips.appendChild(chipEl)
    })
    wrap.appendChild(chips)

    const note = el('p', 'role-note', '亲历中每一次选择都会有反馈，也可能收进一条人物线索。')
    wrap.appendChild(note)

    const row = el('div', 'btn-row role-actions')
    if (step > 0) {
      const back = el('button', 'btn ghost', '上一步')
      back.addEventListener('click', () => {
        state.roleIntroStep = step - 1
        render()
      })
      row.appendChild(back)
    }
    const next = el('button', 'btn', phase.action)
    next.addEventListener('click', () => {
      window.Sfx?.play('flip')
      if (step < phases.length - 1) {
        state.roleIntroStep = step + 1
        render()
        return
      }
      state.roleReady = true
      render()
    })
    row.appendChild(next)
    wrap.appendChild(row)
    stage.appendChild(wrap)
  }

  function renderNode() {
    const node = C.interactive.nodes.find((n) => n.id === state.nodeId)
    const wrap = window.Comic.renderNode(stage, el, node, C.assets?.[node.id], (host) => {
      window.Speech?.attachButton(host, () => node.scene + (node.dialog ? `${node.speaker ?? ''}说：${node.dialog}` : ''), { auto: true, delay: 250 })
      const choices = el('div', 'choices')
      node.choices.forEach((choice) => {
        const btn = el('button', 'choice-btn', choice.text)
        btn.addEventListener('click', () => showFeedback(wrap, choices, choice))
        choices.appendChild(btn)
      })
      host.appendChild(choices)
    })
  }

  function showFeedback(wrap, choicesEl, choice) {
    for (const b of choicesEl.querySelectorAll('button')) b.disabled = true

    if (choice.type === 'canon') state.canonCount++
    const fb = el('div', `feedback${choice.type === 'alt' ? ' alt' : ''}`)
    const tagText = { canon: '史笔如铁', alt: '歪史彩蛋', insight: '识人有术' }[choice.type]
    fb.appendChild(el('span', 'tag', tagText))
    fb.appendChild(el('p', null, choice.feedback))
    if (choice.insightGain && !state.insights.includes(choice.insightGain)) {
      state.insights.push(choice.insightGain)
      fb.appendChild(el('p', 'insight-gain', `识人录新增：${choice.insightGain}`))
      window.Sfx?.play('flip')
      updatePills()
    }
    const row = el('div', 'btn-row')
    const next = el('button', 'btn', choice.next ? '继续' : '前往闯关')
    next.addEventListener('click', () => {
      if (choice.next) { state.nodeId = choice.next; render() }
      else go('quiz')
    })
    row.appendChild(next)
    fb.appendChild(row)
    wrap.appendChild(fb)
    next.focus()
  }

  function renderQuiz() {
    if (window.Battle?.available(C) && !state.battleOn) {
      state.battleOn = true
      window.Battle.start(C, window.Battle.perks(state.insights.length, state.canonCount, C.interactive.nodes.length))
      window.Battle.renderHeroSelect(stage, el, C.quiz.battle.intro, () => render())
      return
    }
    const q = C.quiz.questions[state.quizIdx]
    const wrap = el('div')
    if (state.battleOn) window.Battle.renderHud(wrap, el, q, C.assets)
    const meta = el('div', 'quiz-meta')
    meta.appendChild(el('h2', null, `第 ${state.quizIdx + 1} 题 / 共 ${C.quiz.questions.length} 题`))
    meta.appendChild(el('span', 'exam-tag', q.examTag))
    wrap.appendChild(meta)
    const stemEl = el('p', null, q.stem)
    wrap.appendChild(stemEl)
    if (state.battleOn) window.Battle.prepareStem(stemEl)

    const area = el('div')
    wrap.appendChild(area)
    window.QuizTypes.render(q, area, { el, shuffle, normalize }, (earned) => finishQuestion(wrap, q, earned))
    stage.appendChild(wrap)
  }

  function finishQuestion(wrap, q, earned) {
    if (state.battleOn && earned > 0 && window.Battle.critEligible(state.combo, q.type)) {
      window.Battle.critPhase(wrap, el, (mul) => settleQuestion(wrap, q, earned, mul))
      return
    }
    settleQuestion(wrap, q, earned, 1)
  }

  function settleQuestion(wrap, q, earned, critMul) {
    state.score += earned
    updatePills()
    window.Sfx?.play(earned > 0 ? 'correct' : 'wrong')
    const full = earned === q.points
    const verdict = el('p', `verdict ${full ? 'ok' : 'no'}`,
      full ? `答对了！+${earned} 分` : earned > 0 ? `部分正确 +${earned} 分` : '没答对，看解析记一记')
    wrap.appendChild(verdict)
    state.combo = earned > 0 ? state.combo + 1 : 0
    if (state.combo >= 2) {
      const label = window.FX?.comboLabel(state.combo)
      if (label) verdict.appendChild(el('span', 'combo-badge', label))
    }
    if (earned > 0) window.FX?.floatScore(verdict, `+${earned} 功勋`)
    if (state.battleOn) {
      const events = window.Battle.applyTurn(earned, state.combo, critMul)
      window.Battle.renderEvents(wrap, el, events)
    }
    const lastSettled = state.quizIdx === C.quiz.questions.length - 1
    window.Save?.persist(C.meta.id, state, window.Battle?.serialize?.(),
      lastSettled ? { screen: 'rewards' } : { quizIdx: state.quizIdx + 1 })
    wrap.appendChild(el('div', 'explain', q.explanation))

    const row = el('div', 'btn-row')
    const isLast = state.quizIdx === C.quiz.questions.length - 1
    const next = el('button', 'btn', isLast ? '领取战利品' : '下一题')
    next.addEventListener('click', () => {
      if (isLast) go('rewards')
      else { state.quizIdx++; render() }
    })
    row.appendChild(next)
    wrap.appendChild(row)
    next.focus()
  }

  function renderRewards() {
    const wrap = el('div')
    const passed = state.score >= C.quiz.passScore
    const title = el('h2', null, passed ? '闯关成功，论功行赏' : '本回未过关')
    wrap.appendChild(title)
    if (passed) {
      window.FX?.stamp(title, '过 关')
      window.FX?.celebrate()
    }
    wrap.appendChild(el('p', null,
      `功勋 ${state.score} / ${C.quiz.fullScore} 分（过关线 ${C.quiz.passScore} 分）` +
      (state.insights.length ? `，识人录收录 ${state.insights.length} 条` : '')))
    if (!passed) {
      const startedQuiz = state.quizIdx > 0 || state.score > 0 || state.battleOn
      wrap.appendChild(el('p', 'muted', startedQuiz
        ? '本次闯关尚未达到解锁线；你可以继续挑战，也可以自由切换到任意学习环节。'
        : '先浏览本回战利品，再按自己的节奏选择说书、亲历故事或闯关。'))
    }
    if (state.battleOn) {
      const report = window.Battle.summary()
      if (report) {
        const br = el('div', 'battle-report')
        br.appendChild(el('strong', null, `战报 · ${report.title}`))
        br.appendChild(el('p', null, report.text))
        wrap.appendChild(br)
      }
    }

    if (window.Huarong) {
      wrap.appendChild(el('h2', null, '演武场 · 华容残局'))
      const arena = el('div', 'hr-arena')
      if (state.huarongDone) {
        arena.appendChild(el('p', 'muted', '突围已成：+5 功勋已入账，下回演武场再见。'))
      } else {
        arena.appendChild(el('p', null, '溃散的黄巾兵仍把刘备围在垓心——滑动方块护他突围，通关 +5 功勋（差几分解锁传说卡的话，机会来了）。'))
        const startBtn = el('button', 'btn ghost', '开始突围')
        startBtn.addEventListener('click', () => {
          startBtn.remove()
          window.Huarong.render(arena, el, () => {
            state.huarongDone = true
            state.score += 5
            window.Save?.persist(C.meta.id, state, window.Battle?.serialize?.())
            setTimeout(() => render(), 2400)
          })
        })
        arena.appendChild(startBtn)
      }
      wrap.appendChild(arena)
    }

    const grid = el('div', 'cards-grid')
    C.rewards.cards.forEach((card, i) => {
      const unlocked = state.score >= (card.minScore ?? 0)
      grid.appendChild(window.Cards.build(card, unlocked, C.assets?.[card.id], i))
    })
    wrap.appendChild(grid)

    if (state.insights.length) {
      wrap.appendChild(el('h2', null, '识人录'))
      const ul = el('ul')
      for (const ins of state.insights) ul.appendChild(el('li', null, ins))
      wrap.appendChild(ul)
    }

    wrap.appendChild(el('h2', null, '锦囊'))
    for (const tip of C.rewards.tips) {
      const box = el('div', 'tip-box')
      box.appendChild(el('h3', null, tip.title))
      box.appendChild(el('p', null, tip.content))
      wrap.appendChild(box)
    }

    const row = el('div', 'btn-row')
    const next = el('button', 'btn', '且听下回')
    next.addEventListener('click', () => go('cliff'))
    row.appendChild(next)
    wrap.appendChild(row)
    stage.appendChild(wrap)
  }

  function renderCliff() {
    const wrap = el('div')
    wrap.appendChild(el('h2', null, '欲知后事如何'))
    wrap.appendChild(el('p', 'cliff-poem', C.meta.cliffhanger.text))
    wrap.appendChild(el('blockquote', 'quote', C.meta.cliffhanger.nextChapterHint))
    wrap.appendChild(el('p', 'progress-note', '—— 原型版到此为止：完整版中，此处将解锁第二回 ——'))
    const row = el('div', 'btn-row')
    const replay = el('button', 'btn ghost', '重玩本回')
    replay.addEventListener('click', () => {
      window.Save?.clear(C.meta.id)
      resetState()
      render()
    })
    row.appendChild(replay)
    wrap.appendChild(row)
    stage.appendChild(wrap)
  }

  chapterLabel.textContent = `${C.meta.volume} · 第 ${C.meta.chapterNo} 回`
  const controls = el('div', 'topbar-controls')
  window.Speech?.renderToggle(controls)
  window.Sfx?.renderToggle(controls)
  document.getElementById('topbar').appendChild(controls)
  render()
})()
