(function () {
  "use strict";

  var pageKey = detectPage();
  var configs = {
    overview: {
      title: "数学探险岛",
      modules: ["百分数", "分数互化", "比和比例", "圆", "生活应用"],
      keys: ["percent", "fraction", "ratio", "circle", "application"],
      navSelector: ".module-btn",
      navAttribute: "module",
      hints: [
        "拖动滑块，让百分数、分数和小数一起变化。",
        "完成一道分数化百分数练习，答错可以继续试。",
        "按 3:2 调配总量 500 毫升的橙汁。",
        "改变半径，观察周长和面积怎样变化。",
        "调整折扣，读出原价、折扣和现价的关系。"
      ]
    },
    cylinder: {
      title: "圆柱 3D 工坊",
      modules: ["认识圆柱", "侧面积", "表面积", "体积", "实际应用", "综合挑战"],
      keys: [1, 2, 3, 4, 5, 6],
      navSelector: ".module-card",
      navAttribute: "module",
      hints: [
        "改变半径和高度，再辨认圆柱的三个面。",
        "先观察展开关系，再算当前圆柱的侧面积。",
        "把两个底面和侧面合起来计算表面积。",
        "用底面积乘高，计算当前圆柱的体积。",
        "把体积公式用到容器容量问题中。",
        "完成两道综合应用题，注意单位换算。"
      ]
    },
    sector: {
      title: "扇形几何工坊",
      modules: ["认识扇形", "扇形周长", "扇形面积", "实际应用", "综合挑战"],
      keys: [1, 2, 3, 4, 5],
      navSelector: ".module",
      navAttribute: "module",
      hints: [
        "同时改变圆心角和半径，观察扇形形状。",
        "改变两个量，观察扇形周长由哪三段组成。",
        "比较圆心角和半径对面积的影响。",
        "在生活图形中辨认并解释扇形。",
        "完成两个滑块挑战，再提交这一站。"
      ]
    },
    percent: {
      title: "百分数生活岛",
      modules: ["认识百分数", "数的互化", "折扣应用", "储蓄应用", "综合挑战"],
      keys: ["concept", "conversion", "application", "life", "challenge"],
      navSelector: ".island",
      navAttribute: "module",
      hints: [
        "拖动百分数滑块，观察百格图和三种表示。",
        "输入一个数并完成互化，确认表示的是同一个量。",
        "完成生活应用选择，并观察折扣后的价格。",
        "改变本金、利率或年限，比较到期金额。",
        "三道题都作答后提交，答错只给提示不扣分。"
      ]
    },
    ratio: {
      title: "比和比例任务营",
      modules: ["比例调配", "数形互化", "应用推理", "生活比例", "综合挑战"],
      keys: [1, 2, 3, 4, 5],
      navSelector: ".module-card",
      navAttribute: "module",
      hints: [
        "把红、蓝材料调成 3:2，再检查结果。",
        "完成一次有效互化，读懂不同表示。",
        "两道应用题都选对后再完成任务。",
        "分别调整两件商品的折扣，比较现价。",
        "用长宽比和周长关系求出长与宽。"
      ]
    }
  };

  var config = configs[pageKey];
  var toastTimer = 0;
  var restoring = false;
  var suppressSyncUntil = 0;

  window.learningToast = showToast;
  window.drawLearningCylinderFallback = drawCylinderFallback;

  if (!config) return;

  document.documentElement.dataset.learningProject = pageKey;
  var storeKey = "kid-learning-complete-v3-" + pageKey;
  var progress = loadProgress();

  window.alert = function (message) {
    showToast(String(message || "已收到提示"), "hint");
  };

  onReady(function () {
    cleanLegacyText();
    makeControlsAccessible();
    if (pageKey === "cylinder") injectCylinderQuestions();
    injectHud();
    bindExperienceEvents();
    restoreControls();
    restoreCurrentModule();
    renderProgress();
    if (pageKey === "cylinder" && typeof window.THREE === "undefined") {
      document.querySelectorAll(".cylinder-canvas").forEach(function (canvas, index) {
        drawCylinderFallback(canvas, index + 1);
      });
      showToast("3D 组件未联网，已切换为可正常学习的圆柱示意图。", "hint");
    }
  });

  function detectPage() {
    var text = decodeURIComponent(location.pathname) + " " + document.title;
    if (text.indexOf("数学探险岛") !== -1 || text.indexOf("总览探险岛") !== -1) return "overview";
    if (text.indexOf("圆柱3D工坊") !== -1 || text.indexOf("圆柱体探索者") !== -1) return "cylinder";
    if (text.indexOf("扇形几何工坊") !== -1 || text.indexOf("扇形探索者") !== -1) return "sector";
    if (text.indexOf("百分数生活岛") !== -1) return "percent";
    if (text.indexOf("比和比例任务营") !== -1) return "ratio";
    return "general";
  }

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadProgress() {
    var base = {
      done: [],
      ready: [],
      current: 0,
      controls: {},
      touches: [],
      checks: [],
      version: 3
    };
    try {
      var saved = JSON.parse(localStorage.getItem(storeKey));
      if (!saved || saved.version !== 3) return base;
      Object.keys(base).forEach(function (key) {
        if (saved[key] !== undefined) base[key] = saved[key];
      });
      base.current = clamp(Number(base.current) || 0, 0, config.modules.length - 1);
      return base;
    } catch (error) {
      return base;
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(storeKey, JSON.stringify(progress));
    } catch (error) {
      // The page remains fully usable when storage is unavailable.
    }
  }

  function injectHud() {
    if (document.querySelector(".learning-hud")) return;
    var hud = document.createElement("section");
    hud.className = "learning-hud";
    hud.id = "learningHud";
    hud.setAttribute("aria-label", "学习进度");
    hud.style.setProperty("--step-count", config.modules.length);
    hud.innerHTML = [
      '<div class="learning-hud__top">',
      '<div class="learning-hud__title"><span class="learning-hud__eyebrow">本次学习路线</span><strong id="learningHudTitle"></strong></div>',
      '<div class="learning-hud__actions"><button type="button" class="learning-hud__action" id="learningRestart">重新开始</button></div>',
      "</div>",
      '<div class="learning-hud__steps" id="learningHudSteps"></div>',
      '<div class="learning-hud__status"><span id="learningHudStatus"></span><span class="learning-hud__save">进度已自动保存</span></div>'
    ].join("");

    var header = document.querySelector("header, .main-header, .marvel-header");
    if (header && header.parentNode) {
      header.insertAdjacentElement("afterend", hud);
    } else {
      document.body.insertBefore(hud, document.body.firstElementChild || null);
    }

    document.getElementById("learningRestart").addEventListener("click", showResetDialog);
  }

  function bindExperienceEvents() {
    document.addEventListener("input", function (event) {
      var target = event.target;
      if (!target || !target.id) return;
      progress.controls[target.id] = target.value;
      if (!restoring && progress.touches.indexOf(target.id) === -1) progress.touches.push(target.id);
      if (!restoring) updateReadyFromInput(target.id);
      saveProgress();

      if (pageKey === "cylinder" && /^((height)|(radius))Slider[1-6]$/.test(target.id) && typeof window.THREE === "undefined") {
        var moduleNumber = Number(target.id.match(/(\d+)$/)[1]);
        drawCylinderFallback(document.getElementById("cylinderCanvas" + moduleNumber), moduleNumber);
      }
    }, true);

    document.addEventListener("click", handleCaptureClick, true);
    document.addEventListener("click", function () {
      setTimeout(syncCurrentFromDom, 0);
    }, false);
  }

  function handleCaptureClick(event) {
    var target = event.target && event.target.closest("button, .option, .module-card, .module-btn, .island");
    if (!target) return;

    if (target.matches(config.navSelector)) {
      var targetIndex = indexFromNav(target);
      if (targetIndex < 0) return;
      var unlocked = firstIncompleteIndex();
      if (targetIndex > unlocked) {
        stopEvent(event);
        showToast("先完成前一站，再来这里。进度不会丢失。", "hint");
        focusHudStatus();
        return;
      }
      progress.current = targetIndex;
      saveProgress();
      renderProgress();
      return;
    }

    if ((pageKey === "percent" || pageKey === "ratio") && target.classList.contains("option")) {
      handleLearningOption(event, target);
      return;
    }

    if (pageKey === "overview") handleOverviewClick(event, target);
    if (pageKey === "cylinder") handleCylinderClick(event, target);
    if (pageKey === "sector") handleSectorClick(event, target);
    if (pageKey === "percent") handlePercentClick(event, target);
    if (pageKey === "ratio") handleRatioClick(event, target);
  }

  function handleOverviewClick(event, target) {
    if (target.id === "checkFraction" || target.id === "checkRatio") {
      setTimeout(function () {
        var feedbackId = target.id === "checkFraction" ? "fractionFeedback" : "ratioFeedback";
        var moduleIndex = target.id === "checkFraction" ? 1 : 2;
        if (isCorrectFeedback(feedbackId)) markReady(moduleIndex);
      }, 0);
      return;
    }

    if (target.id === "newProblem") {
      markReady(4);
      return;
    }

    if (target.id === "prevBtn") {
      stopEvent(event);
      if (progress.current === 0) {
        showToast("已经是第一站了。", "hint");
      } else {
        progress.current -= 1;
        saveProgress();
        callSwitch(config.keys[progress.current]);
        renderProgress();
      }
      return;
    }

    if (target.id === "nextBtn") {
      if (!requireReady(event, progress.current)) return;
      markDone(progress.current);
      if (progress.current === config.modules.length - 1) {
        stopEvent(event);
        showFinish();
      }
    }
  }

  function handleCylinderClick(event, target) {
    var moduleMatch = target.id.match(/^checkModule([1-5])$/);
    if (moduleMatch) {
      var moduleNumber = Number(moduleMatch[1]);
      if (!validateCylinderModule(moduleNumber)) {
        stopEvent(event);
        return;
      }
      markReady(moduleNumber - 1);
      return;
    }

    var nextMatch = target.id.match(/^nextModule([1-6])$/);
    if (nextMatch) {
      var nextModule = Number(nextMatch[1]);
      if (!requireReady(event, nextModule - 1)) return;
      markDone(nextModule - 1);
      if (nextModule === 6) setTimeout(showFinish, 250);
      return;
    }

    if (target.id === "checkChallenge1" || target.id === "checkChallenge2") {
      var challenge = target.id === "checkChallenge1" ? 1 : 2;
      if (!validateCylinderChallenge(challenge)) {
        stopEvent(event);
        return;
      }
      rememberCheck("cylinder-challenge-" + challenge);
      if (hasCheck("cylinder-challenge-1") && hasCheck("cylinder-challenge-2")) markReady(5);
    }
  }

  function handleSectorClick(event, target) {
    var moduleMatch = target.id.match(/^checkModule([1-4])$/);
    if (moduleMatch) {
      var index = Number(moduleMatch[1]) - 1;
      if (!sectorModuleTouched(index + 1)) {
        stopEvent(event);
        showToast("先拖动圆心角或半径，观察图形和数值的变化。", "hint");
        return;
      }
      markReady(index);
      markDone(index);
      return;
    }

    if (target.id === "checkChallenge1") {
      if (!hasTouch("squareSlider")) {
        stopEvent(event);
        showToast("先拖动正方形边长，比较圆和正方形的面积。", "hint");
        return;
      }
      if (Math.abs(numberValue("squareSlider") - 10 / Math.sqrt(2)) >= .1) {
        stopEvent(event);
        showInlineFeedback("module5Feedback", "再想一想：正方形的对角线等于圆的半径，边长调到约 7.07 米。", false);
        showToast("答案还差一点，可以继续调整滑块。", "hint");
        return;
      }
      rememberCheck("sector-challenge-1");
    }

    if (target.id === "checkChallenge2") {
      if (!hasTouch("challenge2Slider")) {
        stopEvent(event);
        showToast("先改变圆心角，观察面积占整圆的几分之几。", "hint");
        return;
      }
      if (Math.abs(numberValue("challenge2Slider") - 158.4) >= 2) {
        stopEvent(event);
        showInlineFeedback("module5Feedback", "再算一次：先用周长减去两条半径，再由弧长反求圆心角，结果约 158.4°。", false);
        showToast("圆心角还不对，调整后再检查。", "hint");
        return;
      }
      rememberCheck("sector-challenge-2");
    }

    if (hasCheck("sector-challenge-1") && hasCheck("sector-challenge-2")) markReady(4);

    if (target.id === "completeChallenge") {
      if (!requireReady(event, 4)) return;
      markDone(4);
      setTimeout(showFinish, 250);
    }
  }

  function handlePercentClick(event, target) {
    var route = {
      nextConcept: 0,
      nextConversion: 1,
      nextApplication: 2,
      nextLife: 3
    };
    if (route[target.id] !== undefined) {
      var index = route[target.id];
      if (!requireReady(event, index)) return;
      markDone(index);
      return;
    }

    if (target.id === "convertBtn") {
      setTimeout(function () {
        if (isCorrectFeedback("conversionFeedback")) markReady(1);
      }, 0);
      return;
    }

    if (target.id === "submitChallenge") {
      setTimeout(function () {
        if (isCorrectFeedback("challengeFeedback")) {
          markReady(4);
          markDone(4);
          showFinish();
        } else {
          showToast("还有题目需要再想一想。答错不会扣分，可以直接修改。", "hint");
        }
      }, 0);
    }
  }

  function handleRatioClick(event, target) {
    if (target.id === "checkPotion") {
      var red = numberValue("redSlider");
      var blue = numberValue("blueSlider");
      var ratioTarget = document.getElementById("targetRatio");
      var targetRed = ratioTarget ? Number(ratioTarget.dataset.red) : 3;
      var targetBlue = ratioTarget ? Number(ratioTarget.dataset.blue) : 2;
      if (!blue || !targetBlue || Math.abs(red / blue - targetRed / targetBlue) > .001) {
        stopEvent(event);
        showInlineFeedback("module1Feedback", "再试一次：" + targetRed + ":" + targetBlue + " 表示每 " + targetRed + " 份红色要配 " + targetBlue + " 份蓝色。", false);
        showToast("数量可以放大或缩小，但红与蓝的比要保持 " + targetRed + ":" + targetBlue + "。", "hint");
        return;
      }
      markReady(0);
      return;
    }

    if (target.id === "convertBtn") {
      setTimeout(function () {
        if (isCorrectFeedback("module2Feedback")) markReady(1);
      }, 0);
      return;
    }

    var nextMatch = target.id.match(/^nextModule([1-4])$/);
    if (nextMatch) {
      var index = Number(nextMatch[1]) - 1;
      if (!requireReady(event, index)) return;
      markDone(index);
      return;
    }

    if (target.id === "checkChallenge") {
      var length = numberValue("lengthAnswer");
      var width = numberValue("widthAnswer");
      if (length !== 12 || width !== 8) {
        stopEvent(event);
        showInlineFeedback("module5Feedback", "再算一算：半周长是 20 厘米，长和宽一共占 3+2=5 份。", false);
        showToast("先求每份是多少，再分别乘 3 和 2。答错不会扣分。", "hint");
        return;
      }
      markReady(4);
      markDone(4);
      setTimeout(showFinish, 250);
    }
  }

  function handleLearningOption(event, option) {
    stopEvent(event);
    var group = option.closest(".options") || option.parentElement;
    if (!group) return;
    var options = group.querySelectorAll(".option");
    options.forEach(function (item) {
      item.classList.remove("selected", "learning-selected", "incorrect");
    });
    option.classList.add("selected", "learning-selected");

    var correct = option.dataset.correct === "true";
    var groupKey = getOptionGroupKey(group);
    if (correct) {
      option.classList.add("correct");
      rememberCheck(groupKey);
      showToast("选对了。继续完成这一站的其他题目。", "success");
    } else {
      option.classList.add("incorrect");
      forgetCheck(groupKey);
      showToast("这个答案还不合适。看看比较的基准量，再试一次。", "hint");
    }

    if (pageKey === "ratio") {
      var moduleContent = option.closest(".content-body");
      if (moduleContent && moduleContent.id === "module3Content") {
        var groups = moduleContent.querySelectorAll(".options");
        if (allOptionGroupsCorrect(groups)) markReady(2);
      }
    }

    if (pageKey === "percent") {
      var percentModule = option.closest(".module-content");
      if (percentModule && percentModule.id === "applicationModule") {
        var percentGroups = percentModule.querySelectorAll(".options");
        if (allOptionGroupsCorrect(percentGroups)) markReady(2);
      }
    }
  }

  function allOptionGroupsCorrect(groups) {
    if (!groups.length) return false;
    return Array.prototype.every.call(groups, function (group) {
      return hasCheck(getOptionGroupKey(group));
    });
  }

  function getOptionGroupKey(group) {
    if (!group.dataset.learningGroup) {
      var all = Array.prototype.slice.call(document.querySelectorAll(".options"));
      group.dataset.learningGroup = pageKey + "-options-" + all.indexOf(group);
    }
    return group.dataset.learningGroup;
  }

  function updateReadyFromInput(id) {
    if (pageKey === "overview") {
      if (id === "percentSlider") markReady(0);
      if (id === "radiusSlider") markReady(3);
      if (id === "discountSlider") markReady(4);
    }

    if (pageKey === "percent") {
      if (id === "percentSlider") markReady(0);
      if (id === "discountSlider" || id === "discountSlider2") markReady(2);
      if (id === "principal" || id === "interestRate" || id === "years") markReady(3);
    }

    if (pageKey === "ratio") {
      if (id === "discountSlider" || id === "discountSlider2") {
        if (hasTouch("discountSlider") && hasTouch("discountSlider2")) markReady(3);
      }
    }
  }

  function injectCylinderQuestions() {
    var questions = [
      "观察当前圆柱，它由哪些面组成？",
      "按 π≈3.14 计算当前圆柱的侧面积（平方厘米）。",
      "按 π≈3.14 计算当前圆柱的表面积（平方厘米）。",
      "按 π≈3.14 计算当前圆柱的体积（立方厘米）。",
      "把当前圆柱看作容器，按 π≈3.14 计算容量（立方厘米）。"
    ];

    questions.forEach(function (question, index) {
      var moduleNumber = index + 1;
      var checkButton = document.getElementById("checkModule" + moduleNumber);
      if (!checkButton || document.getElementById("learningCylinderQuestion" + moduleNumber)) return;
      var box = document.createElement("div");
      box.className = "learning-answer";
      box.id = "learningCylinderQuestion" + moduleNumber;

      if (moduleNumber === 1) {
        box.innerHTML = '<strong>' + question + '</strong><div class="learning-answer__choices">' + [
          ["1 个底面和 1 个侧面", "false"],
          ["2 个底面和 1 个侧面", "true"],
          ["2 个底面和 2 个侧面", "false"]
        ].map(function (item) {
          return '<button type="button" class="learning-answer__choice" data-cylinder-correct="' + item[1] + '">' + item[0] + '</button>';
        }).join("") + "</div>";
      } else {
        box.innerHTML = '<label for="learningCylinderAnswer' + moduleNumber + '">' + question + '</label><div class="learning-answer__row"><input id="learningCylinderAnswer' + moduleNumber + '" type="number" inputmode="decimal" step="0.01" placeholder="输入计算结果"><span>可保留两位小数</span></div>';
      }
      checkButton.insertAdjacentElement("beforebegin", box);
    });

    document.querySelectorAll(".learning-answer__choice").forEach(function (button) {
      button.addEventListener("click", function () {
        button.parentElement.querySelectorAll(".learning-answer__choice").forEach(function (item) {
          item.classList.remove("is-selected");
        });
        button.classList.add("is-selected");
      });
    });
  }

  function validateCylinderModule(moduleNumber) {
    if (moduleNumber === 1) {
      var selected = document.querySelector("#learningCylinderQuestion1 .is-selected");
      if (!selected) {
        showToast("先选出圆柱由哪些面组成。", "hint");
        return false;
      }
      if (selected.dataset.cylinderCorrect !== "true") {
        showInlineFeedback("module1Feedback", "再观察：圆柱上下各有一个圆形底面，中间有一个曲面。", false);
        return false;
      }
      showInlineFeedback("module1Feedback", "正确：圆柱有 2 个底面和 1 个侧面。", true);
      return true;
    }

    var radius = numberValue("radiusSlider" + moduleNumber);
    var height = numberValue("heightSlider" + moduleNumber);
    var answer = numberValue("learningCylinderAnswer" + moduleNumber);
    var expected = 0;
    if (moduleNumber === 2) expected = 2 * 3.14 * radius * height;
    if (moduleNumber === 3) expected = 2 * 3.14 * radius * height + 2 * 3.14 * radius * radius;
    if (moduleNumber === 4 || moduleNumber === 5) expected = 3.14 * radius * radius * height;
    var tolerance = Math.max(.1, expected * .003);

    if (!Number.isFinite(answer)) {
      showToast("先把计算结果填进答案框。", "hint");
      return false;
    }
    if (Math.abs(answer - expected) > tolerance) {
      var hint = moduleNumber === 2 ? "侧面积 = 底面周长 × 高" :
        moduleNumber === 3 ? "表面积 = 侧面积 + 两个底面积" : "体积 = 底面积 × 高";
      showInlineFeedback("module" + moduleNumber + "Feedback", "再算一次：" + hint + "。", false);
      showToast("数值还差一点，检查公式和乘法过程。", "hint");
      return false;
    }
    showInlineFeedback("module" + moduleNumber + "Feedback", "计算正确，公式和数值对应上了。", true);
    return true;
  }

  function validateCylinderChallenge(challenge) {
    if (challenge === 1) {
      var radius = numberValue("challenge1Radius");
      var volume = numberValue("challenge1Volume");
      var weight = numberValue("challenge1Weight");
      var expectedRadius = 31.4 / (2 * Math.PI);
      var expectedVolume = Math.PI * expectedRadius * expectedRadius * 20;
      if (Math.abs(radius - expectedRadius) < .1 && Math.abs(volume - expectedVolume) < 1 && Math.abs(weight - expectedVolume) < 1) return true;
      showInlineFeedback("module6Feedback", "挑战 1 还要检查：先用周长求半径，再用底面积乘高。", false);
      showToast("水的重量数值与容积相同，但单位不同。", "hint");
      return false;
    }

    var area = numberValue("challenge2Area");
    var capacity = numberValue("challenge2Capacity");
    var expectedArea = Math.PI * 10 * 10 + 2 * Math.PI * 10 * 30;
    var expectedCapacity = Math.PI * 10 * 10 * 30 / 1000;
    if (Math.abs(area - expectedArea) < 10 && Math.abs(capacity - expectedCapacity) < .1) return true;
    showInlineFeedback("module6Feedback", "挑战 2 还要检查：无盖铁桶只算一个底面，容积换成升要除以 1000。", false);
    showToast("先分别写出铁皮面积和容积公式，再代入数值。", "hint");
    return false;
  }

  function drawCylinderFallback(canvas, moduleNumber) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var cssWidth = Math.max(280, Math.min(400, canvas.clientWidth || 400));
    var ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = cssWidth * ratio;
    canvas.height = cssWidth * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    var width = cssWidth;
    var height = cssWidth;
    ctx.clearRect(0, 0, width, height);

    var radiusInput = document.getElementById("radiusSlider" + moduleNumber);
    var heightInput = document.getElementById("heightSlider" + moduleNumber);
    var radiusValue = radiusInput ? Number(radiusInput.value) : 5;
    var heightValue = heightInput ? Number(heightInput.value) : 10;
    var bodyWidth = clamp(95 + radiusValue * 5, 120, width * .62);
    var bodyHeight = clamp(95 + heightValue * 3.3, 130, height * .58);
    var x = (width - bodyWidth) / 2;
    var y = (height - bodyHeight) / 2;
    var ellipseHeight = Math.max(24, bodyWidth * .22);

    var background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#e7f7f2");
    background.addColorStop(1, "#fff5cf");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    var body = ctx.createLinearGradient(x, 0, x + bodyWidth, 0);
    body.addColorStop(0, "#77bfe7");
    body.addColorStop(.48, "#d9f2ff");
    body.addColorStop(1, "#4e8bc4");
    ctx.fillStyle = body;
    ctx.fillRect(x, y + ellipseHeight / 2, bodyWidth, bodyHeight - ellipseHeight);
    ctx.strokeStyle = "#245d86";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y + ellipseHeight / 2, bodyWidth, bodyHeight - ellipseHeight);

    ctx.beginPath();
    ctx.ellipse(width / 2, y + ellipseHeight / 2, bodyWidth / 2, ellipseHeight / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#d8f1ff";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(width / 2, y + bodyHeight - ellipseHeight / 2, bodyWidth / 2, ellipseHeight / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(76, 145, 191, .72)";
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#24414f";
    ctx.font = "700 15px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("半径 " + radiusValue + " cm", width / 2, y - 15);
    ctx.save();
    ctx.translate(x - 18, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("高 " + heightValue + " cm", 0, 0);
    ctx.restore();
    ctx.font = "13px Microsoft YaHei, sans-serif";
    ctx.fillStyle = "#52666f";
    ctx.fillText("离线示意图模式", width / 2, height - 20);
  }

  function restoreControls() {
    restoring = true;
    Object.keys(progress.controls).forEach(function (id) {
      var control = document.getElementById(id);
      if (!control) return;
      control.value = progress.controls[id];
      try {
        control.dispatchEvent(new Event("input", { bubbles: true }));
        control.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (error) {
        // Older embedded browsers still keep the restored value.
      }
    });
    restoring = false;
  }

  function restoreCurrentModule() {
    var key = config.keys[progress.current];
    callSwitch(key);
  }

  function callSwitch(key) {
    if (typeof window.switchModule === "function") {
      try {
        window.switchModule(key);
      } catch (error) {
        // Visual state is still synchronized from the navigation controls.
      }
    }
  }

  function syncCurrentFromDom() {
    if (Date.now() < suppressSyncUntil) return;
    var active = document.querySelector(config.navSelector + ".active");
    if (!active) return;
    var index = indexFromNav(active);
    if (index >= 0 && index !== progress.current) {
      progress.current = index;
      saveProgress();
      renderProgress();
    }
  }

  function indexFromNav(element) {
    var value = element.dataset[config.navAttribute];
    return config.keys.findIndex(function (key) {
      return String(key) === String(value);
    });
  }

  function markReady(index) {
    if (progress.ready.indexOf(index) === -1) progress.ready.push(index);
    saveProgress();
    renderProgress();
  }

  function markDone(index) {
    markReady(index);
    if (progress.done.indexOf(index) === -1) progress.done.push(index);
    if (index < config.modules.length - 1) progress.current = Math.max(progress.current, index + 1);
    suppressSyncUntil = Date.now() + 2200;
    saveProgress();
    renderProgress();
    showToast("第 " + (index + 1) + " 站完成，进度已保存。", "success");
    setTimeout(syncCurrentFromDom, 2300);
  }

  function renderProgress() {
    progress.done = progress.done.filter(validIndex).sort(numberSort);
    progress.ready = progress.ready.filter(validIndex).sort(numberSort);
    var title = document.getElementById("learningHudTitle");
    var steps = document.getElementById("learningHudSteps");
    var status = document.getElementById("learningHudStatus");
    if (title) title.textContent = "第 " + (progress.current + 1) + " 站 · " + config.modules[progress.current];
    if (steps) {
      steps.innerHTML = config.modules.map(function (module, index) {
        var className = "learning-hud__step";
        if (isDone(index)) className += " is-done";
        if (index === progress.current) className += " is-current";
        return '<span class="' + className + '">' + (isDone(index) ? "✓ " : (index + 1) + ". ") + module + "</span>";
      }).join("");
    }
    if (status) {
      var message = isDone(progress.current) ? "这一站已经完成，可以复习或继续前进。" :
        isReady(progress.current) ? "关键操作已完成，可以进入下一站。" : config.hints[progress.current];
      status.innerHTML = "<b>当前任务：</b>" + message;
    }

    var unlocked = firstIncompleteIndex();
    document.querySelectorAll(config.navSelector).forEach(function (item) {
      var index = indexFromNav(item);
      if (index < 0) return;
      item.classList.toggle("learning-complete", isDone(index));
      item.classList.toggle("learning-ready", isReady(index) && !isDone(index));
      item.classList.toggle("locked", index > unlocked);
      item.setAttribute("aria-disabled", index > unlocked ? "true" : "false");
      var circle = item.querySelector(".progress-circle");
      if (circle) {
        circle.textContent = isDone(index) ? "100%" : isReady(index) ? "可完成" : "0%";
        circle.style.background = isDone(index) ? "conic-gradient(#2b8a6e 0 100%)" :
          isReady(index) ? "conic-gradient(#f2c94c 0 65%, #dfe8e4 65% 100%)" : "conic-gradient(#dfe8e4 0 100%)";
      }
      var islandProgress = item.querySelector(".island-progress");
      if (islandProgress) islandProgress.textContent = isDone(index) ? "100% 完成" : "待完成";
    });

    var percent = Math.round(progress.done.length / config.modules.length * 100);
    var originalProgress = document.getElementById("globalProgress");
    var originalText = document.getElementById("progressText");
    if (originalProgress) originalProgress.style.width = percent + "%";
    if (originalText) originalText.textContent = percent + "%";
  }

  function requireReady(event, index) {
    if (isReady(index)) return true;
    stopEvent(event);
    showToast(config.hints[index] + " 完成后再进入下一站。", "hint");
    focusHudStatus();
    return false;
  }

  function firstIncompleteIndex() {
    var index = 0;
    while (index < config.modules.length && isDone(index)) index += 1;
    return Math.min(index, config.modules.length - 1);
  }

  function validIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < config.modules.length;
  }

  function numberSort(a, b) {
    return a - b;
  }

  function isReady(index) {
    return progress.ready.indexOf(index) !== -1;
  }

  function isDone(index) {
    return progress.done.indexOf(index) !== -1;
  }

  function hasTouch(id) {
    return progress.touches.indexOf(id) !== -1;
  }

  function sectorModuleTouched(moduleNumber) {
    return hasTouch("angleSlider" + moduleNumber) || hasTouch("radiusSlider" + moduleNumber);
  }

  function rememberCheck(key) {
    if (progress.checks.indexOf(key) === -1) progress.checks.push(key);
    saveProgress();
  }

  function forgetCheck(key) {
    progress.checks = progress.checks.filter(function (item) { return item !== key; });
    saveProgress();
  }

  function hasCheck(key) {
    return progress.checks.indexOf(key) !== -1;
  }

  function numberValue(id) {
    var element = document.getElementById(id);
    if (!element || element.value === "") return NaN;
    return Number(element.value);
  }

  function isCorrectFeedback(id) {
    var feedback = document.getElementById(id);
    return !!feedback && feedback.classList.contains("correct");
  }

  function showInlineFeedback(id, message, correct) {
    var feedback = document.getElementById(id);
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = "feedback " + (correct ? "correct" : "incorrect");
    feedback.classList.remove("hidden");
    feedback.style.display = "block";
  }

  function showToast(message, kind) {
    var toast = document.querySelector(".learning-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "learning-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = String(message || "");
    toast.dataset.kind = kind || "info";
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2600);
  }

  function showFinish() {
    if (document.querySelector(".learning-finish")) return;
    var finish = document.createElement("div");
    finish.className = "learning-finish";
    finish.setAttribute("role", "dialog");
    finish.setAttribute("aria-modal", "true");
    finish.setAttribute("aria-labelledby", "learningFinishTitle");
    finish.innerHTML = [
      '<section class="learning-finish__panel">',
      '<div class="learning-finish__mark">✓</div>',
      '<h2 id="learningFinishTitle">全部学习任务完成</h2>',
      '<p>你已经走完“' + config.title + '”的 ' + config.modules.length + ' 站学习路线。答错后重新思考的过程，也属于真正的学习成果。</p>',
      '<div class="learning-finish__actions">',
      '<button type="button" class="secondary" data-finish-close>回看学习内容</button>',
      '<button type="button" data-finish-restart>再练一次</button>',
      "</div></section>"
    ].join("");
    document.body.appendChild(finish);
    finish.querySelector("[data-finish-close]").addEventListener("click", function () { finish.remove(); });
    finish.querySelector("[data-finish-restart]").addEventListener("click", resetAndReload);
    finish.querySelector("[data-finish-close]").focus();
  }

  function showResetDialog() {
    if (document.querySelector(".learning-finish")) return;
    var dialog = document.createElement("div");
    dialog.className = "learning-finish";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.innerHTML = [
      '<section class="learning-finish__panel">',
      '<div class="learning-finish__mark">↻</div>',
      '<h2>重新开始本项目？</h2>',
      '<p>这会清空本项目在当前浏览器中的学习进度，其他项目不会受影响。</p>',
      '<div class="learning-finish__actions">',
      '<button type="button" class="secondary" data-reset-cancel>继续学习</button>',
      '<button type="button" data-reset-confirm>清空并重新开始</button>',
      "</div></section>"
    ].join("");
    document.body.appendChild(dialog);
    dialog.querySelector("[data-reset-cancel]").addEventListener("click", function () { dialog.remove(); });
    dialog.querySelector("[data-reset-confirm]").addEventListener("click", resetAndReload);
    dialog.querySelector("[data-reset-cancel]").focus();
  }

  function resetAndReload() {
    try { localStorage.removeItem(storeKey); } catch (error) {}
    location.reload();
  }

  function makeControlsAccessible() {
    document.querySelectorAll(".option, .module-card, .module-btn, .module, .island").forEach(function (element) {
      if (!element.hasAttribute("role")) element.setAttribute("role", "button");
      if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "0");
      element.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          element.click();
        }
      });
    });
  }

  function cleanLegacyText() {
    if (pageKey !== "ratio") return;
    var replacements = [
      [/超级英雄/g, "学习导师"],
      [/英雄选择/g, "导师选择"],
      [/选择你的英雄/g, "选择学习导师"],
      [/英雄/g, "导师"],
      [/专注能量/g, "专注度"],
      [/能源/g, "材料"],
      [/扣分/g, "获得提示"]
    ];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && /^(SCRIPT|STYLE)$/.test(node.parentElement.tagName)) continue;
      var text = node.nodeValue;
      replacements.forEach(function (entry) { text = text.replace(entry[0], entry[1]); });
      node.nodeValue = text;
    }
  }

  function focusHudStatus() {
    var hud = document.getElementById("learningHud");
    if (hud) hud.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function stopEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
