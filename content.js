// LUCID content bank. Source of truth for copy: docs/copy-editorial.md.
// Items carry cut:true instead of being deleted so editorial vetoes are one-line reverts.
// DE dropped 2026-07 to keep the bank lean; strings survive in LUCID.R + git history if it returns.

const CONTENT = {};

CONTENT.buckets = ["Affective", "Behavioural", "Cognitive", "Neuro-Phys", "Existential"];

CONTENT.labels = [
  { id: "A01", bucket: "Affective", val: "load", dims: ["affect_blunting"], zh: "以前喜歡的事，現在做起來像在跑流程", en: "Things you used to enjoy now feel like admin" },
  { id: "A02", bucket: "Affective", val: "load", dims: ["vigilance", "depletion"], zh: "外面照常在社交，裡面其實早就爆表", en: "Socially fine, internally overloaded" },
  { id: "A03", bucket: "Affective", val: "load", dims: ["depletion", "affect_blunting"], zh: "明明沒發生什麼大事，心情卻長期偏低電量", en: "Low mood without any big event" },
  { id: "A04", bucket: "Affective", val: "load", dims: ["vigilance", "depletion"], zh: "小事也能直接戳中", en: "Small things hit surprisingly hard" },
  { id: "A05", bucket: "Affective", val: "load", dims: ["depletion", "dissociation"], zh: "搞不清楚自己是累、是難過，還是只是被洗到麻木", en: "Unsure if you’re tired, sad, or just numb" },
  { id: "A06", bucket: "Affective", val: "load", dims: ["dissociation", "affect_blunting"], cut: true, zh: "情緒常常延遲到事後才一次湧出", en: "Emotions show up late and all at once" },
  { id: "A07", bucket: "Affective", val: "load", dims: ["dissociation", "depletion"], zh: "偶爾會突然整個人關機，之後才覺得「剛剛好像有點嚴重」", en: "Occasionally shut down, then realise it was serious" },

  { id: "A08", bucket: "Affective", val: "prot", dims: ["resilience"], zh: "說得出口「我現在狀態不好」，而不是硬撐正常", en: "Saying 'I’m not okay' instead of faking it", coupon: { en: "SAYS 'NOT OKAY' OUT LOUD", zh: "說得出「我狀態不好」" } },
  { id: "A09", bucket: "Affective", val: "prot", dims: ["resilience"], cut: true, zh: "在信任的人面前，可以承認「這件事有影響到我」", en: "Telling trusted people something actually hurt", coupon: { en: "ARMOR OFF, SELECTIVELY", zh: "選擇性卸甲" } },
  { id: "A10", bucket: "Affective", val: "prot", dims: ["resilience"], zh: "有時候會刻意讓自己好好難過一下，而不是直接關機", en: "Letting yourself feel sad instead of switching it off", coupon: { en: "SCHEDULED SADNESS", zh: "預約好好難過" } },
  { id: "A11", bucket: "Affective", val: "prot", dims: ["resilience", "vigilance"], zh: "看到自己快要情緒暴衝時，會試著放慢一下節奏", en: "Slowing down when you feel a blow-up coming", coupon: { en: "SLOWS BEFORE THE BOOM", zh: "爆炸前減速" } },
  { id: "A12", bucket: "Affective", val: "prot", dims: ["resilience"], zh: "崩潰過後，不會再補上一句罵自己「太誇張」", en: "Not calling yourself 'dramatic' after a crash", coupon: { en: "NO SELF-ROAST AFTERWARD", zh: "崩潰後不補刀" } },

  { id: "B01", bucket: "Behavioural", val: "load", dims: ["depletion", "cognitive_load"], cut: true, zh: "逃避重要的事情", en: "Avoiding important tasks" },
  { id: "B02", bucket: "Behavioural", val: "load", dims: ["vigilance", "dissociation"], zh: "下意識狂滑社群或新聞", en: "Reflexive doomscrolling" },
  { id: "B03", bucket: "Behavioural", val: "load", dims: ["dissociation", "existential_load"], zh: "把行程排滿，省得跟自己相處", en: "Overbooking yourself to avoid your own thoughts" },
  { id: "B04", bucket: "Behavioural", val: "load", dims: ["depletion", "cognitive_load"], zh: "明知道快遲交，還是在拖延", en: "Procrastinating past the point of anxiety" },
  { id: "B05", bucket: "Behavioural", val: "load", dims: ["vigilance", "depletion"], zh: "常常先答應，事後才後悔", en: "Saying yes, then immediately regretting it" },
  { id: "B06", bucket: "Behavioural", val: "load", dims: ["depletion", "dissociation"], zh: "一累就開始亂吃、亂追劇或亂購物", en: "Coping via snacks, shows, or random purchases" },
  { id: "B07", bucket: "Behavioural", val: "load", dims: ["depletion", "vigilance"], zh: "緊急事情總是最後一刻才真的開始動", en: "Only activating when something is on fire" },

  { id: "B08", bucket: "Behavioural", val: "prot", dims: ["resilience"], cut: true, zh: "覺得太累時，會讓自己停下來一下", en: "Letting yourself stop when you’re clearly too tired", coupon: { en: "STOPS WHEN BLINKING", zh: "沒電就停" } },
  { id: "B09", bucket: "Behavioural", val: "prot", dims: ["resilience"], zh: "會把「這次先不做到完美」當成合法選項", en: "Allowing 'good enough' instead of perfection", coupon: { en: "GOOD ENOUGH, SHIPPED", zh: "及格就出貨" } },
  { id: "B10", bucket: "Behavioural", val: "prot", dims: ["resilience"], zh: "可以接受訊息不用秒回", en: "Accepting that messages don’t need instant replies", coupon: { en: "REPLIES ON OWN SCHEDULE", zh: "已讀，晚點回" } },
  { id: "B11", bucket: "Behavioural", val: "prot", dims: ["resilience"], zh: "不想去的行程，會考慮直接拒絕", en: "Turning down plans you genuinely don’t want", coupon: { en: "SAYS NO, SOMETIMES", zh: "偶爾拒絕" } },
  { id: "B12", bucket: "Behavioural", val: "prot", dims: ["resilience"], zh: "工作做不完時，會允許自己先關電腦", en: "Shutting the laptop even with tasks unfinished", coupon: { en: "CLOSES LAPTOP ANYWAY", zh: "事沒做完照關電腦" } },

  { id: "C01", bucket: "Cognitive", val: "load", dims: ["cognitive_load", "depletion"], zh: "腦霧感重，沒辦法專注", en: "Heavy brain fog, unable to focus" },
  { id: "C02", bucket: "Cognitive", val: "load", dims: ["cognitive_load", "vigilance"], zh: "同一件事會在腦內重播很多遍", en: "Replaying the same thing in your head on loop" },
  { id: "C03", bucket: "Cognitive", val: "load", dims: ["depletion", "cognitive_load"], cut: true, zh: "明知道要做什麼，但很難啟動第一步", en: "Knowing what to do but struggling to start" },
  { id: "C04", bucket: "Cognitive", val: "load", dims: ["vigilance", "cognitive_load"], zh: "總是在想「是不是哪裡講錯、做錯」", en: "Auditing today’s conversations for errors" },
  { id: "C05", bucket: "Cognitive", val: "load", dims: ["vigilance", "cognitive_load"], zh: "一邊做事，一邊在排演最糟情境", en: "Running worst-case scenarios while doing normal tasks" },
  { id: "C06", bucket: "Cognitive", val: "load", dims: ["vigilance", "depletion"], zh: "對資訊很敏感，但很快就過載", en: "Very sensitive to information, easily overloaded" },
  { id: "C07", bucket: "Cognitive", val: "load", dims: ["cognitive_load", "depletion"], zh: "腦中待辦清單一直在更新，但實際完成度不高", en: "The to-do list updates itself; the doing doesn’t" },

  { id: "C08", bucket: "Cognitive", val: "prot", dims: ["resilience"], cut: true, zh: "發現自己陷入反芻時，會刻意把注意力拉回當下", en: "Pulling your attention back when you notice rumination", coupon: { en: "EXITS THE LOOP", zh: "跳出迴圈" } },
  { id: "C09", bucket: "Cognitive", val: "prot", dims: ["resilience"], zh: "允許自己忘記一些小事，不再當成天大罪過", en: "Allowing yourself to forget small things without drama", coupon: { en: "FORGETS SMALL THINGS, LEGALLY", zh: "合法忘記小事" } },
  { id: "C10", bucket: "Cognitive", val: "prot", dims: ["resilience", "cognitive_load"], zh: "會刻意把事情寫下來，而不是全塞在腦裡", en: "Writing things down instead of storing everything in your head", coupon: { en: "BRAIN → PAPER EXPORT", zh: "大腦外接紙本" } },
  { id: "C11", bucket: "Cognitive", val: "prot", dims: ["resilience"], zh: "接收到太多資訊時，會主動關掉幾個來源", en: "Actively turning off some information sources when overloaded", coupon: { en: "MUTES A FEW SOURCES", zh: "關掉幾個訊源" } },
  { id: "C12", bucket: "Cognitive", val: "prot", dims: ["resilience"], zh: "會提醒自己「現在不用把人生全部想清楚」", en: "Reminding yourself you don’t have to solve your whole life tonight", coupon: { en: "LIFE UNSOLVED TONIGHT, FINE", zh: "今晚不解人生" } },

  { id: "N01", bucket: "Neuro-Phys", val: "load", dims: ["depletion"], zh: "明明有睡，但起來還是很像沒充電", en: "Waking up feeling like you barely recharged" },
  { id: "N02", bucket: "Neuro-Phys", val: "load", dims: ["vigilance"], zh: "身體長期處在有點繃緊的狀態", en: "Body stuck in a slightly tense mode" },
  { id: "N03", bucket: "Neuro-Phys", val: "load", dims: ["vigilance"], zh: "一點聲音或訊息就能讓心跳加速", en: "Small sounds or messages spike your heart rate" },
  { id: "N04", bucket: "Neuro-Phys", val: "load", dims: ["depletion"], zh: "一放鬆就容易頭痛或全身痠痛浮出來", en: "Pain shows up as soon as you try to relax" },
  { id: "N05", bucket: "Neuro-Phys", val: "load", dims: ["depletion", "dissociation"], cut: true, zh: "很難分得出「累」跟「被壓榨過頭」的差別", en: "Hard to tell tired from over-exploited" },
  { id: "N06", bucket: "Neuro-Phys", val: "load", dims: ["dissociation", "depletion"], zh: "常常覺得身體在硬撐一套行程，心裡想停機", en: "Body going through the motions, mind wants to lie down" },
  { id: "N07", bucket: "Neuro-Phys", val: "load", dims: ["depletion", "affect_blunting"], zh: "體力還撐得住，但一想到要再社交就全身軟掉", en: "Physically okay, socially exhausted at the thought" },

  { id: "N08", bucket: "Neuro-Phys", val: "prot", dims: ["resilience"], zh: "累到一定程度時，會允許自己直接躺平", en: "Letting yourself collapse when you hit a certain level of tired", coupon: { en: "LIES DOWN ON PURPOSE", zh: "策略性躺平" } },
  { id: "N09", bucket: "Neuro-Phys", val: "prot", dims: ["resilience"], zh: "會刻意找一點點身體活動，把僵掉的感覺甩掉", en: "Using small movements to shake off stiffness", coupon: { en: "SHAKES OFF THE FREEZE", zh: "甩掉僵住" } },
  { id: "N10", bucket: "Neuro-Phys", val: "prot", dims: ["resilience"], zh: "發現自己太緊繃時，會停下來深呼吸幾下", en: "Pausing to take a few deep breaths when you’re too tense", coupon: { en: "EMERGENCY EXHALE", zh: "緊急吐氣" } },
  { id: "N11", bucket: "Neuro-Phys", val: "prot", dims: ["resilience"], cut: true, zh: "知道某些東西會讓自己爆炸，會盡量少踩", en: "Avoiding known triggers like extra caffeine or late nights", coupon: { en: "AVOIDS KNOWN EXPLOSIVES", zh: "避開已知地雷" } },
  { id: "N12", bucket: "Neuro-Phys", val: "prot", dims: ["resilience"], zh: "可以承認自己不是機器，需要維修跟休息", en: "Acknowledging you’re not a machine and need maintenance", coupon: { en: "ADMITS: NOT A MACHINE", zh: "承認自己不是機器" } },

  { id: "E01", bucket: "Existential", val: "load", dims: ["existential_load", "cognitive_load"], zh: "覺得自己在人生進度上有點落後", en: "Feeling behind in life’s timeline" },
  { id: "E02", bucket: "Existential", val: "load", dims: ["existential_load"], zh: "常常懷疑「這樣活下去到底在幹嘛」", en: "Frequently questioning what any of this is for" },
  { id: "E03", bucket: "Existential", val: "load", dims: ["existential_load", "cognitive_load"], cut: true, zh: "總是在等一個「更清楚的答案」，但它一直沒來", en: "Waiting for clarity that never arrives" },
  { id: "E04", bucket: "Existential", val: "load", dims: ["existential_load", "dissociation"], zh: "客觀上還算能幹，主觀上覺得自己在亂走", en: "Objectively competent, subjectively lost" },
  { id: "E05", bucket: "Existential", val: "load", dims: ["existential_load", "depletion"], zh: "很容易把自己的價值跟產出綁在一起", en: "Tying your worth tightly to productivity" },
  { id: "E06", bucket: "Existential", val: "load", dims: ["existential_load"], zh: "會突然想到「如果一切重來，我好像也不會比較會活」", en: "Feeling like you wouldn’t know how to live better even with a restart" },
  { id: "E07", bucket: "Existential", val: "load", dims: ["existential_load", "dissociation"], zh: "偶爾有「我好像只是勉強參與這個世界」的感覺", en: "Feeling like you’re only loosely participating in the world" },

  { id: "E08", bucket: "Existential", val: "prot", dims: ["resilience"], zh: "雖然厭世，還是有幾個人事物讓你覺得值得留下來", en: "Despite nihilism, some people/things still feel worth staying for", coupon: { en: "REASONS TO STAY: NONZERO", zh: "留下的理由＞0" } },
  { id: "E09", bucket: "Existential", val: "prot", dims: ["resilience", "existential_load"], cut: true, zh: "會認真想「如果要活下去，那我要多一點什麼／少一點什麼」", en: "Considering what you’d need more/less of to keep going", coupon: { en: "TAKES INVENTORY", zh: "盤點需求" } },
  { id: "E10", bucket: "Existential", val: "prot", dims: ["resilience"], zh: "能夠承認「這些要求本來就不合理」，而不是全怪自己不夠好", en: "Naming the demands as unreasonable instead of blaming yourself", coupon: { en: "BLAMES THE SYSTEM (CORRECTLY)", zh: "正確地怪罪體制" } },
  { id: "E11", bucket: "Existential", val: "prot", dims: ["resilience"], zh: "偶爾會為了自己，而不是為了履歷或期待去做一件事", en: "Doing something just for you, not for your CV or others", coupon: { en: "ONE THING NOT FOR THE CV", zh: "做一件不進履歷的事" } },
  { id: "E12", bucket: "Existential", val: "prot", dims: ["resilience"], zh: "把「一切都沒有意義」當成一種自由的許可，而不是絕望的判決", en: "Using 'nothing matters' as a permission slip to be free, rather than a reason to despair", coupon: { en: "NIHILISM AS PERMISSION SLIP", zh: "虛無當通行證" } }
];

