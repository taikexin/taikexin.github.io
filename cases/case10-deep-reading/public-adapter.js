/*
 * 小鹿 AI 拆书工坊公开体验适配层。
 * 参考页的页面结构、样式和交互控制器保持不动；这个文件为预设主题书提供稳定的本地资料卡，其他书保留云端阅读服务。
 */
(function () {
  const originalFetch = window.fetch.bind(window);
  const json = (data, status = 200) => Promise.resolve(new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  }));

  const input = init => {
    try { return init && init.body ? JSON.parse(init.body) : {}; } catch (_) { return {}; }
  };

  const text = (value, limit = 160) => String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);

  const excerpts = value => {
    const list = String(value || '')
      .split(/[。！？!?\n]+/)
      .map(item => text(item, 180))
      .filter(item => item.length > 10);
    return list.length ? list : ['未提供足够的可分析材料。'];
  };

  const sourceFragments = value => {
    const lines = String(value || '')
      .replace(/\r\n/g, '\n')
      .split(/\n+/)
      .map(item => text(item, 220))
      .filter(item => item.length > 4);
    const seen = new Set();
    const unique = lines.filter(item => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
    return unique.length ? unique : excerpts(value);
  };

  function bookProfile(title) {
    const name = String(title || '').replace(/\s+/g, '');
    if (!name.includes('万历十五年')) return null;
    return {
      type: 'history',
      core: '黄仁宇以 1587 年这一看似平静的切口，观察晚明国家在财政、军政、文官伦理与制度技术之间逐渐显露的结构性困难。',
      lenses: [
        { name: '制度与个人的张力', explanation: '书中并不把历史归结为某一位人物的品格成败，而是把皇帝、首辅、官僚与将领放回制度边界中理解。', use_case_for_me: '阅读人物章节时，分别标记“个人选择”和“制度允许的空间”。' },
        { name: '财政与行政能力', explanation: '税收、军费、考成与文官体系如何衔接，是理解晚明治理不能只靠道德判断的关键线索。', use_case_for_me: '把目录中的事件放回“资源从哪里来、命令如何执行、责任如何追究”三个问题里。' },
        { name: '道德语言与治理技术', explanation: '当制度缺少足够的技术化、数量化协调手段时，理想化的道德要求往往会放大执行摩擦。', use_case_for_me: '区分书中人物的价值立场，与其所处治理系统实际能够解决的问题。' }
      ],
      questions: [
        '为什么作者选择“万历十五年”这个看似无大事发生的年份作为入口？',
        '张居正之后的制度遗产为何难以仅凭个人意志延续？',
        '万历、申时行、海瑞、戚继光、李贽分别呈现了制度困境的哪一面？',
        '书中“技术性治理不足”的讨论，如何改变我们对历史人物成败的理解？'
      ]
    };
  }

  // These are original teaching guides, not a replacement for copyrighted text.
  // They keep live demonstrations focused on the named book and its public ideas.
  const AI_EDUCATION_BOOKS = Object.freeze([
    {
      id: 'robot-proof',
      title: 'Robot-Proof',
      displayTitle: 'Robot-Proof：人工智能时代的高等教育',
      aliases: ['Robot-Proof', 'Robot Proof', '不被机器替代的教育', '人工智能时代的高等教育', '约瑟夫奥恩'],
      author: 'Joseph E. Aoun（约瑟夫·奥恩）',
      originalTitle: 'Robot-Proof: Higher Education in the Age of Artificial Intelligence',
      positioning: '最适合回应“学 AI 工具，还是培养 AI 素养”的教育讨论。',
      themes: ['AI素养', '创造力', '判断力', '人机协作', '沟通', '行动能力'],
      core: 'Aoun 提出的 Humanics 把教育重点放在数据素养、技术素养与人文素养的联结上：会用工具是起点，能提出问题、理解人、作出判断并采取行动才是教育要守住的部分。',
      lenses: [
        { name: 'Humanics 三层素养', explanation: '用数据素养、技术素养和人文素养一起理解未来能力，而不把“会操作一个新工具”当成终点。', use_case_for_me: '请孩子把一个 AI 回答分别放进“数据、技术、人文”三栏，问一问每一栏还缺什么。' },
        { name: '不可外包的人类能力', explanation: '创造、批判分析、沟通、协作与把想法变成行动，决定了人如何与技术共同完成复杂任务。', use_case_for_me: '把作业从“让 AI 给答案”改为“我怎样验证、改写并负责这份答案”。' },
        { name: '教育目标而非工具清单', explanation: '工具会更新，学习者迁移能力、价值判断和主动性才会留下。', use_case_for_me: '直播时用“今天学会一个按钮，还是学会一种判断？”开启讨论。' }
      ],
      talkingPoints: [
        { heading: '工具能力只是进入 AI 时代的一层', detail: '这本书的框架不是反对技术训练，而是提醒我们不能把教育压缩成软件操作。技术和数据能力需要被人文理解、问题意识与行动能力牵引。' },
        { heading: 'AI 素养的关键是能与技术共同判断', detail: '当答案可以被快速生成，孩子更需要学习追问依据、发现偏差、理解他人处境，并把不同信息整合成自己的方案。' },
        { heading: '创造力不是“想得特别”，而是能把洞见变成有责任的行动', detail: '把好奇、沟通、协作、试验和复盘放回学习过程，孩子才不是技术的被动使用者。' }
      ],
      prompts: ['如果 AI 很快能完成第一稿，学生应该把时间花在哪里？', '数据、技术、人文三种素养，哪一种最容易被课堂忽略？', '怎样设计一次作业，让孩子必须展示自己的判断而非只提交答案？'],
      childAction: '让孩子选一个 AI 生成的建议，写下“我接受什么、修改什么、拒绝什么”，并给出理由。'
    },
    {
      id: 'worlds-i-see',
      title: '我看见的世界：李飞飞自传',
      displayTitle: '我看见的世界：李飞飞自传',
      aliases: ['我看见的世界', '李飞飞传', '李飞飞自传', 'The Worlds I See', 'Fei-Fei Li'],
      author: '李飞飞（Fei-Fei Li）',
      originalTitle: 'The Worlds I See: Curiosity, Exploration, and Discovery at the Dawn of AI',
      positioning: '适合从 AI 科学家的成长、好奇心与人本价值讲“孩子为什么要保持主体性”。',
      themes: ['好奇心', '人本AI', '跨学科', '观察', '伦理', '成长'],
      core: '李飞飞的个人经历提供了一条人本 AI 的阅读路径：技术突破来自长期好奇、观察和跨学科协作，而技术的意义仍要回到人的处境与尊严。',
      lenses: [
        { name: '好奇心先于答案', explanation: '从看见问题、提出问题到长期探索，科学学习不是背诵现成答案。', use_case_for_me: '把“AI 能做什么”改问为“我发现了什么真实问题值得让 AI 帮我研究”。' },
        { name: '从图像识别到看见人', explanation: '技术能力的增长不自动等于价值判断的成熟，人需要持续追问技术影响谁、遗漏谁、服务谁。', use_case_for_me: '让孩子检视一个 AI 输出是否忽略了人的感受、背景或差异。' },
        { name: '跨学科与长期协作', explanation: 'AI 发展不是单一学科的独角戏，需要科学、工程、社会理解和团队协作。', use_case_for_me: '把一个项目分成“观察、技术、表达、伦理”四个角色完成。' }
      ],
      talkingPoints: [
        { heading: '孩子的优势不是比 AI 更快回答', detail: '从这本自传可以引出的重点，是保留对世界的观察、好奇与持续提问；这些能力决定孩子要解决什么问题。' },
        { heading: '人本不是技术的装饰', detail: '理解技术的能力，应与理解人的处境、偏差和责任放在一起培养。' },
        { heading: 'AI 教育可以从真实问题开始', detail: '先让孩子描述想帮助的人和场景，再讨论工具与数据如何参与，而不是先从功能菜单开始。' }
      ],
      prompts: ['AI 能看见图像，但它会不会遗漏人的处境？', '最近一次让你想持续追问的问题是什么？', '一个“对人有帮助”的 AI 项目应该先问什么？'],
      childAction: '从身边选一个小麻烦，先画出“谁受影响、我观察到什么、我还不知道什么”，最后再决定是否使用 AI。'
    },
    {
      id: 'fourth-education-revolution',
      title: '第四次教育革命',
      displayTitle: '第四次教育革命：人工智能如何改变教育',
      aliases: ['第四次教育革命', 'The Fourth Education Revolution', 'Anthony Seldon', '安东尼塞尔登'],
      author: 'Anthony Seldon（安东尼·塞尔登）',
      originalTitle: 'The Fourth Education Revolution: Will Artificial Intelligence Liberate Humanity from the Classroom?',
      positioning: '适合讨论 AI 如何改变学习组织方式，而教育为何仍要守住主动性与创造力。',
      themes: ['教育变革', '个性化学习', '主动性', '创造力', '教师角色', '人机协作'],
      core: '这本书把 AI 看作可能改变学习节奏和支持方式的力量，但教育的价值不应退化为更高效地输送答案，而应释放学习者的主动性、创造力与关系能力。',
      lenses: [
        { name: '个性化不等于个体化', explanation: '技术可以调整节奏和反馈，但学习仍需要同伴、教师和真实世界的关系。', use_case_for_me: '比较“AI 给我的练习”与“我和同伴共同解决的问题”各自带来什么。' },
        { name: '教师角色的升级', explanation: '当信息传递被技术分担，教师更重要的工作是设计问题、支持反思、营造关系与价值边界。', use_case_for_me: '把课堂提问从“答案是什么”改为“你为什么这样判断”。' },
        { name: '把学习者还给学习', explanation: '学习设计应给孩子选择、试错、表达和创造的空间。', use_case_for_me: '每节 AI 相关活动留出一个由孩子自己定义的问题。' }
      ],
      talkingPoints: [
        { heading: '技术的价值在于腾出人做更重要的事', detail: '个性化练习、即时反馈可以节省部分时间，但节省下来的时间应还给讨论、创造、协作和反思。' },
        { heading: 'AI 课堂的标准不是“更炫”，而是“更有学习者主体性”', detail: '孩子能否提出自己的问题、选择路径、解释理由，比是否使用了最新功能更值得检验。' },
        { heading: '教育不能只追求效率', detail: '高效得到答案与真正理解、愿意负责并能和他人共事，是不同的目标。' }
      ],
      prompts: ['AI 节省出来的课堂时间，应该还给什么？', '怎样的个性化学习会让孩子更主动，而不是更依赖？', '教师在 AI 时代最不可替代的三件事是什么？'],
      childAction: '让孩子为同一主题设计两种学习路径：一条由 AI 提供练习，一条包含采访、讨论或创作，再比较收获。'
    },
    {
      id: 'ai-in-education',
      title: '人工智能与教育',
      displayTitle: '人工智能与教育：机遇、挑战与启示',
      aliases: ['Artificial Intelligence in Education', '人工智能与教育', 'AI教育的承诺与启示', 'Wayne Holmes', 'Maya Bialik', 'Charles Fadel'],
      author: 'Wayne Holmes、Maya Bialik、Charles Fadel',
      originalTitle: 'Artificial Intelligence in Education: Promise and Implications for Teaching and Learning',
      positioning: '适合讨论 AI 素养、批判思维、创造力与教育公平，是教师备课的框架型读物。',
      themes: ['AI素养', '批判思维', '伦理', '公平', '创造力', '集体智能'],
      core: '这本书提醒教育者：AI 的承诺必须同时接受教学价值、学习者主体性、伦理与公平的检验；会使用系统只是起点，理解其局限与社会影响同样重要。',
      lenses: [
        { name: 'AI 素养包含理解局限', explanation: '学习者不仅要能使用系统，也要知道数据、模型与输出为什么可能产生偏差或不确定性。', use_case_for_me: '要求孩子为每个 AI 答案标注“我如何核验”。' },
        { name: '批判与创造并行', explanation: '批判思维不是只挑错，而是能比较证据、提出替代方案并做出新的表达。', use_case_for_me: '让孩子把同一问题的两个 AI 答案合成为自己的第三种方案。' },
        { name: '教育公平与责任', explanation: '工具的引入要考虑谁获得支持、谁可能被误判、谁的数据和声音被忽略。', use_case_for_me: '在项目复盘中增加“谁可能没有被考虑到”的一问。' }
      ],
      talkingPoints: [
        { heading: 'AI 素养不是熟练操作', detail: '它还包括理解系统如何影响判断、如何核验输出、何时该拒绝或暂停使用。' },
        { heading: '创造力需要证据和责任', detail: '好的创意不是只追求新奇，而是能说明依据、理解后果并改进方案。' },
        { heading: '教育选择需要问价值问题', detail: '任何“更智能”的方案，都应追问是否真正帮助学习、是否尊重差异、是否可被解释。' }
      ],
      prompts: ['怎样的行为才算孩子具备 AI 素养？', '当 AI 给出看似正确的答案时，孩子如何核验？', '一堂 AI 课怎样同时照顾创造力、公平与责任？'],
      childAction: '建立“AI 输出核验单”：来源、依据、遗漏的人、我的修改、我愿意承担的后果。'
    },
    {
      id: 'teaching-with-ai',
      title: '与 AI 共教',
      displayTitle: '与 AI 共教：人类学习新时代实践指南',
      aliases: ['Teaching with AI', '与AI共教', '与人工智能共教', 'José Antonio Bowen', 'C. Edward Watson'],
      author: 'José Antonio Bowen、C. Edward Watson',
      originalTitle: 'Teaching with AI: A Practical Guide to a New Era of Human Learning',
      positioning: '适合把“AI 出现后怎么设计作业、提问和反馈”落到课堂实践。',
      themes: ['课堂设计', '好问题', '学习过程', '反馈', '判断力', '教师实践'],
      core: '这本实践指南的启发是：当 AI 能轻易产出成品，教学更要看见过程，设计需要选择、解释、比较、修订和反馈的任务。',
      lenses: [
        { name: '从成品转向过程', explanation: '只看最终答案很难判断学习是否发生；任务要让学习者展示选择、推理和修订。', use_case_for_me: '提交作业时同时提交“AI 初稿、我的修改、修改理由”。' },
        { name: '好问题比快答案更稀缺', explanation: 'AI 可以扩展发散，但问题的定义、约束和评价标准仍需人来设定。', use_case_for_me: '先写评价标准，再让 AI 参与生成或改写。' },
        { name: '反馈成为学习核心', explanation: '把 AI 视作可被质疑的陪练，而不是代写者。', use_case_for_me: '让同伴和 AI 分别给反馈，再由孩子说明最终采用哪一条。' }
      ],
      talkingPoints: [
        { heading: 'AI 不是让作业更快完成的捷径', detail: '它倒逼课堂从收答案改为看见思考过程、证据选择和修订能力。' },
        { heading: '要让孩子对最终作品负责', detail: '孩子可以借助 AI 起草，但必须解释自己认可什么、拒绝什么、补充什么。' },
        { heading: '教师设计的是学习条件', detail: '比起教授某个提示词，设计能激活好问题、对话和复盘的任务更可持续。' }
      ],
      prompts: ['AI 能写初稿后，怎样的作业仍然值得做？', '怎样让学生证明“这是我的理解”而不是复制？', '教师该怎样用 AI 把反馈做得更及时？'],
      childAction: '完成一份“三稿作业”：AI 初稿、我的改稿、我的反思稿，每一稿注明变化和理由。'
    },
    {
      id: 'ai-classroom',
      title: 'AI 课堂',
      displayTitle: 'AI 课堂：人工智能教育实践指南',
      aliases: ['The AI Classroom', 'AI课堂', '人工智能教育终极指南', 'Daniel Fitzpatrick', 'Amanda Fox', 'Brad Weinstein'],
      author: 'Daniel Fitzpatrick、Amanda Fox、Brad Weinstein',
      originalTitle: 'The AI Classroom: The Ultimate Guide to Artificial Intelligence in Education',
      positioning: '适合教师把 AI 使用规范、任务设计与学生主动性结合起来。',
      themes: ['课堂实践', '学生主动性', '问题解决', '规范', '创造性任务', '教师支持'],
      core: '这本课堂实践读物的价值在于把 AI 放回具体教学情境：先明确目标和边界，再设计能让学生主动判断、创造和解决真实问题的活动。',
      lenses: [
        { name: '先有学习目标，再选工具', explanation: '工具选择应服务于理解、表达或解决问题的目标，而不能反过来由功能决定课堂。', use_case_for_me: '每次使用前先写“孩子要学会什么”，再决定是否打开 AI。' },
        { name: '透明的使用规范', explanation: '把可以借助 AI 的部分、必须自己完成的部分和需要标注的部分说清楚。', use_case_for_me: '和孩子共同制定一张“AI 协作约定”。' },
        { name: '真实任务中的创造', explanation: '有对象、有约束、有反馈的任务，比让 AI 随机生成作品更能培养能力。', use_case_for_me: '为校园或家庭的一个真实需求制作 AI 协作方案。' }
      ],
      talkingPoints: [
        { heading: '课堂先问“为什么用”，不是“能不能用”', detail: 'AI 的使用要服务于明确的学习目标和评价标准。' },
        { heading: '规范不是限制创造力', detail: '透明边界让孩子知道何时可以求助、何时必须独立判断，也更敢于试错。' },
        { heading: '有真实对象的项目最能培养能力', detail: '孩子为具体的人解决问题时，会自然练习沟通、同理、验证和表达。' }
      ],
      prompts: ['一次好的 AI 课堂活动应该保留哪些“必须由孩子完成”的部分？', '怎样让学生公开说明自己如何使用 AI？', '什么样的真实任务能让 AI 成为创造伙伴？'],
      childAction: '用 AI 协助做一张“校园小问题改善卡”，包含对象、证据、方案、风险和要向谁征求反馈。'
    },
    {
      id: '21-lessons',
      title: '今日简史：人类命运大议题',
      displayTitle: '今日简史：人类命运大议题',
      aliases: ['今日简史', '21 Lessons for the 21st Century', '21 Lessons', 'Yuval Noah Harari', '尤瓦尔赫拉利'],
      author: 'Yuval Noah Harari（尤瓦尔·赫拉利）',
      originalTitle: '21 Lessons for the 21st Century',
      positioning: '适合从信息辨别、适应力与合作能力讨论 AI 时代的公民素养。',
      themes: ['信息辨别', '适应力', '合作', '自我认识', '未来社会', '创造力'],
      core: '这本书可用来引出一个面向未来的学习问题：当信息与算法不断影响选择，人需要保持辨别、学习、协作与重新认识自己的能力。',
      lenses: [
        { name: '信息环境中的辨别', explanation: '面对大量信息与自动化推荐，学习者要练习分辨事实、叙事、情绪和利益。', use_case_for_me: '比较两个来源对同一问题的描述，标出各自证据与立场。' },
        { name: '持续学习与适应', explanation: '未来能力不只是掌握固定知识，而是能在变化中重新学习和合作。', use_case_for_me: '让孩子复盘一次“我原先相信什么，后来为什么调整”。' },
        { name: '技术问题也是人的问题', explanation: '社会如何使用技术，仍要回到价值、制度和人与人的关系。', use_case_for_me: '讨论一个 AI 应用时同时写下“它方便了谁、可能伤害谁”。' }
      ],
      talkingPoints: [
        { heading: 'AI 时代不缺信息，缺的是辨别与理解', detail: '比起快速收集答案，孩子更需要学习判断证据、识别叙事和保留修正自己的能力。' },
        { heading: '未来教育要培养适应力', detail: '孩子要学会在新工具、新协作和新问题出现时继续学习，而非等待标准答案。' },
        { heading: '技术选择包含社会责任', detail: '讨论 AI 时应把个体、群体和长期后果一起纳入。' }
      ],
      prompts: ['当每个人都能得到 AI 答案时，什么能力更稀缺？', '怎样区分信息、观点与情绪操控？', '孩子如何练习在新工具出现时保持主动？'],
      childAction: '做一次“信息三色标注”：绿色是可核验事实，黄色是观点，红色是需要进一步查证的主张。'
    },
    {
      id: 'age-of-ai',
      title: '人工智能时代与人类未来',
      displayTitle: '人工智能时代与人类未来',
      aliases: ['人工智能时代与人类未来', 'The Age of AI', 'Henry Kissinger', 'Eric Schmidt', 'Daniel Huttenlocher', '基辛格'],
      author: 'Henry Kissinger、Eric Schmidt、Daniel Huttenlocher',
      originalTitle: 'The Age of AI and Our Human Future',
      positioning: '适合讨论 AI 如何改变知识、判断与责任，以及人为何需要保持主体性。',
      themes: ['人类主体性', '判断力', '责任', '伦理', '知识', '人机协作'],
      core: '这本书把 AI 放在知识与社会秩序变化的尺度上讨论：系统能生成预测和建议，但价值选择、责任归属与对世界的解释不能被悄悄外包。',
      lenses: [
        { name: '建议不等于判断', explanation: 'AI 可以给出模式识别和建议，人仍需理解情境、价值与后果。', use_case_for_me: '要求孩子在采纳 AI 建议前写下“谁承担后果、我依据什么”。' },
        { name: '知识需要可解释的边界', explanation: '当系统输出难以完全解释时，更需要核验、质疑和多元视角。', use_case_for_me: '把“AI 说的”改写为“我还需要用什么证据确认”。' },
        { name: '主体性来自参与选择', explanation: '教育要让孩子参与定义目标与价值，而不是只接受被优化的路径。', use_case_for_me: '让孩子参与制定 AI 项目的成功标准和停止条件。' }
      ],
      talkingPoints: [
        { heading: 'AI 可以辅助判断，但不能替人承担价值选择', detail: '越是影响他人的建议，越需要人说明依据、权衡和责任。' },
        { heading: '孩子需要学习“对建议说不”', detail: '会质疑、会核验、会提出替代方案，是 AI 素养中非常重要的一部分。' },
        { heading: '人机协作需要清晰分工', detail: '让 AI 负责发散、整理或模拟，让人负责目标、证据、价值和最终决定。' }
      ],
      prompts: ['AI 给出建议时，谁应该为结果负责？', '什么情况下孩子应该拒绝使用 AI 的答案？', '人机协作中，哪些决定必须保留给人？'],
      childAction: '完成一张“AI 建议责任卡”：建议是什么、依据是什么、谁受影响、我的决定、我如何核验。'
    },
    {
      id: 'co-intelligence',
      title: '共智：与 AI 共生共创',
      displayTitle: 'Co-Intelligence：与 AI 共生共创',
      aliases: ['Co-Intelligence', 'Co Intelligence', '共智', '与AI共生共创', 'Ethan Mollick', '伊桑莫利克'],
      author: 'Ethan Mollick（伊桑·莫利克）',
      originalTitle: 'Co-Intelligence: Living and Working with AI',
      positioning: '适合讲清“AI 是协作伙伴，不是代替思考的答案机器”。',
      themes: ['人机协作', '任务分工', '批判使用', '创造力', '主动性', '实践'],
      core: '这本书把生成式 AI 放进真实工作和学习流程：可以把它当作伙伴、教练、创作者和观察者，但人必须保留目标设定、任务判断、核验和最终责任。',
      lenses: [
        { name: '把 AI 当作伙伴而非权威', explanation: '协作意味着来回提问、追问和修订，不是把第一份输出当作结论。', use_case_for_me: '让孩子每次使用后写下“我给了什么任务、AI 帮了什么、我改了什么”。' },
        { name: '任务分工决定学习是否发生', explanation: 'AI 可帮助发散、整理和模拟；人要负责定义问题、判断质量、选择方向与承担后果。', use_case_for_me: '为一个项目画一张“AI 可做 / 我必须做 / 我们共同做”分工表。' },
        { name: '实践中保持怀疑', explanation: '能力来自试用、比较和复盘，也来自知道模型会出错、会迎合、会遗漏。', use_case_for_me: '对同一问题让 AI 给出两种方案，再要求孩子指出差异和需要核验处。' }
      ],
      talkingPoints: [
        { heading: '会协作不等于会依赖', detail: '把 AI 当作可对话的伙伴，能让孩子练习提出更清楚的问题、比较不同方案和表达自己的选择。' },
        { heading: '人要保留任务的方向盘', detail: '工具可以参与执行，但“为什么做、为谁做、好不好、要不要继续”仍需由人判断。' },
        { heading: '每一次 AI 使用都应产生复盘', detail: '真正的能力不是得到一次漂亮输出，而是看懂这次协作怎样帮助了自己、又留下哪些风险。' }
      ],
      prompts: ['AI 是你的助手、同伴还是权威？三者有什么不同？', '一个学习任务中，哪些环节绝不能外包给 AI？', '怎样证明你是在与 AI 协作，而不是替它复制？'],
      childAction: '选一个小项目，交付“任务分工表 + AI 初稿 + 我的改稿 + 一条复盘”，说明最后的决定为什么由自己作出。'
    },
    {
      id: 'ai-2041',
      title: 'AI 2041：预见10个未来',
      displayTitle: 'AI 2041：预见10个未来',
      aliases: ['AI 2041', 'AI2041', '预见10个未来', '李开复', '陈楸帆', 'Kai-Fu Lee', 'Chen Qiufan'],
      author: '李开复、陈楸帆',
      originalTitle: 'AI 2041: Ten Visions for Our Future',
      positioning: '适合把 AI 未来讨论从“酷炫技术”带向社会影响、同理心和公共选择。',
      themes: ['未来想象', '社会影响', '伦理', '同理心', '公共讨论', 'AI素养'],
      core: '这本书通过科技叙事与解释，把 AI 的可能性放回具体生活：技术能力会改变工作、关系与制度，孩子需要的不只是预测未来，更是理解不同人会如何被影响。',
      lenses: [
        { name: '用故事看见技术的后果', explanation: '未来情境能帮助学习者从“技术能做什么”转向“它会改变谁的选择和生活”。', use_case_for_me: '每次讨论一个 AI 功能时，补问“谁会受益、谁可能承担代价”。' },
        { name: '可能性不等于必然性', explanation: '技术趋势包含选择和分歧，社会规则、商业目标和人的行为都会改变结果。', use_case_for_me: '让孩子为同一技术写出乐观版和风险版两个未来故事。' },
        { name: '同理心是未来素养', explanation: '理解自己之外的生活处境，才能参与关于技术的公共讨论。', use_case_for_me: '在方案设计中明确一个最可能被忽略的人，并为其补一项保护。' }
      ],
      talkingPoints: [
        { heading: '未来教育不是训练孩子猜中技术热点', detail: '更重要的是练习从多方立场理解技术影响，并提出负责任的选择。' },
        { heading: '科幻叙事可以成为伦理讨论的入口', detail: '故事让抽象议题落在具体人物身上，孩子更容易看到便利和代价并存。' },
        { heading: 'AI 素养需要公共视角', detail: '孩子要学会问：谁制定规则、数据从哪里来、谁能提出异议、我们如何修正。' }
      ],
      prompts: ['一项 AI 技术的“好未来”和“坏未来”分别由什么选择造成？', '如果你是故事里的普通人，最希望拥有哪一项权利？', '技术讨论为什么需要同理心，而不仅是工程知识？'],
      childAction: '为一个 AI 应用画双线未来图：左边写它解决的问题，右边写它可能带来的不公平，并补上一个保护规则。'
    },
    {
      id: 'life-3',
      title: '生命3.0：人工智能时代的人类',
      displayTitle: '生命3.0：人工智能时代的人类',
      aliases: ['Life 3.0', 'Life3.0', '生命3.0', '人工智能时代的人类', 'Max Tegmark', '迈克斯泰格马克'],
      author: 'Max Tegmark（迈克斯·泰格马克）',
      originalTitle: 'Life 3.0: Being Human in the Age of Artificial Intelligence',
      positioning: '适合带主讲老师讨论 AI 风险、长期未来和“人想成为什么样的人”。',
      themes: ['AI风险', '未来社会', '价值选择', '长期思考', '治理', '人的意义'],
      core: '这本书邀请读者把 AI 看作长期的文明选择：技术能力增长越快，越需要先讨论价值目标、控制边界和我们希望怎样共同生活。',
      lenses: [
        { name: '先问目标，再谈能力', explanation: '技术是否强大不等于它自动朝向好的结果，目标设定和约束设计才是关键。', use_case_for_me: '让孩子为每个 AI 项目写“我希望它帮助什么、绝不伤害什么”。' },
        { name: '长期后果需要现在练习', explanation: '未来问题并非遥远话题，隐私、偏见、自动化依赖都可以从今天的小选择开始讨论。', use_case_for_me: '为一次 AI 使用做“今天便利 / 长期影响”双栏笔记。' },
        { name: '不确定中仍要作价值判断', explanation: '没有人能精确预测未来，但人可以练习识别风险、比较方案、保留修正空间。', use_case_for_me: '让孩子提出一个“如果结果变坏怎么办”的停止条件。' }
      ],
      talkingPoints: [
        { heading: 'AI 教育应包含长期思考', detail: '孩子不仅要知道怎样使用系统，也要习惯追问这项使用会累积出怎样的社会和个人后果。' },
        { heading: '不确定不等于不作为', detail: '面对未知，最好的训练是提出不同情景、设定保护边界、不断根据证据修正。' },
        { heading: '技术讨论最终回到人的价值', detail: '效率、便利和竞争之外，教育还要帮助孩子说清什么值得保护、什么不能牺牲。' }
      ],
      prompts: ['一项 AI 技术最值得先写下的“不能做什么”是什么？', '面对不确定的未来，孩子可以练习哪三种判断？', '“技术更强”为什么不等于“生活更好”？'],
      childAction: '写一份小小的“未来技术约定”：我希望 AI 帮助什么、我要保留什么权利、出现什么情况就暂停使用。'
    },
    {
      id: 'coming-wave',
      title: '浪潮将至',
      displayTitle: '浪潮将至：技术、权力与人类未来',
      aliases: ['The Coming Wave', 'Coming Wave', '浪潮将至', 'Mustafa Suleyman', 'Michael Bhaskar', '穆斯塔法苏莱曼'],
      author: 'Mustafa Suleyman、Michael Bhaskar',
      originalTitle: 'The Coming Wave: Technology, Power, and the Twenty-First Century’s Greatest Dilemma',
      positioning: '适合把 AI 讨论推进到技术治理、权力边界与公共规则。',
      themes: ['技术治理', '权力', '公共规则', '责任', '风险', '社会选择'],
      core: '这本书的讨论提示我们：能力很强的技术会扩大机会，也会放大权力和风险；教育应让孩子懂得技术不是中性的按钮，而是需要规则、监督和公共责任的力量。',
      lenses: [
        { name: '能力扩张伴随责任扩张', explanation: '系统越能影响更多人，就越需要更明确的安全、解释和问责机制。', use_case_for_me: '让孩子为一个 AI 功能写出“影响范围”和“责任人”两栏。' },
        { name: '规则是创新的一部分', explanation: '好的规则不是只在事后限制，而是在设计之初就保护人、降低不可逆伤害。', use_case_for_me: '在做项目方案时加入“上线前必须通过的三条安全检查”。' },
        { name: '公共问题需要多方参与', explanation: '技术发展不该只由开发者或公司决定，使用者、受影响者、教育者和社会都应有声音。', use_case_for_me: '组织角色辩论：开发者、学生、家长、教师各自担心什么、要求什么。' }
      ],
      talkingPoints: [
        { heading: 'AI 素养也包含理解权力', detail: '孩子要看见谁设计系统、谁拥有数据、谁被影响，才不会把技术结果当成天然正确。' },
        { heading: '规则不是创造力的对立面', detail: '清晰边界能让创新更值得信任，也能保护最容易被忽略的人。' },
        { heading: '公共讨论是未来能力', detail: '能倾听不同立场、提出可执行规则、在分歧中寻找保护方案，是 AI 时代的重要公民能力。' }
      ],
      prompts: ['谁应该参与决定学校如何使用 AI？', '怎样的规则能让创新更安全，而不是更慢？', '一个系统造成伤害时，责任应如何被看见？'],
      childAction: '为班级设计一份 AI 使用公约，至少写清“允许什么、需要说明什么、谁可以提出异议、出现问题怎么办”。'
    },
    {
      id: 'deep-learning-revolution',
      title: '深度学习革命',
      displayTitle: '深度学习革命',
      aliases: ['The Deep Learning Revolution', '深度学习革命', 'Terrence Sejnowski', '特伦斯谢诺夫斯基'],
      author: 'Terrence J. Sejnowski（特伦斯·谢诺夫斯基）',
      originalTitle: 'The Deep Learning Revolution',
      positioning: '适合用 AI 科学史帮助孩子理解“模型怎样学习、又为什么会有限制”。',
      themes: ['AI基础', '科学史', '神经网络', '数据', '模型局限', '好奇心'],
      core: '这本书可作为 AI 基础理解的入口：深度学习不是魔法，它依赖数据、训练、计算和长期科学协作；理解它的能力边界，才能减少神化和恐惧。',
      lenses: [
        { name: '技术突破来自长期积累', explanation: 'AI 进展由研究问题、数据、算法、硬件和团队协作共同推动，不是一夜之间出现的奇迹。', use_case_for_me: '让孩子把一次“聪明回答”拆成可能需要的数据、规则和训练。' },
        { name: '模式识别不等于理解世界', explanation: '模型擅长从大量例子找规律，但可能缺少情境、常识和价值判断。', use_case_for_me: '让孩子找一个 AI 容易误解的生活场景，并解释缺了什么背景。' },
        { name: '科学素养包含可解释的怀疑', explanation: '理解基本原理后，孩子更能提出“它从什么数据学来、在哪些情况下会失效”。', use_case_for_me: '每次用 AI 都问一句“这条结论可能在哪些条件下不成立？”' }
      ],
      talkingPoints: [
        { heading: '不必把 AI 神化成全知大脑', detail: '理解训练、数据和模式识别，能让孩子既欣赏技术力量，也保留必要的判断。' },
        { heading: '科学学习的核心是追问机制', detail: '比记住术语更重要的是会问：它怎样工作、依据什么、在哪儿可能失败。' },
        { heading: '技术史能保护好奇心', detail: '看到许多突破来自试错和协作，孩子会更愿意把自己看成可以参与提问和创造的人。' }
      ],
      prompts: ['AI 为什么会“看起来懂了”，却仍然可能犯常识错误？', '一个模型要学习某项能力，大致需要哪些条件？', '理解技术原理怎样帮助我们少一点盲从？'],
      childAction: '做一张“AI 不会魔法”解释卡：它看到了什么数据、找到了什么规律、还缺什么人类背景。'
    },
    {
      id: 'ai-for-educators',
      title: '面向教育者的 AI',
      displayTitle: 'AI for Educators：面向教育者的实践指南',
      aliases: ['AI for Educators', '面向教育者的AI', '教育者AI', 'Matt Miller', 'Holly Clark'],
      author: 'Matt Miller、Holly Clark',
      originalTitle: 'AI for Educators',
      positioning: '适合主讲老师把 AI 从演示工具变成有目标、有边界的课堂设计。',
      themes: ['教师实践', '课堂策略', '学习目标', '反馈', '差异化', '责任'],
      core: '这类教育者实践指南的核心提醒是：AI 应先服务于清晰的学习目标和教师判断，再帮助差异化支持、生成反馈和优化准备工作。',
      lenses: [
        { name: '目标先于工具', explanation: '不是因为 AI 能做就使用，而是先确定学生要理解、表达或练习什么。', use_case_for_me: '教案第一行先写学习证据，再决定 AI 介入哪个环节。' },
        { name: '差异化支持而非差异化降低', explanation: 'AI 可以提供不同难度、不同表达方式的支架，但不能替孩子降低思考要求。', use_case_for_me: '为同一目标设计基础、进阶、挑战三种提示，而非三份不同答案。' },
        { name: '教师仍是学习的设计者', explanation: '反馈是否合适、任务是否公平、学生是否真正理解，都需要教师依据现场观察判断。', use_case_for_me: '把 AI 生成材料视为备选，保留教师审核与学生反馈环节。' }
      ],
      talkingPoints: [
        { heading: '课堂使用 AI 的第一问是学习目标', detail: '只有当工具能帮助学生更好地理解、练习、表达或获得反馈时，它才值得进入课堂。' },
        { heading: '差异化支持不等于把难题变简单', detail: '好的支架保留思考的核心，让不同孩子以不同路径接近同一能力。' },
        { heading: '教师的专业判断更重要了', detail: 'AI 可以节省准备时间，但不能取代对学生状态、关系和公平性的现场判断。' }
      ],
      prompts: ['一项 AI 课堂活动的学习证据应该是什么？', '怎样让 AI 支持不同孩子，而不替他们把思考做完？', '教师审核 AI 输出时最该检查哪三件事？'],
      childAction: '让孩子体验同一任务的三种提示支持，并在最后说明“哪一种帮助了我、我仍需自己完成什么”。'
    },
    {
      id: 'extended-mind',
      title: '延展心智',
      displayTitle: '延展心智：在工具与他人中思考',
      aliases: ['The Extended Mind', 'Extended Mind', '延展心智', 'Annie Murphy Paul', '安妮墨菲保罗'],
      author: 'Annie Murphy Paul（安妮·墨菲·保罗）',
      originalTitle: 'The Extended Mind: The Power of Thinking Outside the Brain',
      positioning: '适合把 AI 放回更宽广的学习生态，讲清工具、身体、环境与同伴如何共同支持思考。',
      themes: ['学习科学', '工具', '协作', '环境', '身体', '元认知'],
      core: '这本书可帮助主讲老师避免把 AI 看成唯一的“聪明来源”：人的思考本来就会借助身体、环境、纸笔、图像和他人，关键是学会选择工具并觉察自己如何思考。',
      lenses: [
        { name: '工具能延展思考，但不能代替主体', explanation: '纸笔、图示、同伴和 AI 都能成为外部支架，前提是学习者知道自己在借助什么。', use_case_for_me: '让孩子比较“只在脑中想、画图想、和 AI 对话想”的不同收获。' },
        { name: '环境会塑造注意力与创造', explanation: '好的学习不只发生在屏幕前，身体活动、空间安排和真实材料同样影响理解。', use_case_for_me: '为一个 AI 项目加入离屏观察、手绘和同伴讨论环节。' },
        { name: '元认知让工具真正有用', explanation: '能察觉自己什么时候卡住、工具有没有帮助、何时需要换一种方式，是可迁移的能力。', use_case_for_me: '每次完成任务后记录“我用了什么支架、哪一步最有效、下次如何调整”。' }
      ],
      talkingPoints: [
        { heading: 'AI 只是思考生态中的一种工具', detail: '教育的目标不是让孩子离不开某个工具，而是帮助他们选择、组合和评估不同的思考支架。' },
        { heading: '深度学习需要离开屏幕', detail: '观察、走动、手绘、讨论和制作能给 AI 对话提供更真实的经验与问题。' },
        { heading: '会反思自己的学习，才能真正驾驭工具', detail: '孩子知道自己为何使用 AI、何时该停下来换方法，才拥有学习的主动权。' }
      ],
      prompts: ['什么时候 AI 是好支架，什么时候纸笔或同伴更有效？', '为什么好的学习不能只发生在屏幕里？', '怎样帮助孩子看见自己的思考过程？'],
      childAction: '完成一次“三种支架”挑战：先独立想、再画图或动手、最后与 AI 对话，并写下每一步带来的新发现。'
    }
  ]);

  const normalizeCuratedTitle = value => String(value || '')
    .toLowerCase()
    .replace(/[《》:：,，。.!！?？·\s_-]/g, '');

  function curatedProfile(title) {
    const name = normalizeCuratedTitle(title);
    if (!name) return null;
    return AI_EDUCATION_BOOKS.find(profile => profile.aliases.some(alias => {
      const normalizedAlias = normalizeCuratedTitle(alias);
      return normalizedAlias && (name.includes(normalizedAlias) || normalizedAlias.includes(name));
    })) || null;
  }

  function isAIEducationQuestion(data) {
    const query = `${data.title || ''}\n${data.goal || ''}\n${data.background || ''}`;
    return /(AI|人工智能|生成式|工具|素养|创造|创意|判断|批判|人机|伦理|主体|教育|课堂|孩子|学生|学习)/i.test(query);
  }

  function matchedThemes(profile, data) {
    const query = `${data.goal || ''}\n${data.background || ''}\n${data.materials || ''}`.toLowerCase();
    const matches = profile.themes.filter(theme => query.includes(theme.toLowerCase()));
    if (/(工具|软件|提示词|操作)/.test(query) && !matches.includes('AI素养')) matches.unshift('AI素养');
    if (/(孩子|学生|课堂|教学|学习)/.test(query) && !matches.includes('教育目标')) matches.push('教育目标');
    return [...new Set(matches)].slice(0, 4);
  }

  function curatedStructure(profile, data) {
    const query = text(data.goal, 180) || '理解这本书如何回应 AI 时代的学习与成长';
    return {
      book_card: { title: profile.displayTitle, one_sentence: profile.core },
      models: profile.lenses.map(lens => ({ name: lens.name, explanation: lens.explanation, use_case_for_me: lens.use_case_for_me })),
      assumptions: [
        { assumption: '主题资料卡用于建立阅读与讲解路线，不等同于书中逐章原文。', why_it_matters: '避免把原创导览误说成作者的直接引语或指定版本的章节结论。' },
        { assumption: '书名与问题匹配后，仍应回到所读版本核验具体段落。', why_it_matters: '不同版本、译本和读者关注点会影响可引用的文本证据。' },
        { assumption: 'AI 工具训练应服务于更长远的学习目标。', why_it_matters: '这样才能把“会用”转化为判断、创造、沟通与负责的能力。' }
      ],
      core_ideas: profile.talkingPoints.map(point => ({ idea: `${point.heading}：${point.detail}` })),
      question: query
    };
  }

  function curatedChunks(profile, data) {
    const materialChunks = sourceFragments(data.materials).filter(item => item !== '未提供足够的可分析材料。').slice(0, 4);
    const guideChunks = profile.talkingPoints.map((point, index) => ({
      id: index + 1,
      title: `主题资料卡 ${String(index + 1).padStart(2, '0')}：${point.heading}`,
      content: point.detail,
      kind: 'original-teaching-guide'
    }));
    const sourceChunks = materialChunks.map((content, index) => ({
      id: guideChunks.length + index + 1,
      title: `用户提供材料 ${String(index + 1).padStart(2, '0')}`,
      content,
      kind: 'user-material'
    }));
    return [...guideChunks, ...sourceChunks];
  }

  function curatedReport(data, profile) {
    const query = text(data.goal, 220) || 'AI 时代孩子最该培养什么？';
    const themes = matchedThemes(profile, data);
    const supplied = sourceFragments(data.materials).filter(item => item !== '未提供足够的可分析材料。').slice(0, 3);
    const context = themes.length ? `本次问题最关心：${themes.join('、')}。` : '本次可从 AI 素养、创造力、判断力与人的主体性展开。';
    const points = profile.talkingPoints.map((point, index) => `### ${index + 1}. ${point.heading}\n\n${point.detail}`).join('\n\n');
    const prompts = profile.prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n');
    const materialSection = supplied.length
      ? `## 06. 你提供材料中的可核验线索\n\n${supplied.map((item, index) => `- **材料 ${index + 1}**：${item}[Ref-${index + 4}]`).join('\n')}\n\n这些材料可以作为下一轮“材料证据拆解”的起点；请标明目录、页码或笔记来源，再判断它们与上面的主题是否真正对应。`
      : `## 06. 如何升级为材料证据拆解\n\n请补充任一项：目录、一个章节标题、两段书摘或自己的读书笔记。系统会把上面的主题导览改为“你的材料 - 作者论证 - 你的观点”三栏对照，避免把导览当作原文引用。`;
    return `# 《${profile.displayTitle}》AI 教育主题拆书

> **作者**：${profile.author}
> **原书名**：${profile.originalTitle}
> **本次提问**：${query}
> **导览定位**：${profile.positioning}
> **内容类型**：原创主题资料卡与讲解路线，不是该书的逐章摘要、页码引用或直接引语。

## 01. 先给老师的回应

${profile.core}

${context} 因此，这个问题不该被讲成“AI 工具没有用”，而应讲成：**工具训练要服务于更大的教育目标。孩子既要会使用技术，也要能提出好问题、核验依据、理解他人、创造表达，并为自己的判断负责。**

## 02. 这本书中可与观点对话的三条线

${points}

## 03. 把它讲得更准确

- 可以说：**“这本书提供了一个把技术、数据与人文能力放在一起理解的教育框架。”**
- 不要说：**“书中某一页原话就是‘学工具不重要’。”** 这会把原创导览误当作直接引文。
- 更好的追问是：**“当 AI 能很快给出答案，孩子还需要展示哪些人类能力，才能把答案变成自己的理解和行动？”**

## 04. 直播可直接使用的 90 秒讲法

“很多家长问，孩子是不是要赶紧把每个 AI 工具都学会？《${profile.displayTitle}》给我的提醒是：工具当然要会用，但教育不能停在工具层。${profile.core} 所以我更关注孩子能不能问出自己的问题，能不能核验 AI 的回答，能不能把不同观点组织成自己的表达，并且愿意为最后的决定负责。这样，AI 才是放大孩子能力的伙伴，而不是替孩子思考的拐杖。”

## 05. 把观点变成孩子的一次行动

**活动建议**：${profile.childAction}

**直播互动问题**：

${prompts}

${materialSection}

## 07. 资料边界与回书核验

本报告依据该书的公开书目信息与原创教学导览生成，刻意不编造章节、页码或原文引语。正式引用时，请回到你手中的译本核对目录、章节和措辞；补充书摘后，才能把“主题相近”进一步升级为“材料可追溯”。`;
  }

  function isHistoricalReading(title, materials) {
    return Boolean(bookProfile(title)) || /(历史|朝代|皇帝|帝国|战争|王朝|官僚|明朝|清朝|宋朝|唐朝|万历)/.test(`${title || ''}\n${materials || ''}`);
  }

  function extractChapters(materials) {
    return sourceFragments(materials)
      .map(item => item.replace(/^(第[一二三四五六七八九十百0-9]+[章节]|chapter\s*\d+)[：:、.\s-]*/i, '').trim())
      .filter(item => item.length > 1)
      .slice(0, 8);
  }

  function structure(data) {
    const title = text(data.title, 50) || '未命名书籍';
    const goal = text(data.goal, 96) || '理解书中的核心内容、观点和方法';
    const curated = curatedProfile(title);
    if (curated) return curatedStructure(curated, data);
    const source = sourceFragments(data.materials || data.reportMarkdown);
    const profile = bookProfile(title);
    const historical = isHistoricalReading(title, data.materials || data.reportMarkdown);
    return {
      book_card: { title, one_sentence: profile ? profile.core : `围绕“${goal}”，从你提供的目录与书摘中梳理论题、证据线索和待验证的理解。` },
      models: profile ? profile.lenses : [
        { name: historical ? '历史问题的多重尺度' : '中心论题与材料证据', explanation: historical ? '把人物、事件和制度背景同时放入观察，避免只用单一人物评价解释复杂历史。' : '先区分作者想回答的问题、材料中直接出现的证据，以及读者进一步的解释。', use_case_for_me: `用“这段材料说明什么、还不能说明什么”复述“${source[0].slice(0, 38)}”。` },
        { name: historical ? '人物处境与制度边界' : '章节之间的逻辑线', explanation: historical ? '人物的选择需要结合其资源、职位、规则与时代条件理解。' : '目录不是并列清单，要追踪章节如何共同推进同一个问题。', use_case_for_me: '为每个章节写下它提出的问题、提供的材料和与前一章的连接。' },
        { name: '证据与解释的区分', explanation: '把书中的事实叙述、作者解释和自己的联想分开记录，阅读结论才可追溯。', use_case_for_me: '每条笔记标明“原文信息”“作者判断”或“我的问题”。' }
      ],
      assumptions: profile ? [
        { assumption: '不能只用个别人物的道德评价解释晚明治理困境。', why_it_matters: '这会遮蔽财政、行政和制度协调等更深层因素。' },
        { assumption: '目录中的人物章节需要互相对照，而不是孤立阅读。', why_it_matters: '对照才能看见同一制度在不同位置上的限制与代价。' },
        { assumption: '作者的历史解释应与具体叙事和材料线索相互核对。', why_it_matters: '这样才能区分作者观点与读者自己的延伸理解。' }
      ] : [
        { assumption: '目录与书摘只能支持有限结论，不能替代整本书的完整论证。', why_it_matters: '它能避免从片段推断作者没有提出的观点。' },
        { assumption: '一条好笔记应能回到具体章节或原文线索。', why_it_matters: '这样复习时可以检验自己的理解是否可靠。' },
        { assumption: '阅读目标会影响关注重点，但不能改写材料本身的意思。', why_it_matters: '它让个人收获和文本证据保持清晰边界。' }
      ],
      core_ideas: source.slice(0, 4).map(idea => ({ idea }))
    };
  }

  function report(data) {
    const title = text(data.title, 50) || '未命名书籍';
    const goal = text(data.goal, 100) || '理解书中的核心内容、观点和方法';
    const curated = curatedProfile(title);
    if (curated) return curatedReport({ ...data, goal }, curated);
    const source = sourceFragments(data.materials);
    const chapters = extractChapters(data.materials);
    const profile = bookProfile(title);
    if (profile) {
      const outline = chapters.length ? chapters.map((chapter, index) => `${index + 1}. ${chapter}`).join('\n') : '未识别出清晰的目录标题，请结合书摘逐段阅读。';
      return `# 《${title}》阅读拆解报告

> **阅读目标**：${goal}
> **材料边界**：以下分析以你提供的目录/书摘为线索；历史框架用于帮助定位问题，不把目录之外的细节当作已给材料中的事实。

## 01. 一句话理解

**${profile.core}** 读这本书的重点不是给某位人物下成败评语，而是追问：当个人处在一套资源、规则与价值要求彼此牵制的制度中，他还能做出哪些选择？[Ref-1]

## 02. 三个历史阅读框架

### 框架一：制度与个人的张力

${profile.lenses[0].explanation} 阅读万历、申时行、海瑞、戚继光与李贽相关章节时，分别记录他们的**位置、可支配资源、受限规则和实际选择**，再比较差异。[Ref-1]

### 框架二：财政与行政能力

${profile.lenses[1].explanation} 读到改革、军务或官僚体系时，可反复追问：资源如何筹集？命令如何层层落实？出现问题时谁能够承担责任？[Ref-2]

### 框架三：道德语言与治理技术

${profile.lenses[2].explanation} 这能帮助你理解，书中许多矛盾为何不是“好人对坏人”的简单对立，而是理想、规则与执行能力之间的错位。[Ref-3]

## 03. 对照你提供目录的阅读路径

${outline}

建议每读完一章，用三句话完成笔记：**这一章写了谁/什么事？它暴露了哪种制度摩擦？它与前后章节共同回答了什么问题？**

## 04. 深读问题

${profile.questions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

## 05. 给学习者的收束

1. 不急着记人物结论，先画出“人物 - 职位 - 资源 - 规则”的关系。
2. 每次引用作者判断时，回到对应章节找叙事证据。
3. 用一页纸写下：这本书如何让你重新理解“制度失灵”与“个人选择”的关系。`;
    }

    const sourceList = source.slice(0, 5).map((item, index) => `- **材料线索 ${index + 1}**：${item}[Ref-${index + 1}]`).join('\n');
    const chapterList = chapters.length ? chapters.map((chapter, index) => `${index + 1}. ${chapter}`).join('\n') : '材料未呈现清晰目录，可从书摘中的重复概念建立线索。';
    return `# 《${title}》阅读拆解报告

> **阅读目标**：${goal}
> **材料边界**：以下结论只依据你提供的目录、书摘或笔记；没有材料支持的部分会保留为阅读问题，而不编造成书中观点。

## 01. 当前可以确认的中心线索

从已提供材料看，最值得追踪的是：**${source[0] || '请补充一段书摘或目录'}**。先把它视为一个阅读线索，而不是整本书的最终结论。[Ref-1]

## 02. 材料追溯

${sourceList}

## 03. 目录与论证路径

${chapterList}

阅读时为每一章补齐三个位置：它提出了什么问题？给出了哪些叙事/论据？与前一章的关系是什么？

## 04. 深读框架

### 先分开“事实、作者解释、我的联想”

同一段材料中，哪些信息是书中直接叙述，哪些是作者的解释，哪些是你的迁移理解？分开记录，能够防止把联想误当原意。[Ref-1]

### 再追踪章节之间的连接

把章节标题按“提出问题 - 展开论据 - 转折/反例 - 收束结论”排序。若某章无法归类，就把它记为待验证的连接点。[Ref-2]

### 最后形成自己的问题

围绕“${goal}”，写下一个需要回到原文继续核对的问题，而不是过早给出结论。[Ref-3]

## 05. 下一步阅读笔记

1. 为每个章节摘一条原文线索，并标明出处。
2. 用自己的话写一句“作者正在解释什么”。
3. 写一条反问：还有什么材料可能会限制或修正这个理解？`;
  }

  function debate(data) {
    const first = text(data.author1, 30) || '彼得·蒂尔';
    const second = text(data.author2, 30) || '埃里克·莱斯';
    const question = text(data.query, 150) || '如何在不确定条件下推进产品';
    return `**轮次 1：
[${first}]
面对“${question}”，先找到最能形成差异化的关键判断。没有独特价值的快速执行，只会加速同质化。

**轮次 2：
[${second}]
差异化判断必须经由用户行为验证。先设计最小实验，确认真实需求，再投入更多资源。

**轮次 3：
[首席战略官]
双方并不冲突：先明确要守住的独特价值，再用小实验降低判断风险。下一步应限定为一个周期短、阈值清楚、能带来真实反馈的动作。`;
  }

  function simulation(data) {
    const budget = Number(data.budget || 100000);
    const team = Math.max(1, Number(data.teamSize || 4));
    const complexity = text(data.scenario, 300).length;
    const score = Math.max(43, Math.min(86, Math.round(72 + Math.min(budget / 50000, 8) - team * 1.5 - complexity / 55)));
    return {
      successProbability: score,
      timelineProjections: Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        revenue: Math.round((budget * 0.07) * (index + 1) * (0.8 + score / 100)),
        users: Math.round(30 * (index + 1) * (1 + score / 130))
      })),
      criticalFailurePoints: [
        { point: '验证周期过长', severity: score < 60 ? '高' : '中', triggerCondition: '两周内没有拿到能改变判断的行为证据。' },
        { point: '目标信号过于宽泛', severity: '中', triggerCondition: '只统计曝光或口头反馈，未定义完成动作。' },
        { point: '资源一次性投入', severity: '中', triggerCondition: '在首轮实验前已锁定超过 60% 的可用预算。' }
      ]
    };
  }

  function roundtable(data) {
    const authors = text(data.authors, 120) || '顾问团';
    const history = data.messages || [];
    const question = history.length ? text(history[history.length - 1].content, 160) : '请给出下一步建议';
    return `## 圆桌共识

针对“${question}”，${authors}建议先把问题压缩为一个可验证命题，再在最小场景中获取证据。

1. **先定边界**：本轮只验证一个关键行为，不同时追求增长、口碑和收入。
2. **再定阈值**：提前写下成功、继续观察与停止的判断线。
3. **最后复盘**：保留反例，说明下一轮要修改的是价值主张、触达方式还是体验门槛。`;
  }

  function infographic(data) {
    const labels = { strategy_card: '垄断定位与核心逻辑', execution_poster: '12个月业务执行时间表', team_mindmap: '团队协同与共学共识', social_media_card: '社交分享信息图' };
    const title = text(data.title, 30) || '阅读决策';
    const label = labels[data.cardType] || '战略逻辑图';
    const goal = text(data.goal, 50) || '从洞见走向行动';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="620" viewBox="0 0 900 620"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#071426"/><stop offset="1" stop-color="#121433"/></linearGradient><linearGradient id="line" x1="0" x2="1"><stop stop-color="#00f2fe"/><stop offset="1" stop-color="#b152ff"/></linearGradient><filter id="g"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="900" height="620" rx="26" fill="url(#bg)"/><circle cx="750" cy="90" r="180" fill="#4facfe" opacity=".08"/><circle cx="120" cy="560" r="210" fill="#b152ff" opacity=".08"/><text x="70" y="92" fill="#00f2fe" font-size="22" font-family="Arial">XIAOLU AI READ · DECISION VISUAL</text><text x="70" y="150" fill="white" font-size="40" font-weight="700" font-family="Arial">${title}</text><text x="70" y="190" fill="#94a3b8" font-size="21" font-family="Arial">${label}</text><path d="M145 340 L390 270 L635 340" fill="none" stroke="url(#line)" stroke-width="6" filter="url(#g)"/><circle cx="145" cy="340" r="54" fill="#0d2138" stroke="#00f2fe" stroke-width="4"/><circle cx="390" cy="270" r="66" fill="#0d2138" stroke="#b152ff" stroke-width="4"/><circle cx="635" cy="340" r="54" fill="#0d2138" stroke="#4facfe" stroke-width="4"/><text x="145" y="334" text-anchor="middle" fill="white" font-size="18" font-family="Arial">洞见</text><text x="145" y="360" text-anchor="middle" fill="#94a3b8" font-size="13" font-family="Arial">关键判断</text><text x="390" y="264" text-anchor="middle" fill="white" font-size="18" font-family="Arial">验证</text><text x="390" y="290" text-anchor="middle" fill="#94a3b8" font-size="13" font-family="Arial">最小实验</text><text x="635" y="334" text-anchor="middle" fill="white" font-size="18" font-family="Arial">行动</text><text x="635" y="360" text-anchor="middle" fill="#94a3b8" font-size="13" font-family="Arial">复盘迭代</text><rect x="70" y="465" width="760" height="80" rx="14" fill="white" opacity=".06" stroke="white" stroke-opacity=".14"/><text x="96" y="514" fill="#cbd5e1" font-size="19" font-family="Arial">${goal}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function skill(data) {
    const title = text(data.title, 50) || '阅读决策';
    const author = text(data.author, 40) || '未署名';
    return `---
name: ${title}-决策拆解
description: 从《${title}》提炼关键假设、最小验证与复盘动作。
---

# 《${title}》决策技能包

## 来源
作者：${author}

## 使用步骤
1. 明确当前要验证的一个高风险假设。
2. 设计低成本、短周期、可观察的最小实验。
3. 提前定义成功阈值和停止条件。
4. 根据行为证据更新下一轮动作。

## 输出格式
- 假设
- 目标用户与关键动作
- 验证周期与预算上限
- 成功/失败阈值
- 复盘结论与下一步`;
  }

  window.fetch = function (resource, init) {
    const path = typeof resource === 'string' ? resource : (resource && resource.url) || '';
    const endpoint = path.split('?')[0];
    if (!endpoint.includes('/.netlify/functions/')) return originalFetch(resource, init);
    const data = input(init);
    const curated = curatedProfile(data.title);

    if (endpoint.endsWith('/v2-generate-report')) {
      // Keep live AI handling for ordinary books. Only the curated titles are
      // intercepted so their demonstration answer stays book-specific.
      if (!curated) return originalFetch(resource, init);
      const reportText = report(data);
      return json({
        report: reportText,
        chunks: curated
          ? curatedChunks(curated, data)
          : excerpts(data.materials).slice(0, 6).map((content, index) => ({ id: index + 1, title: `材料片段 ${String(index + 1).padStart(2, '0')}`, content })),
        parsedJSON: structure({ ...data, reportMarkdown: reportText }),
        mode: curated ? 'curated-theme-guide' : (data.materials ? 'material-guide' : 'verified-catalog-talk'),
        bookMetadata: curated ? { title: curated.displayTitle, author: curated.author, originalTitle: curated.originalTitle } : { title: text(data.title, 90), author: text(data.author, 80) }
      });
    }
    if (endpoint.endsWith('/v2-generate-metadata') && curated) {
      return json({ parsedJSON: structure({ title: data.title, author: data.author, goal: '提炼核心模型', materials: data.reportMarkdown }) });
    }
    return originalFetch(resource, init);
  };
})();
