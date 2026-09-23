window.Save = (() => {
  'use strict'
  const key = (chapterId) => `sanguo-save-${chapterId}`

  function persist(chapterId, state, battle, override) {
    if (!state || state.screen === 'cover') return
    const snapshot = {
      state: {
        screen: state.screen,
        sectionIdx: state.sectionIdx,
        nodeId: state.nodeId,
        roleIntroStep: state.roleIntroStep,
        roleReady: state.roleReady,
        insights: state.insights,
        quizIdx: state.quizIdx,
        score: state.score,
        combo: state.combo,
        canonCount: state.canonCount,
        battleOn: state.battleOn,
        huarongDone: state.huarongDone,
        ...(override ?? {}),
      },
      battle: battle ?? null,
    }
    try {
      localStorage.setItem(key(chapterId), JSON.stringify(snapshot))
    } catch {}
  }

  function load(chapterId) {
    try {
      const raw = localStorage.getItem(key(chapterId))
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!data?.state?.screen) return null
      return data
    } catch {
      return null
    }
  }

  function clear(chapterId) {
    try { localStorage.removeItem(key(chapterId)) } catch {}
  }

  const STEP_NAMES = { story: '说书', play: '亲历', quiz: '闯关', rewards: '战利品', cliff: '下回' }
  function describe(data) {
    if (!data?.state) return ''
    const s = data.state
    const where = STEP_NAMES[s.screen] ?? s.screen
    const detail = s.screen === 'quiz' ? `第 ${s.quizIdx + 1} 题` : s.screen === 'story' ? `第 ${s.sectionIdx + 1} 节` : ''
    return `上次玩到：${where}${detail ? ` · ${detail}` : ''}${s.score ? ` · 功勋 ${s.score} 分` : ''}`
  }

  return { persist, load, clear, describe }
})()