CONTENT.diag = {
  VIGILANCE: [
    { en: "Generalized Hyperarousal State", zh: "廣泛性過度激發狀態" },
    { en: "Chronic Environmental Threat Monitoring", zh: "慢性環境威脅監測表現" },
    { en: "Maladaptive Vigilance Maintenance", zh: "非適應性警覺維持狀態" },
    { en: "Sympathetic Overdrive, Non-Chemical", zh: "非化學性交感神經過載" }
  ],
  DEPLETION: [
    { en: "Low-Grade Functional Exhaustion", zh: "低度功能性耗竭表現" },
    { en: "Chronic Energy Preservation Mode", zh: "慢性能量保存模式" },
    { en: "Initiation Deficit due to Overload", zh: "過載導致之啟動缺失" },
    { en: "Systemic Resource Depletion", zh: "系統性資源耗竭" }
  ],
  DISSOCIATION: [
    { en: "Subclinical Dissociative Detachment", zh: "亞臨床解離性抽離" },
    { en: "Automated Functioning Without Presence", zh: "缺乏主觀存在之自動化運作" },
    { en: "Reality-Buffering Adaptation", zh: "現實緩衝型適應表現" }
  ],
  COGNITIVE: [
    { en: "Ruminative Processing Loop", zh: "反芻性處理迴圈" },
    { en: "Hyper-Analytic Paralysis", zh: "過度分析性癱瘓狀態" },
    { en: "Executive Overload Syndrome", zh: "執行功能過載症候群" }
  ],
  EXISTENTIAL: [
    { en: "Contextual Meaning Deficit", zh: "情境性意義缺失" },
    { en: "Existential Disorientation", zh: "存在性定向障礙" },
    { en: "Nihilistic Coping Structure", zh: "虛無主義應對結構" }
  ],
  WIRED_AND_TIRED: [
    { en: "Paradoxical Arousal-Fatigue State", zh: "矛盾性激發—疲勞狀態" },
    { en: "Exhaustion with Hypervigilant Features", zh: "伴隨過度警覺特徵之耗竭" }
  ],
  BURNOUT_GHOST: [
    { en: "Functional Shutdown Mechanism", zh: "功能性關機機制" },
    { en: "Preserved Output with Internal Absence", zh: "產出保留但內在缺席狀態" }
  ],
  FUNCTIONAL_CRISIS: [
    { en: "High-Functioning Stress Architecture", zh: "高功能壓力運作架構" },
    { en: "Compensated Systemic Overload", zh: "代償性系統過載" },
    { en: "Competence-Induced Fatigue", zh: "能力導致之疲勞症候群" },
    { en: "Sustainable Crisis Management", zh: "可持續性危機管理狀態" },
    { en: "Optimized Strain Protocol", zh: "優化型過勞協議" }
  ],
  HEALTHY: [
    { en: "Context-Appropriate Adaptive Response", zh: "情境適應良好反應表現" },
    { en: "Resilient Functioning Under Stress", zh: "壓力下之韌性運作表現" },
    { en: "Boundaried Coping Mechanism", zh: "具備界線之應對機制" }
  ],
  NORMALITY: [
    { en: "Sub-Clinical Normality", zh: "亞臨床正常狀態" },
    { en: "Suspiciously Intact Functioning", zh: "功能可疑地完整" },
    { en: "Non-Pathological Presentation", zh: "非病理表現" }
  ],
  UI_TESTER: [{ en: "Assessment Velocity Anomaly", zh: "評估速度異常" }],
  PROFILE_UNIVERSAL: [{ en: "Universal Profile Elevation", zh: "全向度指數升高" }]
};

