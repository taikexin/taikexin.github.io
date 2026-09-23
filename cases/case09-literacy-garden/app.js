const STORAGE_KEY = "literacyGarden.v1";

const GROUPS = [
  {
    id: "3-5",
    label: "3-5岁",
    icon: "🐰",
    title: "绘本启蒙",
    target: 600,
    sample: 16,
    tags: ["生活常字", "图像联想", "亲子共读"],
    intro: "认识身边常见字，留下轻松的第一份记录。"
  },
  {
    id: "5-7",
    label: "5-7岁",
    icon: "🦊",
    title: "幼小衔接",
    target: 1200,
    sample: 20,
    tags: ["拼音基础", "词语辨认", "短句阅读"],
    intro: "覆盖入学前后常用字，方便观察留存率。"
  },
  {
    id: "7-12",
    label: "7-12岁",
    icon: "🦉",
    title: "小学进阶",
    target: 2500,
    sample: 24,
    tags: ["课内常字", "阅读理解", "成语积累"],
    intro: "按难度抽样，看看阅读字库是否稳稳长大。"
  },
  {
    id: "12+",
    label: "12岁以上",
    icon: "🦅",
    title: "语文提升",
    target: 3800,
    sample: 28,
    tags: ["文言常字", "抽象词汇", "写作表达"],
    intro: "加入更高阶汉字，适合长期追踪语文积累。"
  }
];

const WORDS = [
  ["人", "ren", "人们", "人们在花园里读书。", "生活常字", "3-5"],
  ["口", "kou", "开口", "小朋友大胆开口读出来。", "身体动作", "3-5"],
  ["手", "shou", "小手", "小手翻开一本书。", "身体动作", "3-5"],
  ["目", "mu", "目光", "目光跟着文字走。", "身体动作", "3-5"],
  ["耳", "er", "耳朵", "耳朵听见故事声。", "身体动作", "3-5"],
  ["日", "ri", "日出", "日出时花朵醒来了。", "自然天地", "3-5"],
  ["月", "yue", "月亮", "月亮照着窗边。", "自然天地", "3-5"],
  ["山", "shan", "山坡", "山坡上有一棵树。", "自然天地", "3-5"],
  ["水", "shui", "水滴", "水滴落在叶子上。", "自然天地", "3-5"],
  ["火", "huo", "火苗", "火苗像小灯。", "自然天地", "3-5"],
  ["木", "mu", "木头", "木头搭成小屋。", "自然天地", "3-5"],
  ["林", "lin", "树林", "树林里传来笑声。", "自然天地", "3-5"],
  ["花", "hua", "小花", "小花开在书页旁。", "自然天地", "3-5"],
  ["草", "cao", "青草", "青草软软的。", "自然天地", "3-5"],
  ["鸟", "niao", "小鸟", "小鸟唱着歌。", "动物朋友", "3-5"],
  ["鱼", "yu", "小鱼", "小鱼游过水草。", "动物朋友", "3-5"],
  ["牛", "niu", "水牛", "水牛慢慢走。", "动物朋友", "3-5"],
  ["马", "ma", "小马", "小马跑过草地。", "动物朋友", "3-5"],
  ["大", "da", "大树", "大树撑起绿伞。", "大小方位", "3-5"],
  ["小", "xiao", "小路", "小路通向花园。", "大小方位", "3-5"],
  ["上", "shang", "上面", "书在桌子上面。", "大小方位", "3-5"],
  ["下", "xia", "下面", "猫在椅子下面。", "大小方位", "3-5"],
  ["中", "zhong", "中间", "星星贴在中间。", "大小方位", "3-5"],
  ["天", "tian", "天空", "天空蓝蓝的。", "自然天地", "3-5"],
  ["地", "di", "土地", "种子睡在土地里。", "自然天地", "3-5"],
  ["爸", "ba", "爸爸", "爸爸讲故事。", "家庭学校", "5-7"],
  ["妈", "ma", "妈妈", "妈妈听我读字。", "家庭学校", "5-7"],
  ["学", "xue", "学习", "每天学习一点点。", "家庭学校", "5-7"],
  ["校", "xiao", "学校", "学校里有操场。", "家庭学校", "5-7"],
  ["书", "shu", "图书", "图书放进书包。", "家庭学校", "5-7"],
  ["笔", "bi", "铅笔", "铅笔写出新字。", "家庭学校", "5-7"],
  ["字", "zi", "汉字", "汉字像一幅画。", "家庭学校", "5-7"],
  ["朋", "peng", "朋友", "朋友一起读书。", "家庭学校", "5-7"],
  ["友", "you", "好友", "好友分享故事。", "家庭学校", "5-7"],
  ["明", "ming", "明亮", "明亮的灯照着桌面。", "时间颜色", "5-7"],
  ["早", "zao", "早晨", "早晨读一首儿歌。", "时间颜色", "5-7"],
  ["晚", "wan", "晚上", "晚上听睡前故事。", "时间颜色", "5-7"],
  ["前", "qian", "前面", "小狗跑在前面。", "大小方位", "5-7"],
  ["后", "hou", "后面", "花盆在门后面。", "大小方位", "5-7"],
  ["左", "zuo", "左边", "彩笔放在左边。", "大小方位", "5-7"],
  ["右", "you", "右边", "书架在右边。", "大小方位", "5-7"],
  ["红", "hong", "红花", "红花开得很热闹。", "时间颜色", "5-7"],
  ["黄", "huang", "黄色", "黄色雨衣亮闪闪。", "时间颜色", "5-7"],
  ["蓝", "lan", "蓝天", "蓝天上飘着白云。", "时间颜色", "5-7"],
  ["绿", "lv", "绿色", "绿色叶子长出来。", "时间颜色", "5-7"],
  ["清", "qing", "清水", "清水映出云朵。", "自然天地", "5-7"],
  ["晴", "qing", "晴天", "晴天适合去公园。", "自然天地", "5-7"],
  ["读", "du", "朗读", "朗读让句子有声音。", "阅读表达", "5-7"],
  ["想", "xiang", "想法", "想法藏在脑袋里。", "阅读表达", "5-7"],
  ["说", "shuo", "说话", "说话要看着对方。", "阅读表达", "5-7"],
  ["画", "hua", "图画", "图画里有森林。", "阅读表达", "5-7"],
  ["森", "sen", "森林", "森林里住着许多鸟。", "自然天地", "7-12"],
  ["晨", "chen", "清晨", "清晨的空气很新鲜。", "时间颜色", "7-12"],
  ["影", "ying", "影子", "影子跟着脚步走。", "观察想象", "7-12"],
  ["望", "wang", "眺望", "站在山顶眺望远方。", "观察想象", "7-12"],
  ["窗", "chuang", "窗户", "窗户外面有雨声。", "家庭学校", "7-12"],
  ["桌", "zhuo", "书桌", "书桌上摆着词典。", "家庭学校", "7-12"],
  ["课", "ke", "课文", "课文里有新的词。", "家庭学校", "7-12"],
  ["题", "ti", "题目", "题目要读清楚。", "家庭学校", "7-12"],
  ["愿", "yuan", "愿望", "愿望像一粒种子。", "阅读表达", "7-12"],
  ["勇", "yong", "勇敢", "勇敢的人会继续尝试。", "品格情绪", "7-12"],
  ["静", "jing", "安静", "安静时更容易思考。", "品格情绪", "7-12"],
  ["暖", "nuan", "温暖", "温暖的话让人开心。", "品格情绪", "7-12"],
  ["照", "zhao", "照亮", "灯光照亮小路。", "阅读表达", "7-12"],
  ["藏", "cang", "收藏", "把喜欢的书收藏好。", "阅读表达", "7-12"],
  ["旅", "lv", "旅行", "旅行让眼界打开。", "观察想象", "7-12"],
  ["梦", "meng", "梦想", "梦想需要每天靠近。", "观察想象", "7-12"],
  ["敬", "jing", "尊敬", "尊敬每一位老师。", "品格情绪", "7-12"],
  ["勤", "qin", "勤奋", "勤奋让练习开花。", "品格情绪", "7-12"],
  ["察", "cha", "观察", "观察叶子的纹路。", "观察想象", "7-12"],
  ["趣", "qu", "兴趣", "兴趣会带来好奇心。", "阅读表达", "7-12"],
  ["衡", "heng", "平衡", "阅读和运动都要平衡。", "抽象词汇", "12+"],
  ["鉴", "jian", "借鉴", "写作可以借鉴好句。", "抽象词汇", "12+"],
  ["慧", "hui", "智慧", "智慧来自认真思考。", "抽象词汇", "12+"],
  ["谨", "jin", "谨慎", "谨慎检查每一道题。", "抽象词汇", "12+"],
  ["毅", "yi", "毅力", "毅力让计划走得更远。", "抽象词汇", "12+"],
  ["谦", "qian", "谦虚", "谦虚的人愿意学习。", "品格情绪", "12+"],
  ["辩", "bian", "辩论", "辩论要有清楚理由。", "阅读表达", "12+"],
  ["辨", "bian", "辨认", "辨认相近字要仔细。", "阅读表达", "12+"],
  ["蕴", "yun", "蕴含", "诗句蕴含丰富情感。", "文学积累", "12+"],
  ["篇", "pian", "篇章", "篇章结构要清晰。", "文学积累", "12+"],
  ["韵", "yun", "韵味", "古诗读起来有韵味。", "文学积累", "12+"],
  ["墨", "mo", "墨香", "纸上留下淡淡墨香。", "文学积累", "12+"],
  ["策", "ce", "策略", "解题需要合适策略。", "抽象词汇", "12+"],
  ["析", "xi", "分析", "分析人物的想法。", "阅读表达", "12+"],
  ["涉", "she", "涉及", "这段文字涉及科学知识。", "抽象词汇", "12+"],
  ["融", "rong", "融入", "把感受融入作文。", "文学积累", "12+"]
].map(([char, pinyin, phrase, sentence, topic, group]) => ({ char, pinyin, phrase, sentence, topic, group }));

