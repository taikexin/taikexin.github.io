/*
 * 真实 AI 适配层：保持页面视觉和原有工作台代码不变，只将 AI 请求交给云端安全网关。
 * API Key 永不进入浏览器；访客标识只用于云端额度管理，并与服务端 IP 限制叠加。
 */
(function () {
  'use strict';

  const gateway = String(window.AI_READ_GATEWAY_BASE || '').replace(/\/+$/, '');
  const materialGuideOnly = window.AI_READ_MATERIAL_GUIDE_ONLY === true;
  const upstreamFetch = window.fetch.bind(window);
  const exhaustedMessage = '今日体验次数已用完，如有特殊学习或教学需求，请联系课程老师申请额外额度。';
  const visitorStorageKey = 'xiaolu-ai-read-visitor-v1';
  const curatedBookDetails = Object.freeze({
    '夏洛的网': {
      aliases: ['夏洛特的网', "Charlotte's Web", 'Charlottes Web'],
      source: '预设演示书目（公开简介）',
      summary: '美国作家 E. B. White 创作的儿童文学作品，故事围绕谷仓里的小猪威尔伯与蜘蛛夏洛之间的友谊展开。公开简介只用于确认阅读对象和规划初读问题，人物、情节与主题的深入分析仍应回到正版原书、目录或书摘核验。'
    },
    '埃隆·马斯克传': {
      aliases: ['埃隆马斯克传', 'Elon Musk'],
      source: '预设演示书目（公开简介）',
      summary: '沃尔特·艾萨克森撰写的埃隆·马斯克传记，英文版于 2023 年出版。中文译名、译者和出版时间可能随版本不同而变化；它不应与阿什利·万斯所著《硅谷钢铁侠》混同。公开简介仅支持初读导览，具体事件、引文和章节判断须回到所读版本核验。'
    },
    '万历十五年': {
      aliases: ['The Year of 1587'],
      source: '预设演示书目（公开简介）',
      summary: '黄仁宇的历史著作，以明万历十五年为切入点讨论晚明政治与制度问题。不同版本的译名、序言和出版信息可能不同；具体史实与论证链条应以所读版本目录和正文为准。'
    },
    '毛泽东选集': {
      aliases: ['毛选', '毛主席选集'],
      source: '预设演示书目（公开简介）',
      summary: '《毛泽东选集》由多卷文章构成，不同卷次与版本的收录范围、编排与出版时间并不相同。展示时应先核对所读卷次、版次和目录，再回到具体文章、段落与形成语境讨论观点。'
    },
    '三体': {
      aliases: ['The Three-Body Problem'],
      source: '预设演示书目（公开简介）',
      summary: '刘慈欣创作的长篇科幻小说。公开简介仅用于确认书目与提出初读问题，情节和人物分析应以所读文本为依据。'
    },
    '人类简史': {
      source: '预设可靠书目（公开简介）',
      summary: '以色列历史学者尤瓦尔·赫拉利的非虚构作品，英文原版于 2011 年出版。从智人演化与历史发展切入，讨论认知革命、农业革命、科学革命以及人类大规模协作的形成。具体论证、例证与版本差异仍应回到所读版本核验。'
    },
    '百年孤独': {
      source: '预设可靠书目（公开简介）',
      summary: '哥伦比亚作家加西亚·马尔克斯创作的长篇小说，西班牙语初版于 1967 年。小说以布恩迪亚家族和马孔多小镇的长期变迁为叙事中心，是拉丁美洲文学的重要作品之一。人物、事件与叙事结构的具体解读应以所读版本为准。'
    },
    '活着': {
      source: '预设可靠书目（公开简介）',
      summary: '中国作家余华创作的长篇小说，围绕普通人福贵的人生经历展开。它常被用于讨论个人命运、家庭关系与生命韧性；具体情节、人物判断和主题阐释应回到所读版本的正文核验。'
    },
    '小王子': {
      source: '预设可靠书目（公开简介）',
      summary: '法国作家安托万·德·圣-埃克苏佩里创作的作品，初版于 1943 年。作品以飞行员与来自小行星的小王子的相遇展开，常被用来讨论关系、责任、想象与成长。不同译本的措辞与译注可能不同，应以所读版本为准。'
    },
    '红楼梦': {
      source: '预设可靠书目（公开简介）',
      summary: '中国古典长篇小说，通常以曹雪芹为主要作者，并与高鹗续写及不同版本的流传讨论相关。小说围绕贾府及其相关人物展开，涉及家族生活、人物关系与社会文化。版本、脂批和具体文本问题需要依据所读版本核验。'
    },
    '西游记': {
      source: '预设可靠书目（公开简介）',
      summary: '中国古典长篇神魔小说，通常与吴承恩的署名相关。作品以唐僧师徒西行取经的旅程为基本框架，长期流传中存在不同版本和研究观点。具体回目、人物和寓意分析应回到所读版本。'
    },
    '三国演义': {
      source: '预设可靠书目（公开简介）',
      summary: '中国古典长篇历史演义小说，通常署名罗贯中。作品以东汉末年至三国时期的历史叙事为基础，结合历史材料与文学演义形成复杂人物和事件线索。历史事实、文学塑造与不同版本内容应分别核验。'
    },
    '水浒传': {
      source: '预设可靠书目（公开简介）',
      summary: '中国古典长篇小说，传统上与施耐庵等作者、编纂问题相关。作品围绕梁山人物与聚义故事展开，具有丰富的人物、社会与叙事线索。作者、版本和具体情节解读应以所读版本及可靠研究资料为准。'
    },
    '原子习惯': {
      source: '预设可靠书目（公开简介）',
      summary: '詹姆斯·克利尔创作的行为改变类作品，英文版于 2018 年出版。它以微小习惯、环境设计、反馈与长期积累为主要讨论入口。书中具体方法、案例与适用条件应回到所读版本核验。'
    },
    '刻意练习': {
      source: '预设可靠书目（公开简介）',
      summary: '安德斯·艾利克森与罗伯特·普尔合著的作品，英文版于 2016 年出版。它围绕专家表现、目标明确的练习、反馈和改进展开讨论。相关研究结论、案例范围与实践条件应参考所读版本及原始研究说明。'
    },
    '终身成长': {
      source: '预设可靠书目（公开简介）',
      summary: '心理学家卡罗尔·德韦克创作的作品，围绕固定型思维与成长型思维的研究和实践展开。不同版本的案例、术语翻译和教育应用可能有差异，应回到所读版本理解具体主张与边界。'
    },
    '如何阅读一本书': {
      source: '预设可靠书目（公开简介）',
      summary: '莫提默·J·艾德勒与查尔斯·范多伦合著的阅读方法作品。它讨论基础阅读、检视阅读、分析阅读和主题阅读等层次，强调阅读目的与书籍类型的匹配。具体方法步骤与示例应以所读版本为准。'
    },
    '原则': {
      source: '预设可靠书目（公开简介）',
      summary: '瑞·达利欧创作的管理与决策类作品，英文版于 2017 年出版。作者结合个人和组织经验讨论原则、决策、反馈与组织文化。案例属于作者经验叙述，应用时需要结合自身情境审慎验证。'
    },
    '从0到1': {
      source: '预设可靠书目（公开简介）',
      summary: '彼得·蒂尔与布莱克·马斯特斯合著的创业与创新类作品，英文版于 2014 年出版。它围绕创新、竞争、垄断、技术创业与未来思考提出观点。具体商业判断应与行业证据和现实条件一起检验。'
    },
    '硅谷钢铁侠': {
      aliases: ['Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future'],
      source: '预设可靠书目（公开简介）',
      summary: '阿什利·万斯撰写的埃隆·马斯克传记，英文版于 2015 年出版。它与沃尔特·艾萨克森所著《埃隆·马斯克传》是不同作品，阅读时应先区分作者、版本与叙事范围，再讨论具体事件。'
    }
  });
  // These are original teaching routes based on public bibliographic facts and
  // widely known work premises. They deliberately avoid pretending to be a
  // replacement for the text, chapter-level evidence, or licensed excerpts.
  const curatedDeepGuides = Object.freeze({
    '夏洛的网': {
      audience: '小学中高年级亲子共读、班级阅读分享或教师试讲',
      orientation: '把“一个朋友帮助另一个朋友”的故事，读成关于看见、承诺、行动与延续的成长练习。',
      opening: '这本书的动人之处，不只在于谁帮助了谁，而在于夏洛如何把一句承诺变成持续的行动；威尔伯又如何在被帮助之后学会守护这份关系。阅读时可以一直追问：真正的友谊，怎样让一个生命重新被看见？',
      lenses: [
        { title: '从“被看见”开始', body: '威尔伯一开始处在弱小、被安排的处境中。费恩的怜惜与谷仓伙伴的接纳，让读者先注意到：关怀的第一步，是不把一个生命当成可被轻易处理的对象。', prompt: '找出故事里“有人认真看见威尔伯”的场景，说明这份看见改变了什么。' },
        { title: '语言怎样成为行动', body: '夏洛没有停留在安慰，她把理解、判断和创造力变成了能影响周围人的行动。这里值得读的不是“蜘蛛织了什么字”，而是语言如何让别人重新理解威尔伯的价值。', prompt: '把夏洛的行动拆成“观察 - 判断 - 创造 - 影响”四步，哪一步最难？' },
        { title: '承诺为什么有重量', body: '夏洛的帮助并不轻松。故事把友谊写得很具体：它包含时间、心力、风险，也包含在对方需要时仍然选择行动。', prompt: '区别“说一句我会帮你”和“真正帮助一次”，需要补上哪些可见行动？' },
        { title: '告别之后如何延续', body: '结尾并没有把关系写成占有，而是把它交给记忆、照料和新的生命。威尔伯的变化，说明被真诚对待过的人，也可能学会成为守护者。', prompt: '威尔伯最后守护的究竟是什么：一只蜘蛛、一个承诺，还是一种对待朋友的方式？' }
      ],
      relationships: [
        '费恩 -> 最初的怜惜与行动：让威尔伯得到被认真对待的机会。',
        '夏洛 -> 承诺与创造：把理解转成能够影响他人的行动。',
        '威尔伯 -> 从被守护到学会守护：完成成长的情感闭环。',
        '谷仓与集市 -> 共同目光：提醒我们，价值也会在群体的重新理解中被建立。'
      ],
      misconception: '不要把它只读成“感人的动物故事”。更值得讨论的是：关怀如何落实为行动，语言怎样改变关系，以及告别后责任如何继续。',
      questions: [
        '夏洛的帮助为什么不是单向施舍，而是一段让双方都改变的关系？',
        '故事中的“赞美”为什么能产生力量？它和空泛夸奖有什么不同？',
        '如果把威尔伯的成长写成一句话，他从“害怕什么”走向了“能够做什么”？',
        '选择一个生活中的小承诺，怎样把它设计成可以被看见的行动？'
      ],
      task: '三分钟课堂分享：用“一个关系变化 + 一个行动证据 + 一个带回生活的承诺”讲述你的理解。结尾不复述情节，而是说出你想怎样成为一个可靠的朋友。',
      extension: '想把导览升级为材料型拆解，可补充你所读版本中任意两段人物对话、一个关键场景或自己的读书笔记；系统会把它们放回这四条主线中核对。'
    },
    '埃隆·马斯克传': {
      audience: '高中生、成人学习者、创业与科技主题共读或教师展示',
      orientation: '把传记读成“人物选择、组织代价与长期目标”之间的张力分析，而不是英雄崇拜或成功技巧清单。',
      opening: '阅读一部人物传记，最有价值的不是收集传奇片段，而是观察一个人如何在不确定、资源约束和高压力下做选择，并同时看见这些选择给团队、关系与组织带来的代价。',
      lenses: [
        { title: '从问题定义开始，而不是从标签开始', body: '传记中的人物常被贴上“天才”“冒险家”或“颠覆者”等标签。更好的读法是回到他面对的具体问题：目标是什么，约束是什么，为什么此刻要这样做。', prompt: '选一个传记中的关键选择，用“目标 - 约束 - 选项 - 后果”替代一个人物标签。' },
        { title: '第一性思考与现实约束', body: '高目标常常来自重新拆分问题；但拆分并不意味着忽略成本、时间、技术边界和协作难度。把“大胆设想”与“可验证步骤”同时写出来，才是可讨论的判断。', prompt: '把一个看似遥远的目标改写为一个两周内可观察的最小验证。' },
        { title: '速度、强度与组织代价', body: '传记能帮助我们看见：高强度推进可能带来突破，也可能给沟通、稳定性和他人带来压力。成熟的阅读不回避这种双面性。', prompt: '为“高强度执行”列一张收益/代价双栏表，并说明什么证据能帮助判断是否值得。' },
        { title: '把传奇改写为可迁移的方法', body: '读完后不必模仿某个人的风格。更可迁移的是：提出一个真实问题，明确关键假设，先做低成本验证，再依据结果调整。', prompt: '从书中提炼一个你愿意在自己学习或项目中试验的小方法，并写下停止条件。' }
      ],
      relationships: [
        '长期愿景 -> 决定问题的尺度，但不能自动保证路径正确。',
        '第一性思考 -> 用于拆解假设，仍需要数据、实验与复盘。',
        '高强度执行 -> 可能提高推进速度，也会重塑团队体验与协作成本。',
        '传记叙事 -> 提供观察样本，不是把复杂人物变成单一成功公式。'
      ],
      misconception: '不要把传记读成“照着做就能成功”的方法书，也不要只做人物褒贬。重点是辨认选择背后的约束、证据与代价。',
      questions: [
        '传记作者如何在成就、争议、关系和组织影响之间安排观察角度？',
        '哪一种“大胆”值得学习，哪一种需要先通过证据和边界条件检验？',
        '当一个领导者追求速度时，如何判断团队承受的代价是否已经过高？',
        '你能否把一个宏大目标改写为可验证、可复盘的下一步？'
      ],
      task: '五分钟圆桌讨论：每组选择一个“高目标”情境，用“愿景、关键假设、最小实验、风险边界”四张卡片提出方案，并说明为什么不把人物神话当作答案。',
      extension: '不同中文译本、译者与章节编排可能不同。补充目录、事件笔记或所读版本页码后，再将具体事件放入“目标 - 约束 - 选择 - 结果”的证据链中。'
    },
    '万历十五年': {
      audience: '中学历史阅读、成人共读、教师试讲或跨学科讨论',
      orientation: '把一个“看似平静的年份”读成观察制度、人物选择与历史叙事方法的窗口。',
      opening: '《万历十五年》最适合引导我们练习一种历史阅读：不要急着用单一人物或单一事件解释复杂时代，而要同时看人物处境、制度运转和作者如何组织材料。',
      lenses: [
        { title: '为什么从一个普通年份切入', body: '书名选择一个看似没有惊天大事的年份，本身就是阅读提示：历史的转折未必只出现在戏剧性事件里，长期结构中的紧张也会在日常运转中显露。', prompt: '如果只寻找“大事件”，我们会错过哪些缓慢发生的制度问题？' },
        { title: '人物不是孤立的英雄或反派', body: '阅读人物时，应同时问：他面对什么位置、规则、资源与限制？这样才能避免把复杂制度问题简化为某个人的品格判断。', prompt: '为一个人物写两栏笔记：“他能主动选择什么”与“他无法单独改变什么”。' },
        { title: '制度如何进入具体生活', body: '制度不是抽象名词，它会通过财政、考核、沟通、权责分配等方式影响人们的行动。阅读时可以把“大制度”翻译成“谁必须向谁负责、靠什么协同、哪里容易失灵”。', prompt: '把一个制度描述改写成一张“角色 - 责任 - 信息 - 阻塞点”关系图。' },
        { title: '区分史实、叙事与解释', body: '历史著作通常同时包含材料、叙述安排和作者解释。好读者会区分：什么是可核对的事实，什么是作者的连接方式，什么是自己需要继续验证的理解。', prompt: '每读一个判断，都给它贴上“事实、解释、待核验”之一的标签。' }
      ],
      relationships: [
        '年份切口 -> 让长期结构问题在具体时点中被观察。',
        '人物处境 -> 连接个人选择与制度限制，避免简单道德化。',
        '制度运转 -> 通过责任、信息与资源的流动影响具体行动。',
        '作者解释 -> 帮助组织问题，但仍需与目录、注释和所读版本互相核对。'
      ],
      misconception: '不要把这本书压缩成某个皇帝或官员“好/坏”的结论。更好的展示是说明：个人选择为何会在制度条件中产生不同后果。',
      questions: [
        '作者为什么不只从“大事件”解释晚明，而要从一个年份和多个人物切入？',
        '当人物意愿与制度规则冲突时，哪一方更能解释事情为何难以改变？',
        '哪些判断是书中材料支持的，哪些是作者的宏观解释？',
        '如果把书中的制度问题换到今天的组织场景，哪些相似处仍需谨慎比较？'
      ],
      task: '历史展示任务：选择一个人物或制度节点，画出“处境 - 约束 - 选择 - 结果”四格图。最后加一张“待核验材料”卡，说明下一步要回到哪一章或哪条注释。',
      extension: '不同版本的序言、注释和章节安排可能不同。补充目录、一个人物章节摘要或自己的读书笔记后，可把这条制度关系图升级为可引用的材料型分析。'
    },
    '毛泽东选集': {
      audience: '教师备课、成人研读或需要进行版本明确的历史文本阅读',
      orientation: '先辨明卷次、篇目与形成语境，再分析问题、概念、论证与历史处境；不把选集标题当作对所有文章的一概而论。',
      opening: '阅读多卷选集时，首先要解决的不是“立刻概括观点”，而是“我现在读的是哪一卷、哪一篇、它回应的是什么问题”。只有把文章放回形成语境和编排位置，讨论才有可核查的起点。',
      lenses: [
        { title: '先建立版本与篇目边界', body: '不同卷次、版次和选编范围可能不同。阅读笔记的第一页应写清卷次、版本、篇名和当前依据的目录，避免把后来选编的信息当作文章写作时的全部语境。', prompt: '为本次阅读建立一张“卷次 - 篇目 - 版本 - 阅读范围”卡片。' },
        { title: '从“文章要解决什么问题”进入', body: '每篇文章都有面对的对象、现实问题和写作任务。与其先背结论，不如先问：它试图回应什么处境？希望读者理解或采取什么行动？', prompt: '用一句不带评价的语言写出“这篇文章首先在处理什么问题”。' },
        { title: '把概念放回论证过程', body: '概念不是孤立口号。应观察作者如何提出判断、给出理由、预设对象，并在何处转向行动建议。这样才能区分文本直接表达与自己的概括。', prompt: '用“问题 - 判断 - 理由 - 指向”四格笔记法整理一个段落。' },
        { title: '历史语境与今天阅读的距离', body: '历史文本可以提供分析方法，但不能跳过时代条件直接套用到今天。成熟的讨论既说明可启发之处，也说明哪些条件已经改变。', prompt: '写出一个“可以借鉴的方法”和一个“不能直接照搬的条件”。' }
      ],
      relationships: [
        '卷次与版本 -> 界定我们正在讨论的文本范围。',
        '历史语境 -> 解释文章为什么在当时提出这个问题。',
        '问题与论证 -> 帮助区分文本直接表达、推理过程与读者概括。',
        '当代阅读 -> 可以学习分析方法，但须标明时代条件与适用边界。'
      ],
      misconception: '不要在未确认卷次、篇目和语境前，直接把选集中的某一句或某一类观点概括为全书结论。版本边界和文本证据是讨论的前提。',
      questions: [
        '当前所读篇目在解决什么具体问题，它的对象与语境是什么？',
        '哪些句子是文本直接表达，哪些是我们依据文本做出的概括？',
        '文章在论证中使用了哪些事实、比较、概念或行动建议？',
        '今天阅读时，哪些分析方法可借鉴，哪些历史条件不能被忽略？'
      ],
      task: '教师展示任务：选定一篇已经确认版本的文章，制作一页“问题 - 语境 - 判断 - 依据 - 待核验”阅读卡。展示时先说明文本边界，再提出解释，不脱离篇目泛化。',
      extension: '请补充具体卷次、版次、篇目、目录或已拥有使用权的书摘。系统会以“问题 - 判断 - 依据 - 语境”结构整理材料，而不会把出版沿革或孤立句子当作整本选集的结论。'
    }
  });
  const quickBibliography = Object.freeze([
    ['夏洛的网', 'E. B. White（E·B·怀特）', '1952'],
    ['埃隆·马斯克传', '沃尔特·艾萨克森', '2023'],
    ['毛泽东选集', '毛泽东', '1951'],
    ['万历十五年', '黄仁宇', '1982'],
    ['人类简史', '尤瓦尔·赫拉利', '2011'],
    ['百年孤独', '加西亚·马尔克斯', '1967'],
    ['三体', '刘慈欣', '2006'],
    ['悉达多', '赫尔曼·黑塞', '1922'],
    ['黑天鹅', '纳西姆·尼古拉斯·塔勒布', '2007'],
    ['活着', '余华', '1992'],
    ['平凡的世界', '路遥', '1991'],
    ['小王子', '安托万·德·圣-埃克苏佩里', '1943'],
    ['城南旧事', '林海音', '1960'],
    ['草房子', '曹文轩', '1997'],
    ['窗边的小豆豆', '黑柳彻子', '1981'],
    ['昆虫记', '让-亨利·法布尔', ''],
    ['海底两万里', '儒勒·凡尔纳', '1870'],
    ['鲁滨孙漂流记', '丹尼尔·笛福', '1719'],
    ['爱的教育', '埃德蒙多·德·亚米契斯', '1886'],
    ['童年', '马克西姆·高尔基', '1913'],
    ['假如给我三天光明', '海伦·凯勒', '1903'],
    ['安徒生童话', '汉斯·克里斯蒂安·安徒生', ''],
    ['西游记', '吴承恩', ''],
    ['红楼梦', '曹雪芹', ''],
    ['水浒传', '施耐庵', ''],
    ['三国演义', '罗贯中', ''],
    ['朝花夕拾', '鲁迅', '1928'],
    ['呐喊', '鲁迅', '1923'],
    ['围城', '钱锺书', '1947'],
    ['追风筝的人', '卡勒德·胡赛尼', '2003'],
    ['解忧杂货店', '东野圭吾', '2012'],
    ['月亮与六便士', '威廉·萨默塞特·毛姆', '1919'],
    ['原子习惯', '詹姆斯·克利尔', '2018'],
    ['刻意练习', '安德斯·艾利克森、罗伯特·普尔', '2016'],
    ['认知觉醒', '周岭', '2020'],
    ['终身成长', '卡罗尔·德韦克', '2006'],
    ['学习之道', '芭芭拉·奥克利', '2014'],
    ['如何阅读一本书', '莫提默·J·艾德勒、查尔斯·范多伦', '1972'],
    ['原则', '瑞·达利欧', '2017'],
    ['精益创业', '埃里克·莱斯', '2011'],
    ['从0到1', '彼得·蒂尔、布莱克·马斯特斯', '2014']
  ].map(([title, author, year]) => ({ title, author, year, source: '快速书目库', ...(curatedBookDetails[title] || {}) })));
  const quickBookAliases = Object.freeze({
    '毛泽东选集': ['毛选', '毛主席选集'],
    '夏洛的网': ['charlottesweb', 'charlotteweb'],
    '埃隆·马斯克传': ['埃隆马斯克传', 'elonmusk']
  });

  function normalizeBookQuery(value) {
    return String(value || '').toLowerCase().replace(/[\s\-_.·,，。:：;；、()（）《》【】\[\]"'“”‘’]/g, '');
  }

  function uniqueBooks(books) {
    const seen = new Set();
    return books.filter((book) => {
      const title = cleanGuideText(book.title, 100);
      const author = cleanGuideText(book.author, 100);
      const key = `${normalizeBookQuery(title)}|${normalizeBookQuery(author)}`;
      if (!title || seen.has(key)) return false;
      seen.add(key);
      book.title = title;
      book.author = author;
      book.year = cleanGuideText(book.year, 12);
      book.source = cleanGuideText(book.source, 40) || '公开书目';
      book.summary = cleanGuideText(book.summary, 900);
      return true;
    }).slice(0, 8);
  }

  function quickBookMatches(query) {
    const normalized = normalizeBookQuery(query);
    return quickBibliography.filter((book) => {
      const title = normalizeBookQuery(book.title);
      const author = normalizeBookQuery(book.author);
      const aliases = [...(quickBookAliases[book.title] || []), ...(book.aliases || [])];
      return title.includes(normalized) || normalized.includes(title) || author.includes(normalized)
        || aliases.some((alias) => normalizeBookQuery(alias).includes(normalized) || normalized.includes(normalizeBookQuery(alias)));
    });
  }

  function findQuickBook(title) {
    const normalized = normalizeBookQuery(title);
    return quickBibliography.find((book) => {
      const bookTitle = normalizeBookQuery(book.title);
      const aliases = [...(quickBookAliases[book.title] || []), ...(book.aliases || [])];
      return bookTitle === normalized || bookTitle.includes(normalized) || normalized.includes(bookTitle)
        || aliases.some((alias) => normalizeBookQuery(alias) === normalized);
    }) || null;
  }

  async function fetchPublicCatalog(url, signal) {
    try {
      const response = await upstreamFetch(url, { method: 'GET', mode: 'cors', signal });
      return response.ok ? response.json() : null;
    } catch (_) {
      return null;
    }
  }

  async function fetchGatewayCatalog(query) {
    if (!gateway) return null;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 4200);
    try {
      return await fetchPublicCatalog(`${gateway}?op=bibliography&q=${encodeURIComponent(query)}`, controller.signal);
    } finally {
      window.clearTimeout(timer);
    }
  }

  function fetchDoubanSuggest(query) {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve(null);
        return;
      }
      const callbackName = `xiaoluBookSuggest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const finish = (value) => {
        window.clearTimeout(timer);
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
        script.remove();
        resolve(value);
      };
      const timer = window.setTimeout(() => finish(null), 3000);
      window[callbackName] = (data) => finish(data);
      script.async = true;
      script.src = `https://book.douban.com/j/subject_suggest?q=${encodeURIComponent(query)}&callback=${callbackName}`;
      script.onerror = () => finish(null);
      document.head.appendChild(script);
    });
  }

  async function searchPublicCatalog(query) {
    const quick = quickBookMatches(query);
    const normalized = normalizeBookQuery(query);
    const exactQuick = quick.filter((book) => {
      const aliases = [...(quickBookAliases[book.title] || []), ...(book.aliases || [])].map(normalizeBookQuery);
      return normalizeBookQuery(book.title) === normalized || aliases.includes(normalized);
    });
    if (exactQuick.some((book) => cleanGuideText(book.summary, 900))) return { books: exactQuick, curated: true };
    const gatewayCatalog = await fetchGatewayCatalog(query);
    if (gatewayCatalog && Array.isArray(gatewayCatalog.books)) {
      const gatewayBooks = uniqueBooks([
        ...quick.map((book) => ({ ...book })),
        ...gatewayCatalog.books.map((item) => ({
          title: item.title,
          author: item.author,
          year: item.year,
          source: item.source || 'public catalog gateway',
          summary: item.summary || ''
        }))
      ].filter((book) => {
        const title = normalizeBookQuery(book.title);
        const author = normalizeBookQuery(book.author);
        return title.includes(normalized) || normalized.includes(title) || author.includes(normalized);
      }));
      if (gatewayBooks.length) return { books: gatewayBooks };
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 4800);
    const encoded = encodeURIComponent(query);
    try {
    const [douban, openLibrary, googleBooks, crossref] = await Promise.all([
        fetchDoubanSuggest(query),
        fetchPublicCatalog(`https://openlibrary.org/search.json?title=${encoded}&limit=8&fields=title,author_name,first_publish_year`, controller.signal),
        fetchPublicCatalog(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encoded}&maxResults=8`, controller.signal),
        fetchPublicCatalog(`https://api.crossref.org/works?query.title=${encoded}&filter=type:book&rows=8`, controller.signal)
      ]);
      const books = quick.map((book) => ({ ...book }));
      (Array.isArray(douban) ? douban : []).forEach((item) => {
        if (item && item.type && item.type !== 'b') return;
        books.push({
          title: item && item.title,
          author: item && (item.author_name || item.author),
          year: item && (item.year || item.pub_year),
          source: '豆瓣公开书目',
          summary: item && (item.intro || item.summary || item.card_subtitle)
        });
      });
      (openLibrary && Array.isArray(openLibrary.docs) ? openLibrary.docs : []).forEach((item) => {
        books.push({
          title: item.title,
          author: Array.isArray(item.author_name) ? item.author_name.slice(0, 2).join('、') : '',
          year: item.first_publish_year ? String(item.first_publish_year) : '',
          source: 'Open Library'
        });
      });
      (googleBooks && Array.isArray(googleBooks.items) ? googleBooks.items : []).forEach((item) => {
        const info = item.volumeInfo || {};
        books.push({
          title: info.title,
          author: Array.isArray(info.authors) ? info.authors.slice(0, 2).join('、') : '',
          year: String(info.publishedDate || '').slice(0, 4),
          source: 'Google Books',
          summary: info.description || ''
        });
      });
      (crossref && crossref.message && Array.isArray(crossref.message.items) ? crossref.message.items : []).forEach((item) => {
        const issued = item && item.issued && Array.isArray(item.issued['date-parts']) ? item.issued['date-parts'][0] : [];
        books.push({
          title: item && Array.isArray(item.title) ? item.title[0] : '',
          author: item && Array.isArray(item.author) ? item.author.slice(0, 2).map((person) => [person.given, person.family].filter(Boolean).join(' ')).join('、') : '',
          year: issued && issued[0] ? String(issued[0]) : '',
          source: 'Crossref'
        });
      });
      const matched = uniqueBooks(books.filter((book) => {
        const title = normalizeBookQuery(book.title);
        const author = normalizeBookQuery(book.author);
        return title.includes(normalized) || normalized.includes(title) || author.includes(normalized);
      }));
      return matched.length
        ? { books: matched }
        : { books: [], message: '未找到匹配书目。你仍可手动填写书名和作者，再导入目录、书摘或笔记生成阅读导览。' };
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function resolveBookMetadata(title, author) {
    const manualAuthor = cleanGuideText(author, 100);
    const known = findQuickBook(title);
    if (known && cleanGuideText(known.summary, 900)) {
      return {
        author: manualAuthor || known.author,
        year: known.year,
        source: known.source,
        summary: cleanGuideText(known.summary, 900)
      };
    }

    const catalog = await searchPublicCatalog(title);
    const normalized = normalizeBookQuery(title);
    const books = Array.isArray(catalog.books) ? catalog.books : [];
    const exact = books
      .filter((book) => normalizeBookQuery(book.title) === normalized)
      .sort((left, right) => cleanGuideText(right.summary, 900).length - cleanGuideText(left.summary, 900).length)[0]
      || books.sort((left, right) => cleanGuideText(right.summary, 900).length - cleanGuideText(left.summary, 900).length)[0]
      || null;
    return exact ? {
      author: manualAuthor || exact.author,
      year: exact.year,
      source: exact.source,
      summary: cleanGuideText(exact.summary, 900)
    } : { author: manualAuthor, source: manualAuthor ? '用户填写' : '', summary: '' };
  }

  function canUseMaterialGuide(status) {
    return status === 502 || status === 503 || status === 504;
  }

  function cleanGuideText(value, limit) {
    return String(value || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, limit || 420);
  }

  function sourceFragments(value) {
    const source = String(value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const lines = source.split(/\n+/).map((item) => cleanGuideText(item, 260)).filter((item) => item.length >= 8);
    const parts = lines.length >= 2 ? lines : (source.match(/[^。！？；\n]+[。！？；]?/g) || []);
    const seen = new Set();
    const merged = [];
    parts.map((item) => cleanGuideText(item, 260)).forEach((item) => {
      if (/^[\u201d\u2019\u300d\u300b]/u.test(item) && merged.length) {
        merged[merged.length - 1] += item;
      } else {
        merged.push(item);
      }
    });
    return merged
      .filter((item) => item.length >= 8)
      .filter((item) => {
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      })
      .slice(0, 6);
  }

  function chapterFragments(value) {
    const source = String(value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const namedSections = source.split(/\n+/)
      .map((item) => item.match(/^\s*([^：:]{2,18})[：:]/))
      .filter(Boolean)
      .map((match) => cleanGuideText(match[1], 60));
    if (namedSections.length >= 2) return namedSections.slice(0, 6);
    const chapters = source.match(/第[一二三四五六七八九十百千万0-9]+[章节][^\n。！？；]{0,56}/g) || [];
    return chapters.map((item) => cleanGuideText(item, 90)).filter(Boolean).slice(0, 6);
  }

  function guideSources(materials) {
    const fragments = sourceFragments(materials);
    const fallback = cleanGuideText(materials, 300);
    return fragments.length ? fragments : (fallback ? [fallback] : ['未提供可整理的材料。']);
  }

  function classifyMaterials(materials) {
    const text = String(materials || '');
    const count = (pattern) => (text.match(pattern) || []).length;
    const editionScore = count(/出版|版本|发行|编纂|再版|初版|第[一二三四五六七八九十0-9]+卷|收入.*文章/g);
    const catalogScore = count(/目录|第[一二三四五六七八九十百千万0-9]+[章节]|chapter\s*\d+|篇目/g);
    const notesScore = count(/读后|笔记|划线|我的理解|我认为|启发|感受|摘录/g);
    if (editionScore >= 2) return 'edition';
    if (catalogScore >= 2) return 'catalog';
    if (notesScore >= 2) return 'notes';
    return 'excerpt';
  }

  function genericMaterialPlan(kind, sources, chapters) {
    const first = sources[0] || '当前材料';
    if (kind === 'catalog') {
      return {
        judgement: '当前输入以目录或篇目结构为主。它能说明全书如何组织问题，但不能替代正文证据。',
        opening: `目录首先呈现的是作者的组织方式，而不是论证本身。建议从“${first.slice(0, 54)}${first.length > 54 ? '...' : ''}”定位一个章节群，再补充相应正文验证。【材料1】 [Ref-1]`,
        points: `- **结构线索**：目录可以显示主题如何展开、转折和收束，但每个章节的具体结论仍需回到正文核验。${chapters.length ? ` 当前可识别的章节线索包括：${chapters.slice(0, 4).join('、')}。` : ''}
- **问题链条**：把章节按“提出问题 - 展开材料 - 转折/反例 - 收束”排序，比逐章复述更能说明全书结构。
- **正文验证**：每提出一个主题判断，至少补一条该章正文书摘或页码，避免把标题当作作者的完整观点。`,
        path: `1. 将目录中的章节按议题或论证功能分组。
2. 为每一组补一条正文证据，并标明出处。
3. 写出章节之间的承接、转折或反例关系。
4. 最后再形成关于全书的解释性结论。`,
        questions: `1. 哪几个章节共同回答同一个问题？
2. 目录中的转折点在哪里，为什么需要这一章？
3. 哪个标题最容易被误读，必须回到正文核验？
4. 你能否用一句话说明全书的论证顺序，而非只罗列篇目？`,
        closing: `1. 用“问题 - 章节群 - 正文证据”概括一个主题。
2. 标出尚未核验的目录推断。
3. 避免仅凭篇目名称概括作者立场。`
      };
    }
    if (kind === 'notes') {
      return {
        judgement: '当前输入以读书笔记、划线或读者感受为主。它适合呈现个人阅读路径，但需要区分原文事实、作者观点和读者延伸。',
        opening: `这份材料首先呈现的是读者如何理解文本。展示时应先交代哪部分来自原文，哪部分是个人判断，再从“${first.slice(0, 54)}${first.length > 54 ? '...' : ''}”进入讨论。【材料1】 [Ref-1]`,
        points: `- **原文与感受分层**：给每条笔记标记“原文信息”“作者判断”或“我的延伸”，避免混为一谈。
- **阅读路径可见**：保留疑问、转折和修正，比只展示结论更能说明真实的阅读过程。
- **结论可回查**：重要判断应补上对应章节、页码或原文摘录，方便他人复核。`,
        path: `1. 先为笔记标注来源类型。
2. 找出反复出现的关键词或问题。
3. 回到原文补足证据与上下文。
4. 将个人感受整理为可讨论的阅读判断。`,
        questions: `1. 这条笔记是原文信息、作者观点还是我的联想？
2. 它需要哪段原文或章节来支持？
3. 是否存在会修正当前感受的反例？
4. 这组笔记最终改变了我对什么问题的理解？`,
        closing: `1. 保留一条已被原文验证的判断。
2. 保留一条尚待核验的联想。
3. 用明确出处把个人感受转化为可交流的阅读成果。`
      };
    }
    return {
      judgement: '当前输入以正文书摘、简介或片段材料为主。它可以支持局部解释，但不能替代全书的论证结构。',
      opening: `本次导览从“${first.slice(0, 54)}${first.length > 54 ? '...' : ''}”这一可核查片段进入。展示时应说明这条片段支持什么判断，以及它还不能说明什么。【材料1】 [Ref-1]`,
      points: `- **局部证据**：先准确说明材料直接陈述了什么，避免用片段替代全书结论。
- **解释边界**：区分文本事实、作者解释与读者迁移理解，三者应分别标注。
- **结构位置**：补充片段所在章节及其前后文，才能判断它是主张、例证、反例还是结论。`,
      path: `1. 标出每段材料的直接信息。
2. 写出由材料支持的最小判断。
3. 补充它所在章节与前后文。
4. 以反例或更多书摘校正初步理解。`,
      questions: `1. 当前材料直接说明了什么？
2. 哪些解释是合理推论，哪些仍需要正文支持？
3. 这段材料在全书中可能承担什么作用？
4. 还需要哪类材料才能检验这个判断？`,
      closing: `1. 用一句可回到材料核验的判断作为结语。
2. 明确这条判断服务于什么阅读目标。
3. 标出仍需补充的目录、正文或反例。`
    };
  }

  function buildCuratedDeepGuide(input, metadata, guide, canonicalTitle) {
    const title = canonicalTitle || cleanGuideText(input.title, 80) || '未命名书籍';
    const author = metadata.author || cleanGuideText(input.author, 100) || '请核对所读版本作者';
    const goal = cleanGuideText(input.goal, 160) || '梳理作品的核心线索与可分享的阅读收获';
    const summary = cleanGuideText(metadata.summary, 900);
    const lensText = guide.lenses.map((lens, index) => `### ${String(index + 1).padStart(2, '0')} ${lens.title}

${lens.body}

**带着这个问题读**：${lens.prompt}`).join('\n\n');
    const relationshipText = guide.relationships.map((item) => `- ${item}`).join('\n');
    const questionsText = guide.questions.map((item, index) => `${index + 1}. ${item}`).join('\n');
    const report = `# 《${title}》深读展示导览

## 阅读名片

- **作者**：${author}
- **书目确认**：${metadata.source || '预设书目'}${metadata.year ? ` · ${metadata.year}` : ''}
- **展示目标**：${goal}
- **适用场景**：${guide.audience}
- **导览类型**：预设书深读版（公开书目信息 + 原创教学问题设计）
- **资料边界**：以下“深读镜头、关系结构、问题与任务”是为课堂和亲子阅读设计的原创学习路线，用来帮助组织阅读，不替代所读版本的目录、正文、注释或受版权保护的全文。

## 一条阅读主线

${guide.orientation}

## 展示开场

${guide.opening}

## 四个深读镜头

${lensText}

## 关系结构

${relationshipText}

## 容易读偏的地方

${guide.misconception}

## 深读问题

${questionsText}

## 课堂 / 分享任务

${guide.task}

## 如何继续升级

${guide.extension}

## 可核查书目起点

${summary ? `${summary}【公开书目摘要1】 [Ref-1]` : '请先核对所读版本的作者、译者、卷次与目录，再补充自己的书摘或笔记。'}`;
    return {
      mode: 'material-guide',
      report,
      chunks: summary ? [{ id: 1, title: '公开书目摘要 01', content: summary }] : [],
      bookMetadata: metadata,
      parsedJSON: {
        book_card: {
          title,
          one_sentence: guide.orientation
        },
        models: guide.lenses.map((lens) => ({
          name: lens.title,
          explanation: lens.body,
          use_case_for_me: lens.prompt
        })),
        assumptions: [{
          assumption: '本导览将预设书的公开书目信息与原创教学路线分开呈现，不把教学问题设计当作原书的逐章总结或引用。',
          why_it_matters: '它让展示内容足够丰富，同时保留回到所读版本、目录和正文核验的阅读边界。'
        }],
        core_ideas: guide.relationships.map((idea) => ({ idea }))
      }
    };
  }

  function catalogAnchor(summary) {
    const sentences = String(summary || '')
      .split(/(?<=[。！？.!?；;])/)
      .map((item) => cleanGuideText(item, 180))
      .filter(Boolean);
    return sentences[0] || cleanGuideText(summary, 180) || '公开书目摘要暂未提供足够的作品简介。';
  }

  function catalogFocus(summary) {
    const source = cleanGuideText(summary, 900);
    const patterns = [
      /从\s*([^。；！？]{2,60}?)\s*(?:切入|展开|出发|谈起|说起)/,
      /(?:围绕|通过|讲述|探讨|呈现|讨论|记录|描绘|介绍|聚焦|揭示)\s*([^。；！？]{4,66})/
    ];
    for (const pattern of patterns) {
      const matched = source.match(pattern);
      if (matched) return matched[1].trim();
    }
    return catalogAnchor(source);
  }

  function buildVerifiedCatalogTalkGuide(input, metadata) {
    const title = cleanGuideText(input.title, 80) || '未命名书籍';
    const author = metadata.author || cleanGuideText(input.author, 100) || '请补充作者以便进一步核对';
    const goal = cleanGuideText(input.goal, 160) || '在直播或课堂中讲清这本书值得从哪里读起';
    const summary = cleanGuideText(metadata.summary, 900);
    const anchor = catalogAnchor(summary);
    const focus = catalogFocus(summary);
    const source = metadata.source || '公开书目';
    const lenses = [
      {
        title: '先把作品的“承诺”讲清',
        body: `公开书目摘要已经确认：${anchor} 直播开场不必急着铺陈所有内容，先用这一句界定作品正在面对的对象、范围或问题，再告诉观众本次分享将沿着“${focus}”进入。这样既有抓手，也不会把摘要之外的细节说成定论。`,
        prompt: `如果只留给观众一个起点，你会怎样用“《${title}》让我先看见……”把这条摘要说得准确又有吸引力？`
      },
      {
        title: '把书名变成一个好问题',
        body: `好的讲书不是重复简介，而是把简介转成一个值得停留的问题。围绕已确认的内容，可以追问：作者为何选择这个对象或视角？它让读者重新理解什么经验、关系或判断？这里提出的是阅读问题，不是假装已经掌握全书答案；它会带着观众回到目录和正文继续寻找证据。`,
        prompt: `把“${focus}”改写成一个不能只用“是/否”回答的问题，并在阅读中标记最能回应它的章节。`
      },
      {
        title: '用“事实、解释、迁移”三层讲解',
        body: `第一层只说可确认事实：本页书目来源明确写了什么；第二层说阅读解释：这些信息可能把读者带向怎样的关注点；第三层才是个人迁移：它与当下学习、家庭、工作或成长有什么连接。三层分开，现场讲解会既有内容密度，也不把自己的感悟误说成作者原意。`,
        prompt: '现场任选一句观点，分别补上“书目摘要依据”“我需要回书核验的地方”“它给我的行动提醒”。'
      },
      {
        title: '把“还没读到”变成下一步路线',
        body: `目前的可靠材料只够建立讲书的骨架，不能替代整本书的情节、论证或章节结论。下一步可优先导入目录，找出作者如何组织问题；再补一段书摘或笔记，说明一个判断如何成立。这样，同一个直播开场可以自然升级为有材料、有推理、有出处的深入分享。`,
        prompt: '为下一次升级准备两项材料：一张目录照片或文字目录，以及一段最想讲的原文或读书笔记。'
      }
    ];
    const relationships = [
      `作者 / 编者「${author}」→ 作品《${title}》：先确认阅读对象，避免同名书、译本或版本混淆。`,
      `公开书目摘要 → 阅读起点：摘要直接支持“${anchor}”这一定位。`,
      `阅读起点 → 直播问题：围绕“${focus}”提出可在目录与正文中继续验证的问题。`,
      `目录、书摘与笔记 → 深入拆解：补足证据后，再形成关于结构、人物或观点的具体判断。`
    ];
    const questions = [
      `从已确认的摘要看，《${title}》最值得优先理解的对象或问题是什么？`,
      '我刚才说的哪一句是书目信息，哪一句是阅读解释，哪一句是个人感受？',
      '如果要让这个分享更有说服力，我最需要回到哪一个章节或哪一段原文？',
      `围绕“${focus}”，我愿意带着观众一起验证的一个问题是什么？`
    ];
    const lensText = lenses.map((lens, index) => `### ${String(index + 1).padStart(2, '0')} ${lens.title}\n\n${lens.body}\n\n**现场推进**：${lens.prompt}`).join('\n\n');
    const report = `# 《${title}》可信讲书版\n\n## 阅读名片\n\n- **作者 / 编者**：${author}\n- **书目确认**：${source}${metadata.year ? ` · ${metadata.year}` : ''}\n- **展示目标**：${goal}\n- **导览类型**：已核验新书可信讲书版（公开书目摘要 + 原创讲解路线）\n- **资料边界**：本页只将“${source}”提供的公开书目信息作为事实依据；讲解镜头、问题和任务是原创教学设计，不替代目录、正文、章节引文或完整书评。\n\n## 一句话讲清\n\n《${title}》可以先从“${focus}”这个入口读起。现场分享时，先用公开摘要确定作品的范围，再用一个好问题邀请观众进入；不追求一次讲完，而是让每个判断都知道下一步该回到哪里核验。\n\n## 可确认的阅读起点\n\n${summary}【公开书目摘要1】 [Ref-1]\n\n## 直播开场\n\n今天我们不急着把《${title}》讲成标准答案。公开书目先给了我们一个可靠起点：${anchor} 接下来我想带大家追问的不是“我能复述多少”，而是“这本书正在把我们带向哪个值得重新理解的问题”。带着这个问题去看目录、书摘和自己的阅读笔记，分享才会从介绍变成真正的阅读。\n\n## 四个讲解镜头\n\n${lensText}\n\n## 关系结构\n\n${relationships.map((item) => `- ${item}`).join('\n')}\n\n## 直播互动问题\n\n${questions.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n\n## 展示收束\n\n1. 先用一句已核验的摘要，说明这本书“读什么”。\n2. 再用一个开放问题，说明这次分享“为什么值得听”。\n3. 最后明确接下来要回到目录或原文验证什么，让观众看见阅读仍在继续。\n\n## 如何升级为材料证据拆解\n\n导入目录后，可建立“问题 - 章节群 - 转折”的结构图；导入书摘或笔记后，可把观点、证据和个人迁移分别标注。只有当具体判断能回到材料时，才把它作为对全书、人物、情节或作者观点的深入结论。`;
    return {
      mode: 'verified-catalog-talk',
      report,
      chunks: [{ id: 1, title: '公开书目摘要 01', content: summary }],
      bookMetadata: metadata,
      parsedJSON: {
        book_card: {
          title,
          one_sentence: `从“${focus}”进入《${title}》，先建立可信起点，再用目录与原文把问题读深。`
        },
        models: lenses.map((lens) => ({
          name: lens.title,
          explanation: lens.body,
          use_case_for_me: lens.prompt
        })),
        assumptions: [{
          assumption: '公开书目摘要可以确认作品定位并支持讲书开场，但不能替代对章节、情节、论证或作者完整观点的核验。',
          why_it_matters: '它让新书分享既有可讲的逻辑和互动，又不会把未经核对的细节包装成事实。'
        }],
        core_ideas: relationships.map((idea) => ({ idea }))
      }
    };
  }

  async function buildMaterialGuide(input) {
    const title = cleanGuideText(input.title, 80) || '未命名书籍';
    const metadata = await resolveBookMetadata(title, input.author);
    const author = metadata.author || '未在公开书目中确认，建议补充作者';
    const goal = cleanGuideText(input.goal, 160) || '梳理当前材料中的阅读线索';
    const userMaterials = String(input.materials || '').trim();
    const curatedBook = findQuickBook(title);
    const curatedGuide = !userMaterials && curatedBook ? curatedDeepGuides[curatedBook.title] : null;
    if (curatedGuide) {
      return buildCuratedDeepGuide(input, metadata, curatedGuide, curatedBook.title);
    }
    const catalogSummary = cleanGuideText(metadata.summary, 900);
    const catalogOnly = !userMaterials && Boolean(catalogSummary);
    if (!userMaterials && !catalogOnly) {
      throw new Error('暂未找到可靠的公开书目摘要。请先从检索结果中选择正确版本，或补充作者、目录、书摘或笔记后再生成导览。');
    }
    if (catalogOnly) {
      return buildVerifiedCatalogTalkGuide(input, metadata);
    }
    const sources = guideSources(userMaterials || catalogSummary);
    const chapters = chapterFragments(userMaterials || catalogSummary);
    const normalizedTitle = normalizeBookQuery(title);
    const isMaoSelected = normalizedTitle === '毛泽东选集' || normalizedTitle === '毛选';
    const materialKind = classifyMaterials(userMaterials || catalogSummary);
    const editionMode = materialKind === 'edition';
    const materialPlan = genericMaterialPlan(materialKind, sources, chapters);
    const chunks = sources.map((content, index) => ({
      id: index + 1,
      title: catalogOnly ? `公开书目摘要 ${String(index + 1).padStart(2, '0')}` : `材料片段 ${String(index + 1).padStart(2, '0')}`,
      content
    }));
    const sourceLabel = catalogOnly ? '公开书目摘要' : '材料';
    const sourceLines = sources.map((content, index) => `- ${content}【${sourceLabel}${index + 1}】 [Ref-${index + 1}]`).join('\n');
    const catalogOnlyJudgement = `当前只取得来自“${metadata.source || '公开书目'}”的书目摘要。它可以用来确认阅读对象、规划初读路线和提出可核验的问题，但不能替代目录、正文书摘或整本书的完整拆解。`;
    const catalogOnlyOpening = `先把“${sources[0].slice(0, 54)}${sources[0].length > 54 ? '...' : ''}”作为公开可核查的起点，再通过目录、书摘或正版阅读补齐论证、情节和章节结构。【公开书目摘要1】 [Ref-1]`;
    const catalogOnlyPoints = `- **先确认对象**：已确认书名、作者和来源后，再开始阅读，避免同名书、不同译本或不同版本混淆。\n- **把摘要当作入口**：公开简介只能说明它明确写出的范围，不能推演未提供的章节、人物、论证或作者立场。\n- **补一条可追溯材料**：导入目录可建立结构线索；导入书摘或笔记可支持局部解释；两者结合后再做深入拆解。`;
    const catalogOnlyPath = `1. 先核对本页作者、年份和书目来源。\n2. 依据公开摘要写下“我准备验证的一个问题”。\n3. 导入目录，标出可能承接这个问题的章节。\n4. 导入一段书摘或笔记后，再将阅读导览升级为材料型拆解。`;
    const catalogOnlyQuestions = `1. 公开摘要直接说明了这本书的什么范围？\n2. 哪些内容仍必须回到目录或正文才能确认？\n3. 我希望通过这本书回答的具体问题是什么？\n4. 下一条应导入的材料是目录、书摘还是自己的笔记？`;
    const catalogOnlyClosing = `当前完成的是可追溯的“初读导览”，不是对整本书的替代性总结。补充目录或书摘后，才能形成关于全书结构和观点的深入拆解。`;
    const editionPoints = `- **先界定资料性质**：当前输入主要是版本与出版沿革，能够帮助确认阅读对象的编纂边界；它本身不能直接证明书中某一思想命题。【材料1】 [Ref-1]
- **再建立版本时间线**：按材料中的版次、出版时间与篇目范围整理，比较不同版本新增、删减或调整的内容；所有具体判断均回到相应材料核验。${sources.slice(0, 3).map((_, index) => ` [Ref-${index + 1}]`).join('')}
- **最后进入正文论证**：阅读某篇文章时，要区分文章形成的历史语境、文章针对的问题与后来的收录版次，避免把编纂信息直接当作正文观点。`;
    const opening = editionMode
      ? `当前输入主要是版本沿革资料。它首先回答“我们读的是哪一版、该版收录了什么范围的文章”，而不是直接回答书中的核心论点。因此展示应先说明版本边界，再用目录和正文建立主题判断。${isMaoSelected ? ' 对《毛泽东选集》而言，尤其要区分文章形成的历史语境与后来选集的编排。' : ''}【材料1】 [Ref-1]`
      : materialPlan.opening;
    const showcasePoints = catalogOnly ? catalogOnlyPoints : (editionMode ? editionPoints : materialPlan.points);
    const outline = catalogOnly ? catalogOnlyPath : (editionMode
      ? `1. 确定本次展示所依据的版次，并列出材料能确认的篇目范围。
2. 以目录为线索，把文章按形成时期、议题或对象分组，而不是只按出版年份罗列。
3. 进入具体文章时，用“问题 - 判断 - 依据 - 语境”四项笔记法核对正文。
4. 比较不同篇章时，明确哪些是文本直接表述，哪些是自己的综合解释。`
      : materialPlan.path);
    const readingQuestions = catalogOnly ? catalogOnlyQuestions : (editionMode
      ? `${isMaoSelected ? '1. 《毛泽东选集》的不同卷次分别覆盖哪些历史阶段和问题，当前材料能确认到什么程度？\n2. 阅读单篇文章时，如何区分写作/发表时的现实问题，与它被收入选集后的编排位置？\n3. 当你概括一个观点时，能否指出对应文章、关键段落和历史语境，而不只引用版本说明？\n4. 还需要补充哪些目录或正文片段，才能对某一主题作出可核查的解释？' : '1. 当前版本资料能够确认哪些版次、时间和收录范围？\n2. 哪些判断必须回到目录或正文才可以成立？\n3. 如何区分文章形成的语境与后来的选编方式？\n4. 还需要补充哪些篇目或书摘，才能建立主题性分析？'}`
      : materialPlan.questions);
    const closing = catalogOnly ? catalogOnlyClosing : (editionMode
      ? `1. 先交代本次使用的版本与材料边界，避免把出版沿革误作正文分析。
2. 选择一篇文章，用“问题 - 判断 - 依据 - 语境”完成一张阅读卡。
3. 只在能回到目录或正文的位置提出解释性结论。`
      : materialPlan.closing);
    const report = `# 《${title}》阅读展示导览

## 阅读名片

- **作者**：${author}
- **书目确认**：${metadata.source || '未确认'}${metadata.year ? ` · ${metadata.year}` : ''}
- **展示目标**：${goal}
- **资料边界**：${catalogOnly ? `以下内容只依据“${metadata.source || '公开书目'}”返回的公开摘要，不替代目录、正文或整本书的完整阅读。` : '以下内容只整理当前已输入的简介、目录或书摘，不替代整本书的完整阅读。'}

## 材料判断

${catalogOnly ? catalogOnlyJudgement : (editionMode ? '当前材料以版本、出版或编纂信息为主。它适合用于界定阅读对象和建立时间线，不能单独推出正文中的思想结论。' : materialPlan.judgement)}

## 展示开场

${catalogOnly ? catalogOnlyOpening : opening}

## 三个展示看点

${showcasePoints}

## 资料原点

${sourceLines}

## 阅读推进路径

${outline}

## 深读问题

${readingQuestions}

## 展示收束

${closing}`;
    return {
      mode: 'material-guide',
      report,
      chunks,
      bookMetadata: metadata,
      parsedJSON: {
        book_card: {
          title,
          one_sentence: catalogOnly ? '基于公开书目摘要建立的初读路线，补充目录或书摘后可升级为深入拆解。' : (editionMode ? '基于版本沿革资料整理的阅读边界与正文进入路径。' : `基于当前 ${sources.length} 条资料线索整理的阅读展示导览。`)
        },
        models: editionMode ? [
          { name: '版本边界', explanation: '先确认本次阅读依据的版次、收录范围与材料性质。', use_case_for_me: '在笔记首页写清“我读的是哪一版、材料能确认什么”。' },
          { name: '语境与编排', explanation: '把文章形成时的现实问题，与后来选集的编排位置分开理解。', use_case_for_me: '每读一篇文章，分别记录形成语境和它在目录中的位置。' },
          { name: '可核查判断', explanation: '解释性结论要能回到具体篇目、段落或目录位置。', use_case_for_me: '给每条观点补上对应篇目和一句原文依据。' }
        ] : sources.slice(0, 3).map((content, index) => ({
          name: `材料线索 ${index + 1}`,
          explanation: content,
          use_case_for_me: '回到对应原文，补充“它说明什么、还不能说明什么”。'
        })),
        assumptions: [{
          assumption: catalogOnly ? '公开书目摘要只能支持初读导览，不能替代全书内容。' : (editionMode ? '版本资料只能界定阅读对象，不能替代正文论证。' : '当前导览只使用已输入材料，不能替代整本书的阅读。'),
          why_it_matters: catalogOnly ? '它避免把简介或出版信息误当成作者的完整观点。' : (editionMode ? '它能避免把出版沿革误当成作品本身的思想结论。' : '它避免把片段理解误当成作者的完整观点。')
        }],
        core_ideas: sources.slice(0, 4).map((idea) => ({ idea }))
      }
    };
  }

  function getVisitorId() {
    let visitor = '';
    try { visitor = localStorage.getItem(visitorStorageKey) || ''; } catch (_) {}
    if (!/^[a-zA-Z0-9_-]{16,128}$/.test(visitor)) {
      visitor = `v_${crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : `${Date.now()}${Math.random()}`.replace(/\D/g, '')}`;
      try { localStorage.setItem(visitorStorageKey, visitor); } catch (_) {}
    }
    return visitor;
  }

  function jsonResponse(payload, status) {
    return Promise.resolve(new Response(JSON.stringify(payload), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    }));
  }

  async function callGateway(action, input) {
    if (!gateway) return { status: 503, payload: { error: 'AI 服务尚未配置' } };
    try {
      const response = await upstreamFetch(`${gateway}/v1/action?op=action`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-AIRead-Visitor': getVisitorId()
        },
        body: JSON.stringify({ action, input })
      });
      return { status: response.status, payload: await response.json().catch(() => ({})) };
    } catch (_) {
      return { status: 502, payload: { error: 'AI 服务暂时不可用，请稍后再试。' } };
    }
  }

  window.getAIReadQuota = async function () {
    if (!gateway) return { configured: false, deepRemaining: 0, followupRemaining: 0 };
    const response = await upstreamFetch(`${gateway}/v1/quota?op=quota`, {
      headers: { 'X-AIRead-Visitor': getVisitorId() }
    });
    return response.json();
  };

  window.searchAIReadBibliography = async function (query) {
    const normalized = cleanGuideText(query, 180);
    if (normalized.length < 2) throw new Error('请输入至少两个字的书名或作者。');
    return searchPublicCatalog(normalized);
  };

  let latestMetadata = null;
  window.fetch = async function (resource, init) {
    const path = typeof resource === 'string' ? resource : (resource && resource.url) || '';
    const endpoint = path.split('?')[0];
    if (!endpoint.includes('/.netlify/functions/')) return upstreamFetch(resource, init);

    let input = {};
    try { input = init && init.body ? JSON.parse(init.body) : {}; } catch (_) {}
    const map = {
      '/v2-generate-report': 'report',
      '/v2-double-debate': 'debate',
      '/v2-strategy-simulator': 'sandbox',
      '/v2-roundtable-chat': 'roundtable',
      '/v2-distill-skill': 'skill',
      '/v2-generate-podcast': 'briefing'
    };
    const target = Object.keys(map).find((suffix) => endpoint.endsWith(suffix));

    if (endpoint.endsWith('/v2-generate-metadata')) {
      if (latestMetadata) return jsonResponse({ parsedJSON: latestMetadata });
      if (!String(input.reportMarkdown || '').trim()) {
        return jsonResponse({ error: '请先完成深度拆书，再生成 Anki 闪卡。' }, 409);
      }
      // The guide already includes structured flashcard metadata.
      return upstreamFetch(resource, init);
    }
    if (!target) return upstreamFetch(resource, init);

    if (materialGuideOnly) {
      if (map[target] === 'report') {
        latestMetadata = null;
        const guide = await buildMaterialGuide(input);
        latestMetadata = guide.parsedJSON;
        return jsonResponse(guide);
      }
      return jsonResponse({ error: '当前为材料阅读导览模式。请先阅读报告、查看引用和闪卡；真实 AI 功能将在模型服务连通后启用。' }, 409);
    }

    const result = await callGateway(map[target], input);
    if (result.status === 429) result.payload.error = exhaustedMessage;
    if (map[target] === 'report' && canUseMaterialGuide(result.status)) {
      latestMetadata = null;
      const guide = await buildMaterialGuide(input);
      latestMetadata = guide.parsedJSON;
      return jsonResponse(guide);
    }
    if (map[target] === 'report' && result.status >= 200 && result.status < 300) {
      latestMetadata = result.payload.parsedJSON || null;
    }
    return jsonResponse(result.payload, result.status);
  };
})();