CONTENT.mods = {
  vigilance: { en: "Environmentally Reinforced", zh: "環境強化型" },
  depletion: { en: "Low-Energy Variant", zh: "低能量變異型" },
  cognitive_load: { en: "With Ruminative Features", zh: "伴隨反芻特徵" },
  resilience: { en: "With Preserved Insight", zh: "具備保留洞察力" },
  dissociation: { en: "Subjectively Distant", zh: "主觀疏離型" },
  existential_load: { en: "Context-Dependent", zh: "情境依賴型" }
};

CONTENT.notes = {
  VIGILANCE: [
    { en: "Subject exhibits sustained high-frequency threat monitoring despite the absence of immediate predation. This energy expenditure suggests the nervous system is running a wartime operating system in a civilian context.", zh: "個體在缺乏立即性捕食威脅的情況下，仍展現持續的高頻率威脅監測。此能量消耗顯示神經系統正在平民情境下運行戰時作業系統。" },
    { en: "Hyper-awareness was once protective, but now functions primarily as background noise. The system is treating all incoming data as 'high priority', resulting in signal fatigue.", zh: "過度敏銳曾經是一種保護，但現在主要功能淪為背景噪音。系統將所有輸入資料皆視為『高優先級』，導致訊號疲勞。" }
  ],
  DEPLETION: [
    { en: "Observed reduction in output correlates strictly with fuel availability, not systemic capability. The engine is intact; the tank is simply empty.", zh: "觀察到的產出下降嚴格對應於燃料的可得性，而非系統本身的能力問題。引擎是完好的，單純是油箱空了。" },
    { en: "Findings suggest a nervous system that has been operating on emergency reserves for a clinically significant period. Current lethargy is not a bug; it is a forced safety shutdown feature.", zh: "結果顯示：你的神經系統已經依靠緊急預備電力運作了相當長的一段時間。目前的嗜睡與無力並非故障，而是一種強制性的安全關機機制。" }
  ],
  DISSOCIATION: [
    { en: "Subject remains functional despite reduced subjective presence. You are essentially ghosting your own life to maintain efficiency.", zh: "在主觀存在感下降的情況下仍維持功能。為了維持效率，你基本上正在對自己的人生『已讀不回』。" },
    { en: "Autopilot engagement is at record levels. The subject attends their own life primarily as an observer. Attendance is nonetheless being marked.", zh: "自動駕駛啟用率創下新高。個體主要以觀察者身分出席自己的人生。出席紀錄仍照常登載。" }
  ],
  COGNITIVE: [
    { en: "Cognitive resources are disproportionately invested in simulating futures that will likely never happen. This over-calculation creates a 'loading' state that feels like laziness.", zh: "認知資源被過度投資在模擬那些『大概永遠不會發生』的未來上。這種過度計算創造了一種『讀取中』的狀態，感覺像懶惰。" },
    { en: "The processor runs a permanent background audit of past conversations. No material discrepancies have ever been found. The audit continues.", zh: "處理器持續在背景稽核過往對話。迄今未查得任何重大缺失。稽核仍照常進行。" }
  ],
  EXISTENTIAL: [
    { en: "Diagnostic indicators point less to internal dysfunction and more to a correct interpretation of external absurdity. The subject is seemingly the only one in the room noticing the building is on fire.", zh: "診斷指標顯示問題不在內在功能障礙，而在於對外在荒謬性的正確解讀。個體似乎是房內唯一注意到大樓著火的人。" },
    { en: "Symptoms are consistent with prolonged exposure to the news. The dosage, not the subject, is the primary finding.", zh: "症狀與長期暴露於新聞之下相符。主要發現為劑量問題，非個體問題。" }
  ],
  FUNCTIONAL_CRISIS: [
    { en: "Subject is effectively managing a crisis level that would crush a lesser system. Output remains high, but internal temperature is critical. Recommendation: You are doing a good job, but please remember you are mortal.", zh: "個體正在有效管理一個足以壓垮普通系統的危機水平。產出維持高檔，但核心溫度已達臨界值。建議：你做得很好，但請記得你是人類，不是永動機。" },
    { en: "Resilience markers are remarkably high, acting as a structural corset for a very tired nervous system. You are holding it together beautifully. We just hope you have a plan for when you eventually exhale.", zh: "韌性指標顯著偏高，像是一件結構完美的馬甲，支撐著疲憊不堪的神經系統。你撐得很漂亮。我們只希望，當你終於能夠吐氣放鬆的那一刻，你有做好軟著陸的準備。" },
    { en: "Your competence has become a trap. Because you *can* carry this load, the environment assumes you *should*. The system is not failing; it is succeeding at the cost of its own structural integrity.", zh: "你的能力變成了一種陷阱。因為你「扛得住」，周遭環境就理所當然覺得你「應該扛」。系統並沒有故障，它只是在透支結構強度的情況下，成功地完成了任務。" },
    { en: "Current functionality is likely powered by a mix of cortisol, caffeine, and spite. You are borrowing energy from next month to survive today. The interest rate on this loan is predatory.", zh: "目前的功能運作很可能完全是由皮質醇、咖啡因和一股怨氣在驅動。你正在預支下個月的能量來撐過今天。提醒您：這筆貸款的利息是高利貸等級的。" },
    { en: "You are moving fast enough that the blur looks like stability. But the gyroscopes are screaming. If you stop moving now, you might fall over, which is why you keep running.", zh: "你的速度快到讓模糊的殘影看起來像是一種「穩定」。但內部的陀螺儀其實已經在尖叫了。你不敢停下來，因為一停下來可能就會倒，所以你只好繼續跑。" }
  ],
  HEALTHY: [
    { en: "Subject demonstrates a rare capacity to terminate work protocols prior to systemic collapse. In the current socioeconomic climate, such self-preservation behavior is statistically deviant but highly functional.", zh: "個體展現出一種罕見的能力，能在系統完全崩潰前終止工作協議。在當前的社會經濟氣候下，這種自我保存行為在統計上屬於偏差，但功能極佳。" },
    { en: "Findings indicate functioning boundaries and adequate rest. The Institute has no notes. This absence has itself been noted.", zh: "結果顯示界線功能正常、休息尚屬充足。本所無可批註。此一空白本身已予登載。" }
  ],
  WIRED_AND_TIRED: [
    { en: "Subject is simultaneously running a marathon and trying to sleep. This paradoxical state creates high tension with low output.", zh: "個體正在一邊跑馬拉松一邊試著睡覺。這種矛盾狀態創造了『高張力、低產出』的結果。" },
    { en: "The accelerator and the brake are both fully depressed. The engine logs this as productivity; the tires report smoke.", zh: "油門與煞車同時踩到底。引擎將此狀態登錄為『生產力』；輪胎方面則回報冒煙。" }
  ],
  BURNOUT_GHOST: [
    { en: "System has decided that 'not being here' is the most efficient way to 'be here'. Emotional data is being compressed to save bandwidth.", zh: "系統判定：『不在場』是目前『在場』最有效率的方式。情緒資料正在被壓縮以節省頻寬。" },
    { en: "Presence levels are below detection threshold, yet deliverables continue to arrive on schedule. The Institute cannot explain this and has stopped trying.", zh: "存在感低於偵測門檻，惟產出仍如期送達。本所無法解釋此現象，並已停止嘗試。" }
  ],
  NORMALITY: [
    { en: "Subject reports remarkably few systemic errors. This absence of distress is suspicious given the current environment. We are monitoring the situation.", zh: "個體回報的系統錯誤少得驚人。考慮到當前的大環境，這種「沒有痛苦」的狀態相當可疑。我們正在密切監控。" },
    { en: "All indicators within range. The Institute finds this level of calm difficult to trust and will keep the file open on principle.", zh: "各項指標均於範圍內。本所難以信任此等平靜，基於原則，本案繼續列管。" }
  ],
  UI_TESTER: [
    { en: "Subject completed a {k}-item psychological instrument in {s} seconds. The instrument feels disrespected. No further interpretation will be offered.", zh: "個體在 {s} 秒內完成 {k} 題心理量表。量表覺得不受尊重。不再提供進一步解讀。" },
    { en: "The instrument was completed faster than it can be read. The Institute records a personal best and nothing else.", zh: "作答速度快於可閱讀速度。本所僅登載個人最佳紀錄，其餘從缺。" }
  ],
  PROFILE_UNIVERSAL: [
    { en: "Every scale is elevated. Either everything is wrong at once, or you are a very agreeable person. Both warrant attention. Only one implicates the instrument.", zh: "所有量尺皆呈升高。要嘛是一切同時出了問題，要嘛你異常配合。兩者都值得留意，但只有一個牽涉到量表本身。" },
    { en: "Universal endorsement detected. Statistically, this profile belongs to either a crisis or a completionist. The Institute is not equipped to distinguish them.", zh: "偵測到全面勾選。統計上，此剖面屬於危機或完成主義者兩者之一。本所無設備足以區分。" }
  ]
};

