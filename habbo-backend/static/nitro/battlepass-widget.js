(function() {
  // ==================== CONFIG ====================
  var API_BASE = '';
  var CREDIT_IMG = 'https://images.habbo.com/c_images/catalogue/icon_68.png';
  var DUCKET_IMG = 'https://images.habbo.com/c_images/catalogue/icon_203.png';
  var DIAMOND_IMG = 'https://images.habbo.com/c_images/catalogue/diamond_small.png';
  var BADGE_IMG = 'https://images.habbo.com/c_images/catalogue/icon_213.png';
  var FURNI_IMG = 'https://images.habbo.com/c_images/catalogue/icon_108.png';
  var TROPHY_IMG = 'https://images.habbo.com/c_images/catalogue/icon_213.png';

  function getRewardImg(type) {
    switch(type) {
      case 'credits': return CREDIT_IMG;
      case 'duckets': return DUCKET_IMG;
      case 'diamonds': return DIAMOND_IMG;
      case 'badge': return BADGE_IMG;
      case 'furni': return FURNI_IMG;
      default: return TROPHY_IMG;
    }
  }
  function getRewardColor(type) {
    switch(type) {
      case 'credits': return '#fbbf24';
      case 'duckets': return '#a78bfa';
      case 'diamonds': return '#38bdf8';
      case 'badge': return '#f472b6';
      case 'furni': return '#34d399';
      default: return '#fff';
    }
  }
  function getRewardLabel(type) {
    switch(type) {
      case 'credits': return 'Credits';
      case 'duckets': return 'Duckets';
      case 'diamonds': return 'Diamonds';
      case 'badge': return 'Badge';
      case 'furni': return 'Furniture';
      default: return type;
    }
  }

  // ==================== AUTH ====================
  function getToken() {
    try { return window.parent.localStorage.getItem('token'); } catch(e) {
      try { return localStorage.getItem('token'); } catch(e2) { return null; }
    }
  }

  async function apiFetch(path) {
    var token = getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var res = await fetch(API_BASE + path, { headers: headers });
    if (!res.ok) throw new Error('API error ' + res.status);
    return res.json();
  }

  async function apiPost(path, body) {
    var token = getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var opts = { method: 'POST', headers: headers };
    if (body) opts.body = JSON.stringify(body);
    var res = await fetch(API_BASE + path, opts);
    if (!res.ok) {
      var errText = '';
      try { var errJson = await res.json(); errText = errJson.detail || JSON.stringify(errJson); } catch(e) { errText = 'API error ' + res.status; }
      throw new Error(errText);
    }
    return res.json();
  }

  // ==================== STATE ====================
  var state = {
    isOpen: false,
    isMinimized: false,
    activeTab: 'overview',
    season: null,
    tiers: [],
    progress: null,
    tasks: [],
    loading: true,
    error: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    isDragging: false,
    posX: 0,
    posY: 0,
    toast: null,
    toastTimer: null
  };

  // ==================== STYLES ====================
  var css = document.createElement('style');
  css.textContent = `
    #bp-toggle-btn {
      z-index: 99999;
      background: transparent;
      color: #c084fc;
      padding: 6px 10px;
      cursor: pointer;
      font-family: Arial, sans-serif;
      border: none;
      transition: all 0.15s;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 6px;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin-top: 2px;
    }
    #bp-toggle-btn:hover { background: rgba(124,58,237,0.15); }
    #bp-toggle-btn img { width: 16px; height: 16px; image-rendering: pixelated; }

    #bp-widget {
      position: fixed;
      z-index: 100000;
      width: 520px;
      max-height: 85vh;
      background: linear-gradient(180deg, #1a1025 0%, #0d0a14 100%);
      border: 2px solid #7c3aed;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(124,58,237,0.3);
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #e2e8f0;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    #bp-widget.open { display: flex; }
    #bp-widget.minimized { max-height: 44px; overflow: hidden; }
    #bp-widget.minimized #bp-body { display: none; }
    #bp-widget.minimized #bp-tabs { display: none; }

    #bp-header {
      background: linear-gradient(135deg, #7c3aed, #ec4899);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    #bp-header:active { cursor: grabbing; }
    #bp-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }
    #bp-header-left img { width: 20px; height: 20px; image-rendering: pixelated; }
    #bp-header-btns { display: flex; gap: 6px; }
    #bp-header-btns button {
      width: 26px; height: 26px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .bp-btn-min { background: rgba(255,255,255,0.2); color: #fff; }
    .bp-btn-min:hover { background: rgba(255,255,255,0.35); }
    .bp-btn-close { background: rgba(255,0,0,0.3); color: #fff; }
    .bp-btn-close:hover { background: rgba(255,0,0,0.6); }

    #bp-tabs {
      display: flex;
      background: #1e1530;
      border-bottom: 1px solid #2d2245;
      flex-shrink: 0;
    }
    .bp-tab {
      flex: 1;
      padding: 9px 8px;
      text-align: center;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #8b7fa8;
      transition: all 0.15s;
      border-bottom: 2px solid transparent;
      background: none;
      border-top: none;
      border-left: none;
      border-right: none;
    }
    .bp-tab:hover { color: #c4b5fd; background: rgba(124,58,237,0.1); }
    .bp-tab.active {
      color: #c084fc;
      border-bottom-color: #c084fc;
      background: rgba(124,58,237,0.15);
    }

    #bp-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      min-height: 300px;
      max-height: calc(85vh - 100px);
    }
    #bp-body::-webkit-scrollbar { width: 6px; }
    #bp-body::-webkit-scrollbar-track { background: #1a1025; }
    #bp-body::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }

    .bp-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .bp-stat-card {
      background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1));
      border: 1px solid #2d2245;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .bp-stat-value {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #c084fc, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .bp-stat-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8b7fa8;
      margin-top: 2px;
    }

    .bp-xp-bar-wrap {
      background: #1e1530;
      border: 1px solid #2d2245;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 14px;
    }
    .bp-xp-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #8b7fa8;
      margin-bottom: 6px;
    }
    .bp-xp-bar {
      height: 12px;
      background: #0d0a14;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }
    .bp-xp-fill {
      height: 100%;
      background: linear-gradient(90deg, #7c3aed, #ec4899);
      border-radius: 6px;
      transition: width 0.5s ease;
      position: relative;
    }
    .bp-xp-fill::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: bp-shimmer 2s infinite;
    }
    @keyframes bp-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .bp-section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #c084fc;
      margin: 16px 0 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bp-section-title img { width: 16px; height: 16px; image-rendering: pixelated; }

    .bp-task-card {
      background: rgba(30,21,48,0.8);
      border: 1px solid #2d2245;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 8px;
      transition: all 0.15s;
    }
    .bp-task-card:hover { border-color: #7c3aed; }
    .bp-task-card.completed { border-color: #22c55e; background: rgba(34,197,94,0.08); }
    .bp-task-card.claimed { opacity: 0.5; }
    .bp-task-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .bp-task-desc {
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
      flex: 1;
    }
    .bp-task-xp {
      font-size: 11px;
      font-weight: 700;
      color: #fbbf24;
      background: rgba(251,191,36,0.15);
      padding: 2px 8px;
      border-radius: 10px;
      white-space: nowrap;
      margin-left: 8px;
    }
    .bp-task-progress-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .bp-task-bar {
      flex: 1;
      height: 8px;
      background: #0d0a14;
      border-radius: 4px;
      overflow: hidden;
    }
    .bp-task-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #7c3aed, #a855f7);
      border-radius: 4px;
      transition: width 0.3s;
    }
    .bp-task-bar-fill.done { background: linear-gradient(90deg, #22c55e, #4ade80); }
    .bp-task-count {
      font-size: 10px;
      color: #8b7fa8;
      min-width: 40px;
      text-align: right;
    }
    .bp-claim-btn {
      margin-top: 6px;
      padding: 5px 14px;
      border: none;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      transition: all 0.15s;
    }
    .bp-claim-btn.ready {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      box-shadow: 0 2px 8px rgba(34,197,94,0.4);
    }
    .bp-claim-btn.ready:hover { transform: scale(1.05); }
    .bp-claim-btn.claimed-btn {
      background: #1e1530;
      color: #4ade80;
      cursor: default;
      border: 1px solid #22c55e;
    }
    .bp-claim-btn.locked {
      background: #1e1530;
      color: #4b3a6b;
      cursor: not-allowed;
      border: 1px solid #2d2245;
    }

    .bp-tier-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .bp-tier-card {
      background: rgba(30,21,48,0.8);
      border: 1px solid #2d2245;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }
    .bp-tier-card:hover { border-color: #7c3aed; transform: translateY(-2px); }
    .bp-tier-card.unlocked { border-color: #22c55e; }
    .bp-tier-card.unlocked::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #22c55e, #4ade80);
    }
    .bp-tier-card.current-tier { border-color: #c084fc; box-shadow: 0 0 12px rgba(192,132,252,0.3); }
    .bp-tier-card.current-tier::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #7c3aed, #ec4899);
    }
    .bp-tier-card.locked-tier { opacity: 0.45; }
    .bp-tier-num {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8b7fa8;
      margin-bottom: 6px;
    }
    .bp-tier-reward-img {
      width: 32px;
      height: 32px;
      image-rendering: pixelated;
      margin: 0 auto 6px;
      display: block;
    }
    .bp-tier-reward-amount {
      font-size: 18px;
      font-weight: 800;
    }
    .bp-tier-reward-type {
      font-size: 10px;
      color: #8b7fa8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .bp-tier-xp-req {
      font-size: 9px;
      color: #4b3a6b;
      margin-top: 4px;
    }

    .bp-toast {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(34,197,94,0.5);
      z-index: 10;
      animation: bp-toast-in 0.3s ease;
      pointer-events: none;
    }
    @keyframes bp-toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .bp-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #8b7fa8;
    }
    .bp-spinner {
      width: 32px; height: 32px;
      border: 3px solid #2d2245;
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: bp-spin 0.8s linear infinite;
      margin-bottom: 12px;
    }
    @keyframes bp-spin { to { transform: rotate(360deg); } }

    .bp-season-banner {
      background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15));
      border: 1px solid #2d2245;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 14px;
      text-align: center;
    }
    .bp-season-name {
      font-size: 16px;
      font-weight: 800;
      background: linear-gradient(135deg, #c084fc, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .bp-season-days {
      font-size: 11px;
      color: #8b7fa8;
      margin-top: 4px;
    }
    .bp-login-streak {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(251,191,36,0.15);
      color: #fbbf24;
      padding: 4px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      margin-top: 8px;
    }
  `;
  document.head.appendChild(css);

  // ==================== ELEMENTS ====================
  // Toggle button
  var toggleBtn = document.createElement('div');
  toggleBtn.id = 'bp-toggle-btn';
  toggleBtn.innerHTML = '<img src="' + TROPHY_IMG + '"> <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#c084fc">Battle Pass</span>';

  // Widget container
  var widget = document.createElement('div');
  widget.id = 'bp-widget';

  // Position widget center of screen
  function centerWidget() {
    state.posX = Math.max(0, (window.innerWidth - 520) / 2);
    state.posY = Math.max(0, (window.innerHeight - 600) / 2);
    widget.style.left = state.posX + 'px';
    widget.style.top = state.posY + 'px';
  }

  // ==================== RENDER ====================
  function render() {
    var html = '';

    // Header
    html += '<div id="bp-header">';
    html += '<div id="bp-header-left"><img src="' + TROPHY_IMG + '"> HabPlus Battle Pass</div>';
    html += '<div id="bp-header-btns">';
    html += '<button class="bp-btn-min" id="bp-minimize-btn" title="Minimize">&minus;</button>';
    html += '<button class="bp-btn-close" id="bp-close-btn" title="Close">&times;</button>';
    html += '</div></div>';

    // Tabs
    html += '<div id="bp-tabs">';
    html += '<button class="bp-tab' + (state.activeTab === 'overview' ? ' active' : '') + '" data-tab="overview">Overview</button>';
    html += '<button class="bp-tab' + (state.activeTab === 'tasks' ? ' active' : '') + '" data-tab="tasks">Tasks</button>';
    html += '<button class="bp-tab' + (state.activeTab === 'rewards' ? ' active' : '') + '" data-tab="rewards">Rewards</button>';
    html += '</div>';

    // Body
    html += '<div id="bp-body">';

    if (state.loading) {
      html += '<div class="bp-loading"><div class="bp-spinner"></div>Loading Battle Pass...</div>';
    } else if (state.error) {
      html += '<div class="bp-loading" style="color:#f87171">' + state.error + '</div>';
    } else if (state.activeTab === 'overview') {
      html += renderOverview();
    } else if (state.activeTab === 'tasks') {
      html += renderTasks();
    } else if (state.activeTab === 'rewards') {
      html += renderRewards();
    }

    html += '</div>';

    // Toast
    if (state.toast) {
      html += '<div class="bp-toast">' + state.toast + '</div>';
    }

    widget.innerHTML = html;
    bindEvents();
  }

  function renderOverview() {
    var h = '';
    var s = state.season;
    var p = state.progress || { total_xp: 0, current_tier: 0, login_streak: 0 };

    // Season banner
    if (s) {
      h += '<div class="bp-season-banner">';
      h += '<div class="bp-season-name">' + (s.name || 'Season 1') + '</div>';
      h += '<div class="bp-season-days">' + (s.days_remaining || 0) + ' days remaining</div>';
      if (p.login_streak > 0) {
        h += '<div class="bp-login-streak">&#128293; ' + p.login_streak + ' Day Login Streak</div>';
      }
      h += '</div>';
    }

    // Stats grid
    h += '<div class="bp-stats-grid">';
    h += '<div class="bp-stat-card"><div class="bp-stat-value">' + (p.current_tier || 0) + '</div><div class="bp-stat-label">Current Tier</div></div>';
    h += '<div class="bp-stat-card"><div class="bp-stat-value">' + (p.total_xp || 0) + '</div><div class="bp-stat-label">Total XP</div></div>';
    h += '<div class="bp-stat-card"><div class="bp-stat-value">' + (s ? s.max_tier : 20) + '</div><div class="bp-stat-label">Max Tier</div></div>';
    h += '<div class="bp-stat-card"><div class="bp-stat-value">' + (p.login_streak || 0) + '</div><div class="bp-stat-label">Login Streak</div></div>';
    h += '</div>';

    // XP progress to next tier
    var nextTier = (p.current_tier || 0) + 1;
    var nextTierData = state.tiers.find(function(t) { return t.tier === nextTier; });
    var prevTierData = state.tiers.find(function(t) { return t.tier === (p.current_tier || 0); });
    var xpForNext = nextTierData ? nextTierData.cumulative_xp : 0;
    var xpForPrev = prevTierData ? prevTierData.cumulative_xp : 0;
    var xpInTier = (p.total_xp || 0) - xpForPrev;
    var xpNeeded = xpForNext - xpForPrev;
    var pct = xpNeeded > 0 ? Math.min(100, Math.round((xpInTier / xpNeeded) * 100)) : (p.current_tier >= (s ? s.max_tier : 20) ? 100 : 0);

    if (nextTierData) {
      h += '<div class="bp-xp-bar-wrap">';
      h += '<div class="bp-xp-label"><span>Progress to Tier ' + nextTier + '</span><span>' + (p.total_xp || 0) + ' / ' + xpForNext + ' XP</span></div>';
      h += '<div class="bp-xp-bar"><div class="bp-xp-fill" style="width:' + pct + '%"></div></div>';
      h += '</div>';
    } else {
      h += '<div class="bp-xp-bar-wrap">';
      h += '<div class="bp-xp-label"><span>MAX TIER REACHED!</span><span>' + (p.total_xp || 0) + ' XP</span></div>';
      h += '<div class="bp-xp-bar"><div class="bp-xp-fill" style="width:100%"></div></div>';
      h += '</div>';
    }

    // Next reward preview
    if (nextTierData) {
      h += '<div class="bp-section-title"><img src="' + getRewardImg(nextTierData.reward_type) + '"> Next Reward (Tier ' + nextTier + ')</div>';
      h += '<div class="bp-tier-card" style="text-align:center;padding:16px;">';
      h += '<img class="bp-tier-reward-img" src="' + getRewardImg(nextTierData.reward_type) + '" style="width:40px;height:40px;">';
      h += '<div class="bp-tier-reward-amount" style="color:' + getRewardColor(nextTierData.reward_type) + '">' + nextTierData.reward_amount + '</div>';
      h += '<div class="bp-tier-reward-type">' + getRewardLabel(nextTierData.reward_type) + '</div>';
      h += '</div>';
    }

    return h;
  }

  function renderTasks() {
    var h = '';
    var dailyTasks = state.tasks.filter(function(t) { return t.task_type === 'daily'; });
    var weeklyTasks = state.tasks.filter(function(t) { return t.task_type === 'weekly'; });

    // Daily Tasks
    h += '<div class="bp-section-title"><img src="https://images.habbo.com/c_images/catalogue/icon_203.png"> Daily Tasks</div>';
    if (dailyTasks.length === 0) {
      h += '<div style="color:#4b3a6b;font-size:12px;padding:8px;">No daily tasks available</div>';
    }
    dailyTasks.forEach(function(task) {
      var pct = task.target > 0 ? Math.min(100, Math.round((task.progress / task.target) * 100)) : 0;
      var isDone = task.completed;
      var isClaimed = task.claimed;
      h += '<div class="bp-task-card' + (isDone ? ' completed' : '') + (isClaimed ? ' claimed' : '') + '">';
      h += '<div class="bp-task-top">';
      h += '<div class="bp-task-desc">' + (isClaimed ? '&#9989; ' : isDone ? '&#10003; ' : '') + task.description + '</div>';
      h += '<div class="bp-task-xp">+' + task.xp_reward + ' XP</div>';
      h += '</div>';
      h += '<div class="bp-task-progress-wrap">';
      h += '<div class="bp-task-bar"><div class="bp-task-bar-fill' + (isDone ? ' done' : '') + '" style="width:' + pct + '%"></div></div>';
      h += '<div class="bp-task-count">' + Math.min(task.progress, task.target) + '/' + task.target + '</div>';
      h += '</div>';
      if (isDone && !isClaimed) {
        h += '<button class="bp-claim-btn ready" data-claim-task="' + task.id + '">Claim Reward</button>';
      } else if (isClaimed) {
        h += '<button class="bp-claim-btn claimed-btn" disabled>Claimed</button>';
      }
      h += '</div>';
    });

    // Weekly Tasks
    h += '<div class="bp-section-title"><img src="https://images.habbo.com/c_images/catalogue/icon_68.png"> Weekly Tasks</div>';
    if (weeklyTasks.length === 0) {
      h += '<div style="color:#4b3a6b;font-size:12px;padding:8px;">No weekly tasks available</div>';
    }
    weeklyTasks.forEach(function(task) {
      var pct = task.target > 0 ? Math.min(100, Math.round((task.progress / task.target) * 100)) : 0;
      var isDone = task.completed;
      var isClaimed = task.claimed;
      h += '<div class="bp-task-card' + (isDone ? ' completed' : '') + (isClaimed ? ' claimed' : '') + '">';
      h += '<div class="bp-task-top">';
      h += '<div class="bp-task-desc">' + (isClaimed ? '&#9989; ' : isDone ? '&#10003; ' : '') + task.description + '</div>';
      h += '<div class="bp-task-xp">+' + task.xp_reward + ' XP</div>';
      h += '</div>';
      h += '<div class="bp-task-progress-wrap">';
      h += '<div class="bp-task-bar"><div class="bp-task-bar-fill' + (isDone ? ' done' : '') + '" style="width:' + pct + '%"></div></div>';
      h += '<div class="bp-task-count">' + Math.min(task.progress, task.target) + '/' + task.target + '</div>';
      h += '</div>';
      if (isDone && !isClaimed) {
        h += '<button class="bp-claim-btn ready" data-claim-task="' + task.id + '">Claim Reward</button>';
      } else if (isClaimed) {
        h += '<button class="bp-claim-btn claimed-btn" disabled>Claimed</button>';
      }
      h += '</div>';
    });

    return h;
  }

  function renderRewards() {
    var h = '';
    var p = state.progress || { total_xp: 0, current_tier: 0 };

    h += '<div class="bp-section-title"><img src="' + TROPHY_IMG + '"> Tier Rewards</div>';
    h += '<div class="bp-tier-grid">';

    state.tiers.forEach(function(tier) {
      var isUnlocked = (p.current_tier || 0) >= tier.tier;
      var isCurrent = (p.current_tier || 0) === tier.tier - 1;
      var tierClass = isUnlocked ? 'unlocked' : (isCurrent ? 'current-tier' : 'locked-tier');

      h += '<div class="bp-tier-card ' + tierClass + '">';
      h += '<div class="bp-tier-num">Tier ' + tier.tier + '</div>';
      h += '<img class="bp-tier-reward-img" src="' + getRewardImg(tier.reward_type) + '">';
      h += '<div class="bp-tier-reward-amount" style="color:' + getRewardColor(tier.reward_type) + '">' + tier.reward_amount + '</div>';
      h += '<div class="bp-tier-reward-type">' + getRewardLabel(tier.reward_type) + '</div>';
      h += '<div class="bp-tier-xp-req">' + tier.cumulative_xp + ' XP required</div>';

      if (isUnlocked) {
        // Check if already claimed
        if (tier.claimed) {
          h += '<button class="bp-claim-btn claimed-btn" disabled>Claimed</button>';
        } else {
          h += '<button class="bp-claim-btn ready" data-claim-tier="' + tier.tier + '">Claim</button>';
        }
      } else {
        h += '<button class="bp-claim-btn locked" disabled>Locked</button>';
      }

      h += '</div>';
    });

    h += '</div>';
    return h;
  }

  // ==================== EVENTS ====================
  function bindEvents() {
    // Close button
    var closeBtn = document.getElementById('bp-close-btn');
    if (closeBtn) closeBtn.onclick = function() {
      state.isOpen = false;
      state.isMinimized = false;
      widget.classList.remove('open', 'minimized');
    };

    // Minimize button
    var minBtn = document.getElementById('bp-minimize-btn');
    if (minBtn) minBtn.onclick = function() {
      state.isMinimized = !state.isMinimized;
      if (state.isMinimized) {
        widget.classList.add('minimized');
        minBtn.innerHTML = '&#9723;';
        minBtn.title = 'Restore';
      } else {
        widget.classList.remove('minimized');
        minBtn.innerHTML = '&minus;';
        minBtn.title = 'Minimize';
      }
    };

    // Tab switching
    var tabs = widget.querySelectorAll('.bp-tab');
    tabs.forEach(function(tab) {
      tab.onclick = function() {
        state.activeTab = tab.getAttribute('data-tab');
        render();
      };
    });

    // Dragging
    var header = document.getElementById('bp-header');
    if (header) {
      header.onmousedown = function(e) {
        if (e.target.tagName === 'BUTTON') return;
        state.isDragging = true;
        state.dragOffsetX = e.clientX - state.posX;
        state.dragOffsetY = e.clientY - state.posY;
        e.preventDefault();
      };
    }

    // Claim task buttons
    var claimTaskBtns = widget.querySelectorAll('[data-claim-task]');
    claimTaskBtns.forEach(function(btn) {
      btn.onclick = function() {
        var taskId = parseInt(btn.getAttribute('data-claim-task'));
        claimTask(taskId);
      };
    });

    // Claim tier buttons
    var claimTierBtns = widget.querySelectorAll('[data-claim-tier]');
    claimTierBtns.forEach(function(btn) {
      btn.onclick = function() {
        var tier = parseInt(btn.getAttribute('data-claim-tier'));
        claimTier(tier);
      };
    });
  }

  // Mouse move/up for dragging
  document.addEventListener('mousemove', function(e) {
    if (!state.isDragging) return;
    state.posX = Math.max(0, Math.min(window.innerWidth - 520, e.clientX - state.dragOffsetX));
    state.posY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - state.dragOffsetY));
    widget.style.left = state.posX + 'px';
    widget.style.top = state.posY + 'px';
  });
  document.addEventListener('mouseup', function() {
    state.isDragging = false;
  });

  // ==================== API CALLS ====================
  async function loadData() {
    state.loading = true;
    state.error = null;
    render();

    try {
      // 1. Record daily login
      try { await apiPost('/api/battlepass/login'); } catch(e) { /* ok if fails */ }

      // 2. Sync task progress from game data (reads Arcturus DB tables)
      try { await apiPost('/api/battlepass/sync'); } catch(e) { console.warn('[BP] Sync failed:', e); }

      // 3. Load all data in parallel
      var results = await Promise.all([
        apiFetch('/api/battlepass/season'),
        apiFetch('/api/battlepass/tiers'),
        apiFetch('/api/battlepass/progress'),
        apiFetch('/api/battlepass/tasks')
      ]);

      state.season = results[0].season || results[0];
      state.tiers = results[1].tiers || results[1] || [];
      state.progress = results[2].progress || results[2];
      // API returns {daily: [...], weekly: [...]} - flatten into single array
      var tasksData = results[3];
      if (tasksData && Array.isArray(tasksData.daily)) {
        state.tasks = (tasksData.daily || []).concat(tasksData.weekly || []);
      } else if (tasksData && Array.isArray(tasksData.tasks)) {
        state.tasks = tasksData.tasks;
      } else if (Array.isArray(tasksData)) {
        state.tasks = tasksData;
      } else {
        state.tasks = [];
      }

      // Mark tiers as claimed based on progress data
      if (state.progress && state.progress.claimed_tiers) {
        var claimed = state.progress.claimed_tiers;
        state.tiers.forEach(function(t) {
          t.claimed = claimed.indexOf(t.tier) >= 0;
        });
      }

      state.loading = false;
    } catch(err) {
      state.error = 'Failed to load Battle Pass data. Please try again.';
      state.loading = false;
      console.error('[BP Widget] Load error:', err);
    }
    render();
  }

  async function claimTask(taskId) {
    try {
      var result = await apiPost('/api/battlepass/tasks/' + taskId + '/claim');
      var xp = result.xp_earned || result.xp_awarded || 0;
      showToast('Task claimed! +' + xp + ' XP (Total: ' + (result.total_xp || 0) + ' XP, Tier ' + (result.current_tier || 0) + ')');
      await loadData();
    } catch(err) {
      showToast(err.message || 'Failed to claim task');
      console.error('[BP Widget] Claim task error:', err);
    }
  }

  async function claimTier(tier) {
    try {
      var result = await apiPost('/api/battlepass/tiers/' + tier + '/claim');
      var msg = 'Tier ' + tier + ' reward claimed!';
      if (result.reward_type && result.reward_amount) {
        msg += ' +' + result.reward_amount + ' ' + getRewardLabel(result.reward_type);
      }
      showToast(msg);
      await loadData();
    } catch(err) {
      showToast('Failed to claim tier reward');
      console.error('[BP Widget] Claim tier error:', err);
    }
  }

  function showToast(msg) {
    state.toast = msg;
    render();
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function() {
      state.toast = null;
      render();
    }, 3000);
  }

  // ==================== INIT ====================
  function init() {
    // Check both current doc and parent doc for existing button
    if (document.getElementById('bp-toggle-btn')) return;
    try { if (window.parent && window.parent.document.getElementById('bp-toggle-btn')) return; } catch(e) {}

    // The Nitro client runs inside an iframe. The info panel (with HabPlus Radio)
    // is in the PARENT document (React client page). We need to inject the toggle
    // button into the parent document's info panel to sit under HabPlus Radio.
    var parentDoc = null;
    try { parentDoc = window.parent.document; } catch(e) { parentDoc = document; }

    // Inject styles into parent document if needed
    if (parentDoc !== document && !parentDoc.getElementById('bp-toggle-style')) {
      var parentStyle = parentDoc.createElement('style');
      parentStyle.id = 'bp-toggle-style';
      parentStyle.textContent = `
        #bp-toggle-btn {
          z-index: 99999;
          background: transparent;
          color: #c084fc;
          padding: 6px 10px;
          cursor: pointer;
          font-family: Arial, sans-serif;
          border: none;
          transition: all 0.15s;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 6px;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin-top: 2px;
        }
        #bp-toggle-btn:hover { background: rgba(124,58,237,0.15); }
        #bp-toggle-btn img { width: 16px; height: 16px; image-rendering: pixelated; }
      `;
      parentDoc.head.appendChild(parentStyle);
    }

    // Create the toggle button in the parent document
    var parentToggleBtn = parentDoc.createElement('div');
    parentToggleBtn.id = 'bp-toggle-btn';
    parentToggleBtn.innerHTML = '<img src="' + TROPHY_IMG + '"> <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#c084fc">Battle Pass</span>';

    // Find the info panel in the parent document (contains "HabPlus Radio")
    var infoPanel = null;
    var allDivs = parentDoc.querySelectorAll('div');
    for (var i = 0; i < allDivs.length; i++) {
      var el = allDivs[i];
      if (el.textContent && el.textContent.indexOf('HabPlus Radio') >= 0 && el.textContent.indexOf('Off Air') >= 0) {
        var rect = el.getBoundingClientRect();
        if (rect.width > 50 && rect.width < 300) {
          infoPanel = el;
          break;
        }
      }
    }

    if (infoPanel) {
      infoPanel.appendChild(parentToggleBtn);
    } else {
      // Fallback: position fixed in top-left, under where info panel would be
      parentToggleBtn.style.position = 'fixed';
      parentToggleBtn.style.top = '110px';
      parentToggleBtn.style.left = '12px';
      parentToggleBtn.style.background = 'rgba(0,0,0,0.5)';
      parentToggleBtn.style.borderRadius = '8px';
      parentToggleBtn.style.padding = '6px 12px';
      parentToggleBtn.style.backdropFilter = 'blur(10px)';
      parentDoc.body.appendChild(parentToggleBtn);
    }

    // Widget popup stays in the iframe document (where it renders game overlay)
    document.body.appendChild(widget);

    centerWidget();

    parentToggleBtn.onclick = function() {
      if (state.isOpen) {
        state.isOpen = false;
        state.isMinimized = false;
        widget.classList.remove('open', 'minimized');
      } else {
        state.isOpen = true;
        state.isMinimized = false;
        widget.classList.add('open');
        widget.classList.remove('minimized');
        centerWidget();
        loadData();
      }
    };

    render();
  }

  // Wait for canvas (game loaded) then inject
  var ci = setInterval(function() {
    if (document.querySelector('canvas')) {
      clearInterval(ci);
      setTimeout(init, 1500);
    }
  }, 500);
  // Fallback
  setTimeout(init, 12000);
})();