const WORD_MAP = new Map(WORDS.map((word) => [word.char, word]));
const groupOrder = new Map(GROUPS.map((group, index) => [group.id, index]));

const IDIOMS = [
  {
    text: "画蛇添足",
    pinyin: "hua she tian zu",
    category: "动物",
    level: "简单",
    meaning: "做了多余的事，反而不合适。",
    sentence: "这幅画已经很好了，再加一朵云就有点画蛇添足。",
    story: "古人比赛画蛇，先画完的人又给蛇添脚，结果失去了喝酒的机会。",
    scene: "一条蛇旁边多了奇怪的小脚。"
  },
  {
    text: "守株待兔",
    pinyin: "shou zhu dai tu",
    category: "动物",
    level: "简单",
    meaning: "只等好运气，不主动努力。",
    sentence: "学习不能守株待兔，要每天练一点。",
    story: "农夫偶然捡到撞树的兔子，后来天天守着树，却再也没有等到兔子。",
    scene: "树桩旁有一个等待的人。"
  },
  {
    text: "井底之蛙",
    pinyin: "jing di zhi wa",
    category: "动物",
    level: "简单",
    meaning: "见识太少，还以为自己知道全部。",
    sentence: "多读书，才不会变成井底之蛙。",
    story: "井底的小青蛙只看见一小片天空，以为天空就那么大。",
    scene: "一只青蛙坐在井里看天空。"
  },
  {
    text: "胸有成竹",
    pinyin: "xiong you cheng zhu",
    category: "学习",
    level: "中等",
    meaning: "做事之前已经想好了办法。",
    sentence: "她复习得很认真，考试时胸有成竹。",
    story: "画竹高手下笔前，心里已经有完整的竹子样子。",
    scene: "书桌上摆着竹叶和画笔。"
  },
  {
    text: "亡羊补牢",
    pinyin: "wang yang bu lao",
    category: "学习",
    level: "中等",
    meaning: "出了问题后及时补救，还不算晚。",
    sentence: "发现错题后马上订正，就是亡羊补牢。",
    story: "羊圈破了丢了羊，主人赶紧修好羊圈，后来羊就安全了。",
    scene: "小羊旁边有修好的围栏。"
  },
  {
    text: "春暖花开",
    pinyin: "chun nuan hua kai",
    category: "自然",
    level: "简单",
    meaning: "春天气候温暖，花儿开放，也表示好事情到来。",
    sentence: "春暖花开时，我们一起去公园读诗。",
    story: "春风吹过，小花一朵朵醒来，像在向人们打招呼。",
    scene: "阳光下有很多盛开的花。"
  }
];

const BOOKS = [
  { title: "小猪唏哩呼噜", author: "孙幼军", icon: "🐷", progress: 75, age: "5-7岁", words: ["猪", "呼", "噜", "忙"], minutes: 8 },
  { title: "不一样的卡梅拉", author: "克利斯提昂·约里波瓦", icon: "🐔", progress: 30, age: "5-7岁", words: ["鸡", "蛋", "海", "梦"], minutes: 10 },
  { title: "棕色的熊，棕色的熊", author: "比尔·马丁", icon: "🐻", progress: 0, age: "3-5岁", words: ["棕", "熊", "红", "鸟"], minutes: 4 },
  { title: "神奇校车", author: "乔安娜·柯尔", icon: "🚌", progress: 18, age: "7-12岁", words: ["奇", "校", "车", "探"], minutes: 12 }
];

const ACHIEVEMENTS = [
  { id: "firstReport", icon: "🌱", name: "第一片叶子", desc: "完成一次识字测评", test: () => state.history.length > 0 },
  { id: "tenWords", icon: "🌼", name: "十字花开", desc: "至少掌握 10 个字", test: () => masteredCount() >= 10 },
  { id: "reviewHero", icon: "⭐", name: "复习小达人", desc: "复习或闯关获得 8 颗星", test: () => state.stars >= 8 },
  { id: "idiomSeed", icon: "📖", name: "成语种子", desc: "完成一次成语测验", test: () => state.idiomQuizDone > 0 },
  { id: "readingBuddy", icon: "📚", name: "故事伙伴", desc: "阅读书架总进度超过 100%", test: () => Object.values(state.bookProgress || {}).reduce((sum, value) => sum + value, 0) >= 100 },
  { id: "streak3", icon: "☀", name: "三天阳光", desc: "连续记录 3 天", test: () => state.streak >= 3 }
];

const defaultState = {
  childName: "小朋友",
  selectedGroup: "5-7",
  history: [],
  vault: {},
  stars: 0,
  adventureAnswered: 0,
  idiomIndex: 0,
  idiomCategory: "全部",
  idiomQuizMode: "",
  idiomQuizDone: 0,
  bookProgress: {},
  signedDates: [],
  streak: 0,
  lastCheckDate: ""
};

let state = loadState();
let activeView = "home";
let activeVaultFilter = "all";
let session = null;
let adventure = null;
let idiomQuiz = null;
let toastTimer = null;