CONTENT.rarity = {
  FUNCTIONAL_CRISIS: { p: "7", en: "", zh: "" },
  WIRED_AND_TIRED: { p: "11", en: "", zh: "" },
  BURNOUT_GHOST: { p: "6", en: "", zh: "" },
  VIGILANCE: { p: "13", en: "", zh: "" },
  DEPLETION: { p: "17", en: "", zh: "" },
  DISSOCIATION: { p: "5", en: "", zh: "" },
  COGNITIVE: { p: "12", en: "", zh: "" },
  EXISTENTIAL: { p: "9", en: "", zh: "" },
  HEALTHY: { p: "4", en: " Statistically deviant.", zh: "統計上屬於偏差值。" },
  NORMALITY: { p: "2.4", en: " And falling.", zh: "而且還在下降。" },
  PROFILE_UNIVERSAL: { p: "1.2", en: "", zh: "" },
  UI_TESTER: { p: "0.1", en: " Typically UI testers.", zh: "通常是來測 UI 的。" }
};

CONTENT.snark = {
  teach: { en: "You may select more than one. Most subjects need more than one.", zh: "這裡可以複選。很多人都不只一項。" },
  sweep: { en: "The entire section. Bold. Honest. Concerning.", zh: "整節全選。大膽，誠實，令人擔心。" },
  deselect1: { en: "The Institute saw that.", zh: "研究所都看到了。" },
  growing: { en: "The file is growing.", zh: "檔案正在變厚。" },
  deselect3: { en: "Third revision. Your ambivalence now has its own file.", zh: "第三次修訂。你的猶豫如今已經獨立成檔。" },
  speedrun: { en: "Speed noted. Accuracy pending.", zh: "速度已記錄。準確度待議。" },
  idle: { en: "Take your time. The Institute bills by the hour.", zh: "慢慢想。研究所這邊是按小時收費。" }
};

CONTENT.interstitials = [
  { en: "Feelings filed.", zh: "情緒已存檔。" },
  { en: "Behaviours noted. Mildly judged.", zh: "行為已記錄。並作保留意見。" },
  { en: "Thought loops catalogued.", zh: "思緒迴圈已編目。" },
  { en: "The body keeps the score. We keep it on file.", zh: "心靈的傷，身體會記住。本所會替你存檔。" }
];

CONTENT.processing = [
  { en: "Quantifying vibes…", zh: "正在量化 vibes…", pct: 12, ms: 500 },
  { en: "Consulting DSM-VI (unpublished)…", zh: "查閱 DSM-VI（未出版）…", pct: 31, ms: 550 },
  { en: "Cross-referencing your cohort (everyone is tired)…", zh: "與同世代交叉比對（大家都很累）…", pct: 54, ms: 600 },
  { en: "Adjusting for grade inflation…", zh: "校正分數通膨…", pct: 78, ms: 500 },
  { en: "Ignoring your actual circumstances…", zh: "忽略你的實際處境…", pct: 93, ms: 700 },
  { en: "Recalibrating (do not be alarmed)…", zh: "重新校準中（請勿驚慌）…", pct: 50, ms: 900 },
  { en: "Finalizing…", zh: "完成中…", pct: 99, ms: 1400 }
];