const els = {
  childNameInput: document.querySelector("#childNameInput"),
  childGroupSelect: document.querySelector("#childGroupSelect"),
  quickStartButton: document.querySelector("#quickStartButton"),
  restartAssessmentButton: document.querySelector("#restartAssessmentButton"),
  ageCards: document.querySelector("#ageCards"),
  homeStats: document.querySelector("#homeStats"),
  selectedGroupPill: document.querySelector("#selectedGroupPill"),
  reviewPreview: document.querySelector("#reviewPreview"),
  treeProgress: document.querySelector("#treeProgress"),
  assessmentMount: document.querySelector("#assessmentMount"),
  vaultList: document.querySelector("#vaultList"),
  customWordForm: document.querySelector("#customWordForm"),
  customWordInput: document.querySelector("#customWordInput"),
  customPinyinInput: document.querySelector("#customPinyinInput"),
  customPhraseInput: document.querySelector("#customPhraseInput"),
  starPill: document.querySelector("#starPill"),
  adventureMount: document.querySelector("#adventureMount"),
  idiomsMount: document.querySelector("#idiomsMount"),
  libraryMount: document.querySelector("#libraryMount"),
  atlasMount: document.querySelector("#atlasMount"),
  achievementsMount: document.querySelector("#achievementsMount"),
  leaderboardMount: document.querySelector("#leaderboardMount"),
  reportMount: document.querySelector("#reportMount"),
  printReportButton: document.querySelector("#printReportButton"),
  exportReportButton: document.querySelector("#exportReportButton"),
  welcomeLine: document.querySelector("#welcomeLine"),
  toast: document.querySelector("#toast")
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getGroup(id = state.selectedGroup) {
  return GROUPS.find((group) => group.id === id) || GROUPS[1];
}

function getGroupWords(groupId) {
  const limit = groupOrder.get(groupId) ?? 1;
  return WORDS.filter((word) => (groupOrder.get(word.group) ?? 0) <= limit);
}

function shuffle(items) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function init() {
  els.childNameInput.value = state.childName;
  els.childGroupSelect.innerHTML = GROUPS.map((group) => `<option value="${group.id}">${group.label} · ${group.title}</option>`).join("");
  els.childGroupSelect.value = state.selectedGroup;

  els.childNameInput.addEventListener("input", () => {
    state.childName = els.childNameInput.value.trim() || "小朋友";
    saveState();
    renderHome();
  });

  els.childGroupSelect.addEventListener("change", () => {
    selectGroup(els.childGroupSelect.value);
  });

  document.querySelectorAll("[data-tab], [data-tab-link]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab || button.dataset.tabLink;
      setView(target);
    });
  });

  els.quickStartButton.addEventListener("click", () => startAssessment());
  els.restartAssessmentButton.addEventListener("click", () => startAssessment());
  els.printReportButton.addEventListener("click", () => window.print());
  els.exportReportButton.addEventListener("click", exportLatestReport);

  els.customWordForm.addEventListener("submit", handleCustomWordSubmit);

  document.querySelectorAll("[data-vault-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeVaultFilter = button.dataset.vaultFilter;
      document.querySelectorAll("[data-vault-filter]").forEach((item) => item.classList.toggle("active", item === button));
      renderVault();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!session || session.done || activeView !== "assessment") return;
    if (event.key === "1") answerCurrent("known");
    if (event.key === "2") answerCurrent("fuzzy");
    if (event.key === "3") answerCurrent("new");
  });

  renderAll();
}

function setView(view) {
  activeView = view;
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.dataset.view === view);
  });
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === view);
  });

  if (view === "assessment") renderAssessment();
  if (view === "adventure") renderAdventure();
  if (view === "idioms") renderIdioms();
  if (view === "library") renderLibrary();
  if (view === "atlas") renderAtlas();
  if (view === "vault") renderVault();
  if (view === "achievements") renderAchievements();
  if (view === "leaderboard") renderLeaderboard();
  if (view === "report") renderReport();
}

function selectGroup(groupId) {
  state.selectedGroup = groupId;
  els.childGroupSelect.value = groupId;
  saveState();
  renderAll();
}

function renderAll() {
  renderHome();
  renderAssessment();
  renderAdventure();
  renderIdioms();
  renderLibrary();
  renderAtlas();
  renderVault();
  renderAchievements();
  renderLeaderboard();
  renderReport();
}

function renderHome() {
  const group = getGroup();
  const latest = state.history[0];
  const vaultItems = Object.values(state.vault);
  const pendingCount = vaultItems.filter((item) => item.status !== "mastered").length;
  const estimated = latest ? latest.estimated : 0;
  const retention = latest ? percent(latest.retention) : "未测";
  const progress = latest ? clamp(latest.estimated / latest.target, 0, 1) : 0;

  els.welcomeLine.textContent = `${state.childName || "小朋友"}，今天也有新叶子发芽了。`;
  els.selectedGroupPill.textContent = `${group.label} · ${group.title}`;

  els.homeStats.innerHTML = [
    { value: estimated ? `${estimated}` : "待测", label: "估算识字量", accent: "#8be0b1" },
    { value: retention, label: "识字留存率", accent: "#ffd66b" },
    { value: `${pendingCount}`, label: "待复习生字", accent: "#ff8c7a" },
    { value: `${state.stars || 0}`, label: "花园星星", accent: "#93c9ff" }
  ]
    .map(
      (item) => `
        <article class="stat-card" style="border-top: 5px solid ${item.accent}">
          <span class="stat-value">${item.value}</span>
          <span class="stat-label">${item.label}</span>
        </article>
      `
    )
    .join("");

  els.ageCards.innerHTML = GROUPS.map(
    (item) => `
      <button class="age-card ${item.id === state.selectedGroup ? "selected" : ""}" type="button" data-group="${item.id}">
        <span class="age-icon" aria-hidden="true">${item.icon}</span>
        <strong>${item.label}</strong>
        <span>${item.title}</span>
        <span>${item.intro}</span>
        <div class="tag-row">
          ${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </button>
    `
  ).join("");

  els.ageCards.querySelectorAll("[data-group]").forEach((button) => {
    button.addEventListener("click", () => selectGroup(button.dataset.group));
  });

  renderHomeGardenExtras();
  renderReviewPreview(vaultItems);
  renderTreeProgress(progress, latest, group);
}