CONTENT.processNotes = {
  night: { en: "Assessment completed at {time}. This has been added to the file.", zh: "評估於 {time} 完成。此項事實已納入檔案。" },
  revisions: { en: "Subject revised answers ×{n}. Noted.", zh: "個體修改作答 {n} 次。已記錄。" },
  dwell: { en: "Longest deliberation: {module} module.", zh: "最長停留：{module} 模組。" },
  langswitch: { en: "Subject switched languages mid-assessment. Bilingual distress registered.", zh: "個體中途切換語言。雙語困擾已註記。" },
  backtrack: { en: "Returned to previous sections ×{n}. Second thoughts documented.", zh: "回頭修改 {n} 次。反悔已建檔。" },
  sprint: { en: "Total duration: {s} sec. Efficiency noted with suspicion.", zh: "全程 {s} 秒。效率高到可疑。" },
  marathon: { en: "Duration: {m} minutes. Thoroughness or avoidance; the Institute declines to guess.", zh: "歷時 {m} 分鐘。本所暫不區分審慎與拖延。" }
};

CONTENT.recs = {
  dims: {
    vigilance: { en: "Reduce vigilance. The Institute concedes the environment does not support this recommendation.", zh: "降低警覺。本所承認，目前的環境並不支持這項建議。" },
    depletion: { en: "Rest. Not the productive kind, the kind you would prescribe someone you liked.", zh: "休息。不是有生產力的那種，是你會開給在乎的人的那種。" },
    dissociation: { en: "Return to the body at your convenience. It has kept the light on.", zh: "方便時請回到身體裡。它還在。" },
    cognitive_load: { en: "Think about this less. The Institute is aware of what this sentence just did.", zh: "少想一點。本所明白這句話剛剛造成了什麼。" },
    existential_load: { en: "Meaning falls outside the Institute's jurisdiction. Keep making it up; that is the standard procedure.", zh: "意義不在本所管轄範圍內。請繼續自行編造；此為標準程序。" },
    affect_blunting: { en: "Feelings may be resumed in small doses. Start with a low-stakes one.", zh: "情緒可小劑量恢復使用。從風險低的那種開始。" }
  },
  clear: { en: "Maintain current regimen. The Institute is reluctantly impressed.", zh: "維持現行方案。本所勉為其難地表示佩服。" },
  closers: [
    { en: "Continue at the current dose of yourself. No titration indicated.", zh: "「你自己」請依目前劑量繼續服用，暫無調整之必要。" },
    { en: "Follow-up: none scheduled. The Institute trusts you'll manage, and for once means it.", zh: "後續追蹤：未安排。本所相信你應付得來——這次是認真的。" },
    { en: "Discharge condition: unchanged. Under current conditions, unchanged counts as holding.", zh: "出院狀態：無變化。以目前情勢而言，「無變化」即屬撐住。" }
  ]
};