function renderHomeGardenExtras() {
  let missionPanel = document.querySelector("#homeMissionPanel");
  if (!missionPanel) {
    missionPanel = document.createElement("section");
    missionPanel.id = "homeMissionPanel";
    missionPanel.className = "panel";
    els.ageCards.closest(".panel").after(missionPanel);
  }

  const signedToday = (state.signedDates || []).includes(todayText());
  const latestBook = BOOKS.find((book) => (state.bookProgress?.[book.title] ?? book.progress) < 100) || BOOKS[0];
  missionPanel.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="kicker">探索更多</p>
        <h2>今天可以完成 3 个小任务</h2>
      </div>
      <span class="pill">${state.streak || 0} 天</span>
    </div>
    <div class="quest-grid">
      <button class="quest-card" type="button" data-tab-link="adventure">
        <span class="quest-icon">🎮</span>
        <strong>识字冒险</strong>
        <span>听音、看图、选义、填空</span>
      </button>
      <button class="quest-card" type="button" data-tab-link="idioms">
        <span class="quest-icon">📖</span>
        <strong>成语故事</strong>
        <span>读故事，再玩成语测验</span>
      </button>
      <button class="quest-card" type="button" id="dailySignButton">
        <span class="quest-icon">${signedToday ? "🌞" : "📅"}</span>
        <strong>${signedToday ? "今日已签到" : "签到浇水"}</strong>
        <span>${signedToday ? "小树今天喝饱水了" : "奖励 2 颗星星"}</span>
      </button>
      <button class="quest-card" type="button" data-tab-link="atlas">
        <span class="quest-icon">🧭</span>
        <strong>汉字图鉴</strong>
        <span>看看哪些字已经开花</span>
      </button>
      <button class="quest-card" type="button" data-tab-link="achievements">
        <span class="quest-icon">🎖</span>
        <strong>成就徽章</strong>
        <span>收集坚持的小奖励</span>
      </button>
      <button class="quest-card featured" type="button" data-tab-link="library">
        <span class="quest-icon">${latestBook.icon}</span>
        <strong>今日推荐</strong>
        <span>《${latestBook.title}》 · ${latestBook.minutes} 分钟</span>
      </button>
    </div>
  `;

  missionPanel.querySelectorAll("[data-tab-link]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.tabLink));
  });
  missionPanel.querySelector("#dailySignButton").addEventListener("click", signToday);
}

function renderReviewPreview(items) {
  const pending = items
    .filter((item) => item.status !== "mastered")
    .sort((a, b) => (b.lastSeen || "").localeCompare(a.lastSeen || ""))
    .slice(0, 10);

  if (!pending.length) {
    els.reviewPreview.innerHTML = `<div class="empty-state">生字篮空空的，先做一次测评吧。</div>`;
    return;
  }

  els.reviewPreview.innerHTML = `
    <div class="mini-words">
      ${pending.map((item) => `<span class="mini-word" title="${item.phrase || ""}">${item.char}</span>`).join("")}
    </div>
  `;
}

function renderTreeProgress(progress, latest, group) {
  const levelName = progress >= 0.85 ? "开花树" : progress >= 0.55 ? "茂盛树" : progress >= 0.25 ? "小树苗" : "新芽";
  const next = latest ? Math.max(0, Math.ceil(group.target * (Math.ceil(progress * 4) / 4) - latest.estimated)) : group.sample;
  els.treeProgress.innerHTML = `
    <div class="tree">
      <div class="tree-shape" aria-hidden="true">
        <span class="tree-crown"></span>
        <span class="tree-trunk"></span>
        <span class="tree-ground"></span>
      </div>
      <div>
        <h3>${levelName}</h3>
        <div class="progress-track"><span class="progress-fill" style="width: ${Math.round(progress * 100)}%"></span></div>
        <div class="progress-meta">
          <span>${latest ? `${latest.estimated}/${group.target}` : `样本 ${group.sample} 字`}</span>
          <span>${latest ? `再稳住 ${next} 字` : "等待第一次测评"}</span>
        </div>
      </div>
    </div>
  `;
}

function startAssessment() {
  const group = getGroup();
  session = {
    groupId: group.id,
    words: shuffle(getGroupWords(group.id)).slice(0, group.sample),
    index: 0,
    answers: [],
    startedAt: new Date().toISOString(),
    showHint: false,
    done: false,
    report: null
  };
  setView("assessment");
  showToast("测评开始了");
}

function renderAssessment() {
  if (!session) {
    const group = getGroup();
    const latest = state.history[0];
    els.assessmentMount.innerHTML = `
      <article class="assessment-card">
        <div class="section-heading">
          <div>
            <p class="kicker">${group.label} · ${group.title}</p>
            <h2>${group.sample} 字小测</h2>
          </div>
          <span class="pill">估算池 ${group.target} 字</span>
        </div>
        <p>${latest ? `上次留存率 ${percent(latest.retention)}，估算识字量 ${latest.estimated} 字。` : "完成一次测评后，这里会生成识字量报告。"}</p>
        <div class="card-actions">
          <button class="primary-action" type="button" id="startAssessmentNow">
            <span aria-hidden="true">▶</span><span>开始</span>
          </button>
          <button class="secondary-action" type="button" data-tab-link="home">
            <span aria-hidden="true">←</span><span>首页</span>
          </button>
        </div>
      </article>
    `;
    els.assessmentMount.querySelector("#startAssessmentNow").addEventListener("click", startAssessment);
    els.assessmentMount.querySelector("[data-tab-link='home']").addEventListener("click", () => setView("home"));
    return;
  }

  if (session.done) {
    els.assessmentMount.innerHTML = renderReportCard(session.report, true);
    bindReportCardActions(els.assessmentMount);
    return;
  }

  const group = getGroup(session.groupId);
  const current = session.words[session.index];
  const progress = session.index / session.words.length;
  const known = session.answers.filter((answer) => answer.result === "known").length;
  const fuzzy = session.answers.filter((answer) => answer.result === "fuzzy").length;
  const fresh = session.answers.filter((answer) => answer.result === "new").length;

  els.assessmentMount.innerHTML = `
    <div class="assessment-layout">
      <article class="assessment-card word-stage">
        <div class="progress-track" aria-label="测评进度">
          <span class="progress-fill" style="width: ${Math.round(progress * 100)}%"></span>
        </div>
        <div class="progress-meta">
          <span>${session.index + 1}/${session.words.length}</span>
          <span>${group.label}</span>
        </div>
        <div class="big-character" aria-label="当前汉字">${current.char}</div>
        <div class="hint-line">${session.showHint ? `${current.pinyin} · ${current.phrase}` : " "}</div>
        <div class="answer-row">
          <button class="answer-button answer-known" type="button" data-answer="known">
            <span aria-hidden="true">✓</span><span>认识</span>
          </button>
          <button class="answer-button answer-fuzzy" type="button" data-answer="fuzzy">
            <span aria-hidden="true">?</span><span>犹豫</span>
          </button>
          <button class="answer-button answer-new" type="button" data-answer="new">
            <span aria-hidden="true">＋</span><span>生词</span>
          </button>
        </div>
        <div class="card-actions">
          <button class="secondary-action compact" type="button" id="hintToggle">
            <span aria-hidden="true">👁</span><span>${session.showHint ? "隐藏" : "提示"}</span>
          </button>
          <button class="secondary-action compact" type="button" id="undoAnswer" ${session.answers.length ? "" : "disabled"}>
            <span aria-hidden="true">↶</span><span>上一步</span>
          </button>
        </div>
      </article>
      <aside class="assessment-side">
        <div class="side-note">
          <strong>本轮记录</strong>
          <div class="round-row">
            <div class="round-item"><span>认识</span><b>${known}</b></div>
            <div class="round-item"><span>犹豫</span><b>${fuzzy}</b></div>
            <div class="round-item"><span>生词</span><b>${fresh}</b></div>
          </div>
        </div>
        <div class="side-note">
          <strong>当前词语</strong>
          <p>${current.sentence}</p>
        </div>
      </aside>
    </div>
  `;

  els.assessmentMount.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => answerCurrent(button.dataset.answer));
  });
  els.assessmentMount.querySelector("#hintToggle").addEventListener("click", () => {
    session.showHint = !session.showHint;
    renderAssessment();
  });
  els.assessmentMount.querySelector("#undoAnswer").addEventListener("click", undoAnswer);
}

function answerCurrent(result) {
  if (!session || session.done) return;
  const current = session.words[session.index];
  session.answers.push({ ...current, result });

  if (result !== "known") addToVault(current, result);

  session.index += 1;
  session.showHint = false;

  if (session.index >= session.words.length) {
    completeSession();
  }
  renderAssessment();
  renderHome();
}

function undoAnswer() {
  if (!session || !session.answers.length) return;
  session.answers.pop();
  session.index = Math.max(0, session.index - 1);
  session.showHint = false;
  renderAssessment();
}

function completeSession() {
  const group = getGroup(session.groupId);
  const report = buildReport(session.answers, group, session.startedAt);
  session.done = true;
  session.report = report;

  state.history = [report, ...state.history].slice(0, 16);
  const today = todayText();
  if (state.lastCheckDate !== today) {
    state.streak = state.lastCheckDate ? state.streak + 1 : 1;
    state.lastCheckDate = today;
  }
  saveState();
  showToast("识字报告已生成");
}

function buildReport(answers, group, startedAt) {
  const totals = answers.reduce(
    (acc, answer) => {
      acc[answer.result] += 1;
      if (!acc.byTopic[answer.topic]) acc.byTopic[answer.topic] = { total: 0, score: 0 };
      acc.byTopic[answer.topic].total += 1;
      acc.byTopic[answer.topic].score += answer.result === "known" ? 1 : answer.result === "fuzzy" ? 0.5 : 0;
      return acc;
    },
    { known: 0, fuzzy: 0, new: 0, byTopic: {} }
  );

  const score = totals.known + totals.fuzzy * 0.5;
  const retention = answers.length ? score / answers.length : 0;
  const estimated = Math.round(retention * group.target);
  const newWords = answers.filter((answer) => answer.result !== "known");

  return {
    id: `${Date.now()}`,
    childName: state.childName || "小朋友",
    groupId: group.id,
    groupLabel: group.label,
    groupTitle: group.title,
    target: group.target,
    sample: answers.length,
    known: totals.known,
    fuzzy: totals.fuzzy,
    new: totals.new,
    retention,
    estimated,
    byTopic: totals.byTopic,
    newWords,
    startedAt,
    finishedAt: new Date().toISOString()
  };
}

function addToVault(word, status = "new") {
  const old = state.vault[word.char];
  state.vault[word.char] = {
    char: word.char,
    pinyin: word.pinyin || old?.pinyin || "",
    phrase: word.phrase || old?.phrase || "",
    sentence: word.sentence || old?.sentence || "",
    topic: word.topic || old?.topic || "自定义",
    status: old?.status === "mastered" && status === "fuzzy" ? "fuzzy" : status,
    sourceGroup: word.group || old?.sourceGroup || state.selectedGroup,
    reviewCount: old?.reviewCount || 0,
    missCount: (old?.missCount || 0) + (status === "new" ? 1 : 0),
    fuzzyCount: (old?.fuzzyCount || 0) + (status === "fuzzy" ? 1 : 0),
    createdAt: old?.createdAt || new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };
  saveState();
}

function handleCustomWordSubmit(event) {
  event.preventDefault();
  const chars = [...els.customWordInput.value.trim()].filter((char) => /[\u4e00-\u9fa5]/.test(char));
  if (!chars.length) {
    showToast("请输入汉字");
    return;
  }

  chars.forEach((char) => {
    const known = WORD_MAP.get(char);
    addToVault({
      char,
      pinyin: els.customPinyinInput.value.trim() || known?.pinyin || "",
      phrase: els.customPhraseInput.value.trim() || known?.phrase || "",
      sentence: known?.sentence || "",
      topic: known?.topic || "自定义",
      group: known?.group || state.selectedGroup
    });
  });

  els.customWordInput.value = "";
  els.customPinyinInput.value = "";
  els.customPhraseInput.value = "";
  renderVault();
  renderHome();
  showToast("已加入生字库");
}

function renderVault() {
  const items = Object.values(state.vault)
    .filter((item) => activeVaultFilter === "all" || item.status === activeVaultFilter)
    .sort((a, b) => {
      if (a.status === b.status) return (b.lastSeen || "").localeCompare(a.lastSeen || "");
      return statusRank(a.status) - statusRank(b.status);
    });

  if (!items.length) {
    els.vaultList.innerHTML = `<div class="empty-state">这里会收集测评里的生词和犹豫字。</div>`;
    return;
  }

  els.vaultList.innerHTML = items.map(renderVaultCard).join("");
  els.vaultList.querySelectorAll("[data-vault-action]").forEach((button) => {
    button.addEventListener("click", () => handleVaultAction(button.dataset.vaultAction, button.dataset.char));
  });
}

function statusRank(status) {
  return status === "new" ? 0 : status === "fuzzy" ? 1 : 2;
}

function renderVaultCard(item) {
  const statusText = item.status === "mastered" ? "已掌握" : item.status === "fuzzy" ? "犹豫" : "生词";
  return `
    <article class="word-card">
      <div class="word-card-head">
        <div>
          <div class="word-main">${item.char}</div>
          <div class="word-meta">${item.pinyin || "拼音待补"} · ${item.phrase || "词语待补"}</div>
        </div>
        <span class="word-status ${item.status}">${statusText}</span>
      </div>
      <p class="word-meta">${item.sentence || "可在练习里继续复习这个字。"}</p>
      <div class="progress-track">
        <span class="progress-fill" style="width: ${Math.min(100, item.reviewCount * 25)}%"></span>
      </div>
      <div class="progress-meta">
        <span>复习 ${item.reviewCount} 次</span>
        <span>${formatDate(item.lastSeen)}</span>
      </div>
      <div class="card-actions">
        <button class="tiny-button" type="button" data-vault-action="review" data-char="${item.char}">复习</button>
        <button class="tiny-button" type="button" data-vault-action="master" data-char="${item.char}">认识了</button>
        <button class="tiny-button" type="button" data-vault-action="remove" data-char="${item.char}">移除</button>
      </div>
    </article>
  `;
}

function handleVaultAction(action, char) {
  const item = state.vault[char];
  if (!item) return;

  if (action === "review") {
    item.reviewCount += 1;
    item.lastSeen = new Date().toISOString();
    if (item.reviewCount >= 3 && item.status !== "new") item.status = "mastered";
    showToast("复习记录已更新");
  }
  if (action === "master") {
    item.status = "mastered";
    item.reviewCount += 1;
    item.lastSeen = new Date().toISOString();
    showToast("已标记掌握");
  }
  if (action === "remove") {
    delete state.vault[char];
    showToast("已移除");
  }

  saveState();
  renderVault();
  renderHome();
}

function renderAdventure() {
  if (els.starPill) els.starPill.textContent = `${state.stars || 0} 颗星`;
  if (!adventure) adventure = makeAdventure();

  const modeCards = GROUPS.map(
    (group) => `
      <button class="age-card ${group.id === state.selectedGroup ? "selected" : ""}" type="button" data-adventure-group="${group.id}">
        <span class="age-icon">${group.icon}</span>
        <strong>${group.label}</strong>
        <span>${group.id === "3-5" ? "听音看图 · 读音选义" : group.id === "5-7" ? "读音选义 · 字义辨析" : "字义辨析 · 填空练习"}</span>
        <div class="tag-row">${group.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </button>
    `
  ).join("");

  els.adventureMount.innerHTML = `
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="kicker">选择年龄，开始探索</p>
          <h2>每答对一题，小花园多一颗星</h2>
        </div>
        <button class="primary-action compact" type="button" id="newAdventureButton"><span>↻</span><span>换题</span></button>
      </div>
      <div class="age-grid">${modeCards}</div>
    </section>
    <article class="practice-card adventure-stage">
      <div class="scene-card">
        <div class="scene-sky">
          <span class="scene-sun"></span>
          <span class="scene-cloud"></span>
          <span class="scene-hill"></span>
          <span class="scene-object">${adventure.sceneIcon}</span>
        </div>
      </div>
      <div class="adventure-question">
        <p class="kicker">${adventure.modeLabel}</p>
        <h2>${adventure.prompt}</h2>
        <div class="practice-word">${adventure.display}</div>
        <div class="options-grid">
          ${adventure.options
            .map(
              (option) => `
                <button class="option-button ${adventure.selected === option ? (option === adventure.answer ? "correct" : "wrong") : ""}" type="button" data-adventure-option="${escapeHTML(option)}" ${adventure.selected ? "disabled" : ""}>
                  ${option}
                </button>
              `
            )
            .join("")}
        </div>
        <p>${adventure.feedback || "选一个答案，看看小花会不会亮起来。"}</p>
        <div class="practice-actions">
          <button class="primary-action compact" type="button" id="nextAdventureButton"><span>→</span><span>${adventure.selected ? "下一关" : "跳过"}</span></button>
          <button class="secondary-action compact" type="button" id="hearAdventureButton"><span>🔊</span><span>听一听</span></button>
          <button class="secondary-action compact" type="button" data-tab-link="vault"><span>📚</span><span>生字库</span></button>
        </div>
      </div>
    </article>
  `;

  els.adventureMount.querySelectorAll("[data-adventure-group]").forEach((button) => {
    button.addEventListener("click", () => {
      selectGroup(button.dataset.adventureGroup);
      adventure = makeAdventure();
      setView("adventure");
    });
  });
  els.adventureMount.querySelectorAll("[data-adventure-option]").forEach((button) => {
    button.addEventListener("click", () => chooseAdventureOption(button.dataset.adventureOption));
  });
  els.adventureMount.querySelector("#newAdventureButton").addEventListener("click", () => {
    adventure = makeAdventure();
    renderAdventure();
  });
  els.adventureMount.querySelector("#nextAdventureButton").addEventListener("click", () => {
    adventure = makeAdventure();
    renderAdventure();
  });
  els.adventureMount.querySelector("#hearAdventureButton").addEventListener("click", speakAdventure);
  els.adventureMount.querySelector("[data-tab-link='vault']").addEventListener("click", () => setView("vault"));
}

function makeAdventure() {
  const pool = [...getPracticePool(), ...shuffle(getGroupWords(state.selectedGroup)).slice(0, 12)];
  const word = shuffle(pool)[0] || WORDS[0];
  const groupIndex = groupOrder.get(state.selectedGroup) ?? 1;
  const modes = groupIndex === 0 ? ["image", "sound"] : groupIndex === 1 ? ["sound", "meaning"] : ["meaning", "blank"];
  const mode = shuffle(modes)[0];
  const sceneIcon = sceneIconFor(word);
  const distractors = shuffle(WORDS.filter((item) => item.char !== word.char)).slice(0, 3);

  if (mode === "image") {
    return buildAdventure(word, mode, "听音看图", `哪一个字住在这幅图里？`, sceneIcon, word.char, shuffle([word.char, ...distractors.map((item) => item.char)]), sceneIcon);
  }
  if (mode === "sound") {
    return buildAdventure(word, mode, "读音选义", `读音是 ${word.pinyin}，应该选哪个？`, "🔊", word.char, shuffle([word.char, ...distractors.map((item) => item.char)]), sceneIcon);
  }
  if (mode === "blank") {
    return buildAdventure(word, mode, "填空练习", word.sentence.replace(word.char, "□"), word.phrase, word.char, shuffle([word.char, ...distractors.map((item) => item.char)]), sceneIcon);
  }
  return buildAdventure(word, mode, "字义辨析", `哪个词语和「${word.char}」是好朋友？`, word.char, word.phrase, shuffle([word.phrase, ...distractors.map((item) => item.phrase)]), sceneIcon);
}

function buildAdventure(word, mode, modeLabel, prompt, display, answer, options, sceneIcon) {
  return { word, mode, modeLabel, prompt, display, answer, options, sceneIcon, selected: "", feedback: "" };
}

function chooseAdventureOption(option) {
  if (!adventure || adventure.selected) return;
  adventure.selected = option;
  state.adventureAnswered = (state.adventureAnswered || 0) + 1;
  const item = state.vault[adventure.word.char];

  if (option === adventure.answer) {
    state.stars = (state.stars || 0) + 1;
    adventure.feedback = "答对啦！花园里亮起一颗星。";
    if (item) {
      item.reviewCount += 1;
      item.lastSeen = new Date().toISOString();
      if (item.reviewCount >= 3) item.status = "mastered";
    }
  } else {
    adventure.feedback = `再看看：正确答案是「${adventure.answer}」。`;
    addToVault(adventure.word, "fuzzy");
  }

  saveState();
  renderAdventure();
  renderVault();
  renderHome();
}

function speakAdventure() {
  const text = adventure?.mode === "meaning" ? adventure.word.phrase : adventure?.word.char;
  if ("speechSynthesis" in window && text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
    showToast("正在读给你听");
  } else {
    showToast("当前浏览器不支持朗读");
  }
}

function sceneIconFor(word) {
  const text = `${word.char}${word.phrase}${word.topic}`;
  if (/[鸟鸡鸭]/.test(text)) return "🐦";
  if (/[鱼水清]/.test(text)) return "🐟";
  if (/[花草森木林树]/.test(text)) return "🌳";
  if (/[日晴明早]/.test(text)) return "☀";
  if (/[月晚梦]/.test(text)) return "🌙";
  if (/[书学课笔字]/.test(text)) return "📚";
  if (/[家爸妈朋友]/.test(text)) return "🏠";
  return "🌟";
}

function getPracticePool() {
  return Object.values(state.vault).filter((item) => item.status !== "mastered");
}

function renderIdioms() {
  const categories = ["全部", ...new Set(IDIOMS.map((item) => item.category)), "常用"];
  const list = filteredIdioms();
  if (!list.length) state.idiomCategory = "全部";
  const idiom = list[state.idiomIndex % list.length] || IDIOMS[0];

  els.idiomsMount.innerHTML = `
    <div class="filter-row">
      ${categories.map((category) => `<button class="chip ${state.idiomCategory === category ? "active" : ""}" type="button" data-idiom-category="${category}">${category}</button>`).join("")}
    </div>
    <article class="report-card idiom-card">
      <div class="idiom-scene">
        <div class="scene-sky idiom-picture">
          <span class="scene-sun"></span>
          <span class="scene-cloud"></span>
          <span class="scene-hill"></span>
          <span class="scene-object">${idiomSceneIcon(idiom)}</span>
        </div>
      </div>
      <div>
        <div class="section-heading">
          <div>
            <p class="kicker">${idiom.category} · ${idiom.level}</p>
            <h2>${idiom.text}</h2>
          </div>
          <button class="icon-button" type="button" id="favoriteIdiomButton" aria-label="收藏成语">${(state.favoriteIdioms || []).includes(idiom.text) ? "♥" : "♡"}</button>
        </div>
        <p class="word-meta">${idiom.pinyin}</p>
        <h3>释义</h3>
        <p>${idiom.meaning}</p>
        <h3>例句</h3>
        <p>${idiom.sentence}</p>
        <h3>成语故事</h3>
        <p>${idiom.story}</p>
        <div class="card-actions">
          <button class="secondary-action compact" type="button" id="prevIdiomButton"><span>←</span><span>上一个</span></button>
          <span class="pill">${(state.idiomIndex % list.length) + 1} / ${list.length}</span>
          <button class="secondary-action compact" type="button" id="nextIdiomButton"><span>→</span><span>下一个</span></button>
          <button class="primary-action compact" type="button" id="startIdiomQuizButton"><span>🧩</span><span>成语测验</span></button>
        </div>
      </div>
    </article>
    <div id="idiomQuizMount">${idiomQuiz ? renderIdiomQuizCard() : renderIdiomQuizModes()}</div>
  `;

  els.idiomsMount.querySelectorAll("[data-idiom-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.idiomCategory = button.dataset.idiomCategory;
      state.idiomIndex = 0;
      idiomQuiz = null;
      saveState();
      renderIdioms();
    });
  });
  els.idiomsMount.querySelector("#prevIdiomButton").addEventListener("click", () => moveIdiom(-1));
  els.idiomsMount.querySelector("#nextIdiomButton").addEventListener("click", () => moveIdiom(1));
  els.idiomsMount.querySelector("#favoriteIdiomButton").addEventListener("click", () => toggleFavoriteIdiom(idiom.text));
  els.idiomsMount.querySelector("#startIdiomQuizButton").addEventListener("click", () => {
    idiomQuiz = null;
    state.idiomQuizMode = "";
    renderIdioms();
    document.querySelector("#idiomQuizMount")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  bindIdiomQuizEvents();
}

function filteredIdioms() {
  if (state.idiomCategory === "全部") return IDIOMS;
  if (state.idiomCategory === "常用") return IDIOMS.filter((item) => item.level === "简单");
  return IDIOMS.filter((item) => item.category === state.idiomCategory);
}

function moveIdiom(delta) {
  const list = filteredIdioms();
  state.idiomIndex = (state.idiomIndex + delta + list.length) % list.length;
  idiomQuiz = null;
  saveState();
  renderIdioms();
}

function toggleFavoriteIdiom(text) {
  const favorites = new Set(state.favoriteIdioms || []);
  if (favorites.has(text)) favorites.delete(text);
  else favorites.add(text);
  state.favoriteIdioms = [...favorites];
  saveState();
  renderIdioms();
}

function renderIdiomQuizModes() {
  const modes = [
    ["picture", "🎨", "看图猜成语", "根据场景图片猜成语"],
    ["order", "🧩", "乱序组词", "把打乱的字组成成语"],
    ["meaning", "🔗", "释义匹配", "将成语与释义配对"],
    ["sound", "🔊", "听音辨成语", "根据拼音选择成语"]
  ];
  return `
    <section class="panel idiom-quiz-panel">
      <div class="section-heading">
        <div>
          <p class="kicker">成语测验</p>
          <h2>选择一种玩法</h2>
        </div>
      </div>
      <div class="quest-grid">
        ${modes
          .map(
            ([mode, icon, title, desc]) => `
              <button class="quest-card" type="button" data-idiom-mode="${mode}">
                <span class="quest-icon">${icon}</span>
                <strong>${title}</strong>
                <span>${desc}</span>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderIdiomQuizCard() {
  const quiz = idiomQuiz;
  return `
    <section class="panel idiom-quiz-panel">
      <div class="section-heading">
        <div>
          <p class="kicker">${quiz.modeLabel}</p>
          <h2>${quiz.prompt}</h2>
        </div>
        <span class="pill">${state.stars || 0} 颗星</span>
      </div>
      <div class="practice-grid">
        <div class="practice-word idiom-display">${quiz.display}</div>
        <div>
          <div class="options-grid">
            ${quiz.options
              .map(
                (option) => `
                  <button class="option-button ${quiz.selected === option ? (option === quiz.answer ? "correct" : "wrong") : ""}" type="button" data-idiom-option="${escapeHTML(option)}" ${quiz.selected ? "disabled" : ""}>${option}</button>
                `
              )
              .join("")}
          </div>
          <p>${quiz.feedback || "选出答案后，会点亮成语星星。"}</p>
          <div class="practice-actions">
            <button class="primary-action compact" type="button" id="nextIdiomQuizButton"><span>→</span><span>${quiz.selected ? "下一题" : "换题"}</span></button>
            <button class="secondary-action compact" type="button" id="backIdiomModeButton"><span>←</span><span>换玩法</span></button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function bindIdiomQuizEvents() {
  els.idiomsMount.querySelectorAll("[data-idiom-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      idiomQuiz = makeIdiomQuiz(button.dataset.idiomMode);
      renderIdioms();
    });
  });
  els.idiomsMount.querySelectorAll("[data-idiom-option]").forEach((button) => {
    button.addEventListener("click", () => chooseIdiomOption(button.dataset.idiomOption));
  });
  const next = els.idiomsMount.querySelector("#nextIdiomQuizButton");
  if (next) next.addEventListener("click", () => {
    idiomQuiz = makeIdiomQuiz(idiomQuiz?.mode || "meaning");
    renderIdioms();
  });
  const back = els.idiomsMount.querySelector("#backIdiomModeButton");
  if (back) back.addEventListener("click", () => {
    idiomQuiz = null;
    renderIdioms();
  });
}

function makeIdiomQuiz(mode) {
  const idiom = shuffle(filteredIdioms())[0] || IDIOMS[0];
  const options = shuffle([idiom.text, ...shuffle(IDIOMS.filter((item) => item.text !== idiom.text)).slice(0, 3).map((item) => item.text)]);
  if (mode === "picture") return { mode, modeLabel: "看图猜成语", prompt: "这幅图像哪个成语？", display: idiomSceneIcon(idiom), answer: idiom.text, options, selected: "", feedback: "" };
  if (mode === "order") return { mode, modeLabel: "乱序组词", prompt: "把这些字组成成语", display: shuffle([...idiom.text]).join(" · "), answer: idiom.text, options, selected: "", feedback: "" };
  if (mode === "sound") return { mode, modeLabel: "听音辨成语", prompt: `拼音：${idiom.pinyin}`, display: "🔊", answer: idiom.text, options, selected: "", feedback: "" };
  return { mode, modeLabel: "释义匹配", prompt: idiom.meaning, display: "🔗", answer: idiom.text, options, selected: "", feedback: "" };
}

function chooseIdiomOption(option) {
  if (!idiomQuiz || idiomQuiz.selected) return;
  idiomQuiz.selected = option;
  state.idiomQuizDone = (state.idiomQuizDone || 0) + 1;
  if (option === idiomQuiz.answer) {
    state.stars = (state.stars || 0) + 2;
    idiomQuiz.feedback = "答对啦！这颗成语星星很亮。";
  } else {
    idiomQuiz.feedback = `正确答案是「${idiomQuiz.answer}」。`;
  }
  saveState();
  renderIdioms();
  renderHome();
}

function idiomSceneIcon(idiom) {
  if (idiom.text === "画蛇添足") return "🐍";
  if (idiom.text === "守株待兔") return "🌳";
  if (idiom.text === "井底之蛙") return "🐸";
  if (idiom.text === "胸有成竹") return "🎋";
  if (idiom.text === "亡羊补牢") return "🐑";
  return "🌸";
}

function renderLibrary() {
  els.libraryMount.innerHTML = `
    <div class="book-grid">
      ${BOOKS.map((book) => {
        const progress = state.bookProgress?.[book.title] ?? book.progress;
        return `
          <article class="book-card">
            <div class="book-cover">
              <span>${book.icon}</span>
              <strong>${book.title.slice(0, 4)}</strong>
            </div>
            <div>
              <p class="kicker">${book.age} · ${book.minutes} 分钟</p>
              <h2>${book.title}</h2>
              <p>${book.author}</p>
              <div class="progress-track"><span class="progress-fill" style="width: ${progress}%"></span></div>
              <div class="progress-meta"><span>${progress}%</span><span>${book.words.join("、")}</span></div>
              <div class="card-actions">
                <button class="primary-action compact" type="button" data-read-book="${book.title}"><span>▶</span><span>读 5 分钟</span></button>
                <button class="secondary-action compact" type="button" data-book-words="${book.title}"><span>＋</span><span>加入生字</span></button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
  els.libraryMount.querySelectorAll("[data-read-book]").forEach((button) => {
    button.addEventListener("click", () => readBook(button.dataset.readBook));
  });
  els.libraryMount.querySelectorAll("[data-book-words]").forEach((button) => {
    button.addEventListener("click", () => addBookWords(button.dataset.bookWords));
  });
}

function readBook(title) {
  const current = state.bookProgress?.[title] ?? BOOKS.find((book) => book.title === title)?.progress ?? 0;
  state.bookProgress = { ...(state.bookProgress || {}), [title]: Math.min(100, current + 15) };
  state.stars = (state.stars || 0) + 1;
  saveState();
  renderLibrary();
  renderHome();
  showToast("阅读进度增加了");
}

function addBookWords(title) {
  const book = BOOKS.find((item) => item.title === title);
  if (!book) return;
  book.words.forEach((char) => {
    const word = WORD_MAP.get(char) || { char, pinyin: "", phrase: `${char}字`, sentence: "", topic: "阅读书架", group: state.selectedGroup };
    addToVault(word, "fuzzy");
  });
  renderVault();
  renderHome();
  showToast("绘本生字已加入");
}

function renderAtlas() {
  const topics = [...new Set(WORDS.map((word) => word.topic))];
  const learned = learnedCharSet();
  els.atlasMount.innerHTML = `
    <div class="atlas-grid">
      ${topics.map((topic) => {
        const words = WORDS.filter((word) => word.topic === topic).slice(0, 12);
        const count = words.filter((word) => learned.has(word.char)).length;
        return `
          <section class="panel atlas-card">
            <div class="section-heading">
              <div>
                <p class="kicker">${count}/${words.length}</p>
                <h2>${topic}</h2>
              </div>
            </div>
            <div class="atlas-words">
              ${words.map((word) => `<button class="atlas-word ${learned.has(word.char) ? "learned" : ""}" type="button" data-atlas-char="${word.char}" title="${word.phrase}">${word.char}</button>`).join("")}
            </div>
          </section>
        `;
      }).join("")}
    </div>
  `;
  els.atlasMount.querySelectorAll("[data-atlas-char]").forEach((button) => {
    button.addEventListener("click", () => {
      const word = WORD_MAP.get(button.dataset.atlasChar);
      if (word) addToVault(word, "fuzzy");
      renderAtlas();
      renderVault();
      showToast(`已把「${button.dataset.atlasChar}」放进复习篮`);
    });
  });
}

function renderAchievements() {
  els.achievementsMount.innerHTML = `
    <div class="badge-grid">
      ${ACHIEVEMENTS.map((badge) => {
        const unlocked = badge.test();
        return `
          <article class="badge-card ${unlocked ? "unlocked" : ""}">
            <span class="badge-icon">${badge.icon}</span>
            <h2>${badge.name}</h2>
            <p>${badge.desc}</p>
            <span class="pill">${unlocked ? "已获得" : "继续努力"}</span>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderLeaderboard() {
  const latest = state.history[0];
  const rows = [
    { name: state.childName || "小朋友", score: latest?.estimated || masteredCount() * 20 || 128, streak: state.streak || 1, me: true },
    { name: "晨晨", score: 960, streak: 7 },
    { name: "米粒", score: 820, streak: 5 },
    { name: "豆豆", score: 690, streak: 4 },
    { name: "安安", score: 540, streak: 3 }
  ].sort((a, b) => b.score - a.score);

  els.leaderboardMount.innerHTML = `
    <section class="panel">
      <div class="filter-row">
        <button class="chip active" type="button">本周榜</button>
        <button class="chip" type="button">总榜</button>
        <button class="chip" type="button">好友榜</button>
      </div>
      <div class="leaderboard-list">
        ${rows.map((row, index) => `
          <div class="leader-row ${row.me ? "me" : ""}">
            <strong>${index + 1}</strong>
            <span>${row.me ? "🌟" : index === 0 ? "👑" : "🌼"} ${row.name}</span>
            <span>${row.score} 字</span>
            <span>${row.streak} 天</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function learnedCharSet() {
  const chars = new Set();
  state.history.forEach((report) => {
    report.newWords.forEach((word) => {
      if (word.result === "known") chars.add(word.char);
    });
  });
  Object.values(state.vault).forEach((item) => {
    if (item.status === "mastered") chars.add(item.char);
  });
  if (!chars.size) ["人", "大", "小", "天", "地"].forEach((char) => chars.add(char));
  return chars;
}

function masteredCount() {
  return learnedCharSet().size + Object.values(state.vault).filter((item) => item.status === "mastered").length;
}

function signToday() {
  const today = todayText();
  state.signedDates = state.signedDates || [];
  if (state.signedDates.includes(today)) {
    showToast("今天已经签到啦");
    return;
  }
  state.signedDates = [today, ...state.signedDates].slice(0, 60);
  state.stars = (state.stars || 0) + 2;
  state.streak = Math.max(state.streak || 0, 1);
  state.lastCheckDate = today;
  saveState();
  renderAll();
  showToast("签到成功，小树喝到水了");
}

function renderReport() {
  const latest = state.history[0];
  if (!latest) {
    els.reportMount.innerHTML = `
      <article class="report-card">
        <div class="empty-state">完成测评后，会在这里看到识字量、留存率和生字清单。</div>
        <div class="card-actions">
          <button class="primary-action" type="button" id="reportStartAssessment">
            <span aria-hidden="true">▶</span><span>开始测评</span>
          </button>
        </div>
      </article>
    `;
    els.reportMount.querySelector("#reportStartAssessment").addEventListener("click", startAssessment);
    return;
  }

  els.reportMount.innerHTML = `
    ${renderReportCard(latest, false)}
    <section class="panel" style="margin-top: 14px">
      <div class="section-heading">
        <div>
          <p class="kicker">历史记录</p>
          <h2>最近测评</h2>
        </div>
      </div>
      <div class="timeline">
        ${state.history
          .map(
            (item) => `
              <div class="timeline-item">
                <strong>${formatDate(item.finishedAt)}</strong>
                <span>${item.groupLabel} · 留存率 ${percent(item.retention)} · 生词 ${item.new + item.fuzzy} 个</span>
                <b>${item.estimated} 字</b>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
  bindReportCardActions(els.reportMount);
}

function renderReportCard(report, fromAssessment) {
  const advice = getAdvice(report);
  const newWords = report.newWords.slice(0, 12);
  const topicBars = Object.entries(report.byTopic)
    .map(([topic, item]) => ({ topic, value: item.total ? item.score / item.total : 0 }))
    .sort((a, b) => a.value - b.value);

  return `
    <article class="report-card">
      <div class="result-grid">
        <div>
          <div class="donut" style="--p: ${Math.round(report.retention * 100)}">
            <span class="donut-value">${percent(report.retention)}</span>
          </div>
        </div>
        <div class="result-summary">
          <div>
            <p class="kicker">${report.childName} · ${report.groupLabel}</p>
            <h2>估算识字量 ${report.estimated} 字</h2>
            <p>${advice}</p>
          </div>
          <div class="metric-row">
            <div class="metric"><strong>${report.known}</strong><span>认识</span></div>
            <div class="metric"><strong>${report.fuzzy}</strong><span>犹豫</span></div>
            <div class="metric"><strong>${report.new}</strong><span>生词</span></div>
          </div>
          <div class="bar-list">
            ${topicBars
              .map(
                (item) => `
                  <div class="bar-item">
                    <span>${item.topic}</span>
                    <div class="progress-track"><span class="progress-fill" style="width: ${Math.round(item.value * 100)}%"></span></div>
                    <b>${percent(item.value)}</b>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="mini-words">
            ${
              newWords.length
                ? newWords.map((word) => `<span class="recent-word" title="${word.phrase}">${word.char}</span>`).join("")
                : `<span class="tag">本轮没有新增生词</span>`
            }
          </div>
          <div class="card-actions">
            ${
              fromAssessment
                ? `<button class="primary-action compact" type="button" data-report-action="open-report"><span aria-hidden="true">📊</span><span>完整报告</span></button>`
                : ""
            }
            <button class="secondary-action compact" type="button" data-report-action="adventure"><span aria-hidden="true">🎮</span><span>闯关复习</span></button>
            <button class="secondary-action compact" type="button" data-report-action="restart"><span aria-hidden="true">↻</span><span>再测一次</span></button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function bindReportCardActions(root) {
  root.querySelectorAll("[data-report-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.reportAction;
      if (action === "open-report") setView("report");
      if (action === "adventure") setView("adventure");
      if (action === "restart") startAssessment();
    });
  });
}

function getAdvice(report) {
  if (report.retention >= 0.86) return "识字留存很稳定，可以加入短句朗读和简单复述。";
  if (report.retention >= 0.66) return "整体基础不错，建议把犹豫字放进日常词语里复现。";
  if (report.retention >= 0.46) return "已经有了清楚起点，先用生字库做少量多次复习。";
  return "先从熟悉场景里的字开始，减少单次测评数量会更轻松。";
}

function exportLatestReport() {
  const report = state.history[0];
  if (!report) {
    showToast("还没有可导出的报告");
    return;
  }

  const content = [
    `识字小花园测评报告`,
    `孩子：${report.childName}`,
    `阶段：${report.groupLabel} ${report.groupTitle}`,
    `日期：${formatDate(report.finishedAt)}`,
    `样本：${report.sample} 字`,
    `识字留存率：${percent(report.retention)}`,
    `估算识字量：${report.estimated} / ${report.target} 字`,
    `认识：${report.known}，犹豫：${report.fuzzy}，生词：${report.new}`,
    `生字：${report.newWords.map((word) => `${word.char}(${word.phrase})`).join("、") || "无"}`,
    `建议：${getAdvice(report)}`
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.childName}-识字报告-${formatDate(report.finishedAt)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("报告已导出");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

init();