CONTENT.uninsured = {
  doc: { en: "No coupons on file. The Institute notes, without irony for once, that carrying this much uninsured is expensive.", zh: "檔案中沒有任何折價券。研究所難得不反諷地指出：裸險扛這麼多，很貴。" },
  receipt: { en: "NO DISCOUNTS APPLIED — ASK STAFF ABOUT OUR LOYALTY PROGRAM (SLEEP)", zh: "未套用任何折扣——會員方案請洽櫃檯（睡眠）" }
};

CONTENT.receipt = {
  charges: {
    vigilance: { en: "VIGILANCE SURCHARGE", zh: "警覺附加費" },
    depletion: { en: "DEPLETION (BULK RATE)", zh: "耗竭（量販價）" },
    dissociation: { en: "DISSOCIATION HANDLING FEE", zh: "解離手續費" },
    cognitive_load: { en: "RUMINATION LOOP FEE", zh: "反芻迴圈費" },
    existential_load: { en: "EXISTENTIAL VAT (20%)", zh: "存在稅（20%）" },
    affect_blunting: { en: "EMOTION STORAGE FEE (COLD)", zh: "情緒冷藏費" }
  },
  subtotal: { en: "SUBTOTAL", zh: "小計" },
  coupons: { en: "COUPONS APPLIED:", zh: "已套用折價券：" },
  more: { en: "+{n} MORE", zh: "＋另 {n} 張" },
  saved: { en: "★ YOU SAVED {p}% TODAY (RESILIENCE)", zh: "★ 本次為你省下 {p}%（心理韌性）" },
  credit: { en: "CREDIT ISSUED — REDEEMABLE IN NAPS", zh: "已發存入額度——僅可折抵午睡" },
  total: { en: "TOTAL", zh: "總計" },
  totalTooMuch: { en: "TOO MUCH", zh: "太多了" },
  totalOk: { en: "MANAGEABLE (SUSPICIOUS)", zh: "尚可（可疑）" },
  payDeclined: { en: "CORTISOL ......... DECLINED", zh: "皮質醇⋯⋯⋯⋯拒絕" },
  payApproved: { en: "CAFFEINE ........ APPROVED", zh: "咖啡因⋯⋯⋯⋯核准" },
  paySpite: { en: "SPITE ... APPROVED (LOYALTY)", zh: "怨氣⋯⋯核准（熟客）" },
  dxLabel: { en: "PROVISIONAL DX:", zh: "暫定評估：" },
  rarity: { en: "RARITY: ISSUED TO ~{p}% OF SUBJECTS", zh: "稀有度：約發給 {p}% 的受測者" },
  notesLabel: { en: "PROCESS NOTES (UNSOLICITED):", zh: "歷程紀錄（未經同意）：" },
  amended: { en: "RETURN PROCESSED — RESULT REGRETTABLY IDENTICAL", zh: "退件處理完成——結果遺憾地完全一致" },
  customerCopy: { en: "CUSTOMER COPY", zh: "顧客聯" },
  cashier: { en: "REG 88-B · CASHIER: DR. ALGORITHM", zh: "88-B 號機・收銀：演算法醫師" },
  fineprint: {
    en: ["NO CLINICAL VALIDITY · NO REFUNDS", "NOT VALID AS A DOCTOR'S NOTE", "YOUR FILE IS STORED IN YOUR OWN", "BROWSER, WHICH MAKES IT LEGALLY", "YOUR PROBLEM"],
    zh: ["不具臨床效力・恕不退還", "不得作為醫師證明使用", "你的檔案儲存在你自己的瀏覽器裡", "故法律上由你自行負責"]
  },
  ref: "REF: 404-HOPE-NOT-FOUND",
  refAlt: "REF: 200-STILL-HERE"
};

CONTENT.coverage = {
  covered: { en: "COVERAGE CONFIRMED: {list}", zh: "已投保：{list}" },
  uncovered: { en: "NOT COVERED: {list}", zh: "未投保：{list}" },
  preexisting: { en: " (pre-existing condition)", zh: "（既往症）" },
  tiers: [
    { min: 0.45, en: "STRUCTURAL INTEGRITY: PASSED, WITH MARGIN", zh: "結構完整度：通過，還有餘裕" },
    { min: 0.25, en: "STRUCTURAL INTEGRITY: PASSED, BARELY", zh: "結構完整度：勉強通過" },
    { min: 0.10, en: "STRUCTURAL INTEGRITY: INSPECTION WAIVED (DO NOT ASK)", zh: "結構完整度：免檢（別問）" },
    { min: 0, en: "STRUCTURAL INTEGRITY: RUNNING ON SPITE", zh: "結構完整度：靠怨氣運轉中" }
  ]
};

CONTENT.ui = {
  en: {
    title: "Institute of Questionable Neuroclarity",
    instName: "Institute of Questionable Neuroclarity",
    deptName: "Dept. of Vibes & Hasty Generalizations",
    tagline: "No clinical validity. High emotional validity.",
    landingBody: "This intake takes about three minutes. The assessment has already begun.",
    landingBtn: "Begin intake",
    formLabel: "FORM 88-B",
    moduleLabel: "MODULE {i}/5",
    fileCount: "FILE: {n} ITEMS",
    instruction: "Select all labels that apply right now.",
    subLoad: "Current State",
    subProt: "Preserved Function",
    back: "← Back",
    next: "Next module →",
    run: "Run Assessment",
    error: "Select something. We both know you're not fine.",
    buckets: ["Affective", "Behavioural", "Cognitive", "Neuro-Phys", "Existential"],
    skip: "Skip to content",
    colItem: "ITEM",
    colApplies: "APPLIES",
    textVersion: "Text version (screen-reader friendly)",
    copyText: "Copy as text",
    copied: "Copied.",
    receiptAlt: "LUCID receipt — text version available below",
    diagLabel: "PROVISIONAL DIAGNOSIS",
    amendedTag: "AMENDED",
    referred: "REFERRED TO A HUMAN",
    rarityLine: "Issued to ~{p}% of subjects.",
    secondOpinion: "Request second opinion",
    noDoctors: "The Institute has run out of doctors.",
    printReceipt: "Print receipt (PNG)",
    retake: "Discharge & re-admit",
    processHead: "PROCESS NOTES (UNSOLICITED)",
    recsHead: "RECOMMENDATIONS (NON-BINDING)",
    profileHead: "SCALE PROFILE (T-SCORES, UNCALIBRATED)",
    cutoffLabel: "CLINICAL SIGNIFICANCE (CUTOFF ARBITRARY)",
    protHead: "PROTECTIVE FACTORS ON FILE",
    protNone: "None on file. The Institute checked twice.",
    subjLabel: "SUBJECT NO.",
    shareBtn: "Share receipt",
    shareText: "Institute of Questionable Neuroclarity — diagnosis: {title}.",
    dims: { vigilance: "VIGILANCE", depletion: "DEPLETION", dissociation: "DISSOCIATION", cognitive_load: "OVERTHINK", existential_load: "EXISTENTIAL", affect_blunting: "BLUNTING" },
    footerHead: "NON-CLINICAL OBSERVATION",
    footerBody: "This diagnosis is for emotional validation only. If the results feel painfully accurate, blame the absurdity of modern existence, not the algorithm. If inaccurate... go touch some grass, my friend.",
    imprint: "FORM 88-B · REV. 2026-07 · PAGE 1 OF 1 (ALWAYS)",
    credits: "Powered by questionable coping mechanisms. Made by @jelliwolf."
  },
  zh: {
    title: "神經清醒度存疑研究所",
    instName: "神經清醒度存疑研究所",
    deptName: "氛圍與草率歸納部",
    tagline: "無臨床效力，具情緒效度。",
    landingBody: "填寫約需三分鐘。而評估，其實已經開始了。",
    landingBtn: "開始填寫",
    formLabel: "88-B 表",
    moduleLabel: "第 {i}/5 節",
    fileCount: "檔案：{n} 項",
    instruction: "請選擇所有符合你目前狀態的標籤。",
    subLoad: "最近比較像你的狀態",
    subProt: "你其實有做到的調整",
    back: "← 上一節",
    next: "下一節 →",
    run: "執行評估",
    error: "選些什麼吧。我們都知道你不是沒事。",
    buckets: ["情緒向度 (Affective)", "行為指標 (Behavioural)", "認知功能 (Cognitive)", "神經生理 (Neuro-Phys)", "存在狀態 (Existential)"],
    skip: "跳至主要內容",
    colItem: "項目",
    colApplies: "符合",
    textVersion: "文字版（支援螢幕閱讀器）",
    copyText: "複製文字版",
    copied: "已複製。",
    receiptAlt: "LUCID 收據——下方提供文字版",
    diagLabel: "暫定評估結果",
    amendedTag: "已修訂",
    referred: "轉介真人",
    rarityLine: "本結果約發給 {p}% 的受測者。",
    secondOpinion: "申請第二意見",
    noDoctors: "本所醫師業已用罄，請毋通催。",
    printReceipt: "列印收據（PNG）",
    retake: "辦理出院，再入院",
    processHead: "歷程紀錄（未經同意）",
    recsHead: "處置建議（不具約束力）",
    profileHead: "量表剖面（T 分數，未經校準）",
    cutoffLabel: "臨床顯著線（切分點由本所酌定）",
    protHead: "在案保護因子",
    protNone: "查無在案紀錄。本所已複查兩次。",
    subjLabel: "個案編號",
    shareBtn: "分享收據",
    shareText: "神經清醒度存疑研究所診斷：{title}。",
    dims: { vigilance: "過度警覺", depletion: "能量耗竭", dissociation: "現實解離", cognitive_load: "認知內耗", existential_load: "存在負荷", affect_blunting: "情緒鈍化" },
    footerHead: "非臨床觀察報告",
    footerBody: "本結果僅供情緒驗證，不具臨床效力。若診斷結果過於準確，純屬這世界太荒謬，非本系統之過。若結果不準……去摸摸草吧朋友。",
    imprint: "88-B 表・2026-07 版・全 1 頁（一直都是）",
    credits: "由 @jelliwolf 製作，動力來源為可疑的應對機制。"
  }
};
