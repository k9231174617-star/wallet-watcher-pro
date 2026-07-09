/* ============================================================
   WALLET WATCHER PRO — MAIN APP JS
   Free APIs: CoinGecko (no key needed), public RPC endpoints
   ============================================================ */

// ── FREE API ENDPOINTS ──────────────────────────────────────
const API = {
  COINGECKO:    'https://api.coingecko.com/api/v3',
  SOLANA_RPC:   'https://api.mainnet-beta.solana.com',
  ETH_RPC:      'https://ethereum.publicnode.com',
  BSC_RPC:      'https://bsc-dataseed.binance.org',
  BASE_RPC:     'https://mainnet.base.org',
  TONCENTER:    'https://toncenter.com/api/v2',
};

// ── STATE ───────────────────────────────────────────────────
const STATE = {
  wallets: JSON.parse(localStorage.getItem('wwp_wallets') || '[]'),
  prices: {},
  portfolioHistory: {},
  currentPage: 'dashboard',
  notifications: JSON.parse(localStorage.getItem('wwp_notifications') || '[]'),
  settings: JSON.parse(localStorage.getItem('wwp_settings') || JSON.stringify({
    currency: 'USD', lang: 'RU', theme: 'dark',
    notifAll: true, notifMin: 0,
    showSol: true, showEth: true, showBsc: true, showBase: true, showTon: true,
    updateSpeed: 'standard', hideBalances: false,
  })),
  priceChart: null,
  portfolioChart: null,
  activeChartPeriod: '24h',
  portfolioTotal: 0,
  portfolioChange24h: 0,
};

// ── DEMO WALLETS (preloaded for beautiful UI) ───────────────
const DEMO_WALLETS = [
  {
    id: 'w1', network: 'sol', label: 'Main SOL Wallet',
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    shortAddr: '9WzD...AWWM', balance: 12.45, balanceUsd: 2234.10,
    change24h: 5.2, tokens: 8, online: true,
    tokens_list: [
      { sym: 'SOL',  name: 'Solana',    bal: 12.45, usd: 1246.50, change: 5.2,  pct: 55.8, icon: '◎' },
      { sym: 'USDC', name: 'USD Coin',  bal: 850.0, usd: 850.0,  change: 0.01, pct: 38.1, icon: '💲' },
      { sym: 'BONK', name: 'Bonk',      bal: 1200000, usd: 84.0, change: -3.1, pct: 3.8,  icon: '🐕' },
      { sym: 'JUP',  name: 'Jupiter',   bal: 55.2,  usd: 53.6,  change: 8.4,  pct: 2.4,  icon: '🪐' },
    ]
  },
  {
    id: 'w2', network: 'eth', label: 'ETH DeFi Vault',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    shortAddr: '0x742d...f44e', balance: 0.82, balanceUsd: 3108.20,
    change24h: -1.8, tokens: 5, online: true,
    tokens_list: [
      { sym: 'ETH',  name: 'Ethereum',  bal: 0.82,  usd: 2443.6, change: -1.8, pct: 78.6, icon: '⬡' },
      { sym: 'USDT', name: 'Tether',    bal: 420.0, usd: 420.0,  change: 0.0,  pct: 13.5, icon: '₮' },
      { sym: 'LINK', name: 'Chainlink', bal: 14.5,  usd: 152.3,  change: 3.2,  pct: 4.9,  icon: '🔗' },
      { sym: 'UNI',  name: 'Uniswap',  bal: 12.0,  usd: 92.3,   change: -2.1, pct: 3.0,  icon: '🦄' },
    ]
  },
  {
    id: 'w3', network: 'bsc', label: 'BSC Trading',
    address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
    shortAddr: '0x8Ba1...BA72', balance: 5.67, balanceUsd: 1823.40,
    change24h: 2.9, tokens: 6, online: true,
    tokens_list: [
      { sym: 'BNB',  name: 'BNB',       bal: 5.67,  usd: 1620.4, change: 2.9,  pct: 88.9, icon: '🔶' },
      { sym: 'CAKE', name: 'PancakeSwap',bal: 45.0,  usd: 141.8,  change: 1.2,  pct: 7.8,  icon: '🥞' },
      { sym: 'BUSD', name: 'BUSD',       bal: 61.2,  usd: 61.2,   change: 0.0,  pct: 3.4,  icon: '💰' },
    ]
  },
  {
    id: 'w4', network: 'base', label: 'Base L2',
    address: '0x1C0Aa8cCD568d90d61659F060D1bFb1e6f855A20',
    shortAddr: '0x1C0A...5A20', balance: 0.41, balanceUsd: 987.50,
    change24h: -0.5, tokens: 3, online: false,
    tokens_list: [
      { sym: 'ETH',  name: 'Ethereum',  bal: 0.41,  usd: 892.5,  change: -1.8, pct: 90.4, icon: '⬡' },
      { sym: 'USDbC',name: 'USD Base',  bal: 95.0,  usd: 95.0,   change: 0.0,  pct: 9.6,  icon: '💲' },
    ]
  },
  {
    id: 'w5', network: 'ton', label: 'TON Wallet',
    address: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG3',
    shortAddr: 'EQD2...OG3', balance: 88.3, balanceUsd: 521.80,
    change24h: 7.1, tokens: 2, online: true,
    tokens_list: [
      { sym: 'TON',  name: 'Toncoin',   bal: 88.3,  usd: 521.8,  change: 7.1,  pct: 100, icon: '💎' },
    ]
  },
];

// Demo transactions
const DEMO_TXS = [
  { id:'t1', type:'in',   wallet:'w1', net:'sol',  label:'Входящий перевод', from:'DYw8j...HMNX', amount:'+124.5 SOL',  usd:'$12,470', time:'2 мин назад',  status:'confirmed', hash:'5KNqAP...' },
  { id:'t2', type:'out',  wallet:'w2', net:'eth',  label:'Перевод ETH',      from:'0xab3f...41cd', amount:'-0.15 ETH',  usd:'$447',    time:'18 мин назад', status:'confirmed', hash:'0x4f8b...' },
  { id:'t3', type:'swap', wallet:'w1', net:'sol',  label:'Jupiter Swap',     from:'Router',       amount:'850 USDC',   usd:'$850',    time:'45 мин назад', status:'confirmed', hash:'3mJqR8...' },
  { id:'t4', type:'in',   wallet:'w3', net:'bsc',  label:'Входящий BNB',     from:'0x7f2e...9a3b', amount:'+2.1 BNB',   usd:'$601',    time:'1ч назад',     status:'confirmed', hash:'0xd91c...' },
  { id:'t5', type:'out',  wallet:'w4', net:'base', label:'Перевод ETH',      from:'0x3c1a...88de', amount:'-0.05 ETH',  usd:'$149',    time:'2ч назад',     status:'pending',   hash:'0x8f3a...' },
  { id:'t6', type:'in',   wallet:'w5', net:'ton',  label:'Входящий TON',     from:'EQBvW...7Xk', amount:'+50 TON',    usd:'$296',    time:'3ч назад',     status:'confirmed', hash:'AAMkA...' },
  { id:'t7', type:'out',  wallet:'w1', net:'sol',  label:'NFT Purchase',     from:'Magic Eden',  amount:'-2.5 SOL',   usd:'$250',    time:'5ч назад',     status:'confirmed', hash:'2xKnR1...' },
  { id:'t8', type:'swap', wallet:'w2', net:'eth',  label:'Uniswap V3',       from:'Router',      amount:'0.2 ETH→420 USDT', usd:'$420', time:'7ч назад', status:'confirmed', hash:'0x12ab...' },
];

// Demo notifications
const DEMO_NOTIFS = [
  { id:'n1', type:'in',   title:'💰 Входящая транзакция', desc:'Получено +124.5 SOL ($12,470) на Main SOL Wallet', time:'2 мин назад', read:false, net:'sol' },
  { id:'n2', type:'alert',title:'⚡ Крупная транзакция',  desc:'Обнаружена транзакция >$10,000 на отслеживаемом кошельке', time:'2 мин назад', read:false, net:'sol' },
  { id:'n3', type:'out',  title:'📤 Исходящий перевод',  desc:'Отправлено -0.15 ETH ($447) с ETH DeFi Vault', time:'18 мин назад', read:true, net:'eth' },
  { id:'n4', type:'swap', title:'🔄 Своп исполнен',       desc:'850 USDC получено через Jupiter на Main SOL Wallet', time:'45 мин назад', read:true, net:'sol' },
  { id:'n5', type:'in',   title:'💰 Входящая транзакция', desc:'Получено +2.1 BNB ($601) на BSC Trading', time:'1ч назад', read:true, net:'bsc' },
];

// ── COIN DATA ───────────────────────────────────────────────
let LIVE_PRICES = {
  SOL:  { price: 100.20, change: 5.2,  icon: '◎', color: '#9945ff', id:'solana' },
  ETH:  { price: 2980.40, change: -1.8, icon: '⬡', color: '#627eea', id:'ethereum' },
  BNB:  { price: 285.70, change: 2.9,  icon: '🔶', color: '#f3ba2f', id:'binancecoin' },
  TON:  { price: 5.91,  change: 7.1,  icon: '💎', color: '#0098ea', id:'the-open-network' },
  BTC:  { price: 67450, change: 1.2,  icon: '₿', color: '#f7931a', id:'bitcoin' },
  USDC: { price: 1.00,  change: 0.01, icon: '💲', color: '#2775ca', id:'usd-coin' },
  BONK: { price: 0.000021, change: -3.1, icon: '🐕', color: '#ff6b35', id:'bonk' },
  JUP:  { price: 0.97,  change: 8.4,  icon: '🪐', color: '#c77dff', id:'jupiter-exchange-solana' },
  LINK: { price: 10.50, change: 3.2,  icon: '🔗', color: '#2a5ada', id:'chainlink' },
};

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initWallets();
  renderSidebar();
  renderDashboard();
  renderPricesPanel();
  renderTransactions();
  renderNotifications();
  renderSettings();
  setupNavigation();
  setupModal();
  fetchLivePrices();
  setInterval(fetchLivePrices, 30000);
  startTickerAnimation();
  initPortfolioChart();
  setTimeout(() => showToast('success', 'WebSocket подключён', '5 кошельков мониторятся в реальном времени'), 1500);
});

function initWallets() {
  if (STATE.wallets.length === 0) {
    STATE.wallets = DEMO_WALLETS;
  }
}

// ── COINGECKO FREE API ───────────────────────────────────────
async function fetchLivePrices() {
  try {
    const ids = Object.values(LIVE_PRICES).map(c => c.id).join(',');
    const url = `${API.COINGECKO}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Rate limit');
    const data = await res.json();

    Object.entries(LIVE_PRICES).forEach(([sym, coin]) => {
      const d = data[coin.id];
      if (d) {
        LIVE_PRICES[sym].price  = d.usd;
        LIVE_PRICES[sym].change = d.usd_24h_change || 0;
      }
    });

    updateTickerPrices();
    updateStatCards();
    updatePriceItems();
    updateWalletBalances();
    console.log('[WWP] Live prices updated from CoinGecko ✓');
  } catch (e) {
    console.warn('[WWP] Price fetch failed (rate limit?), using cached values', e.message);
  }
}

// ── NAVIGATION ──────────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const page = el.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page) {
  STATE.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  // Update header
  const titles = {
    dashboard: ['DASHBOARD', 'Общий обзор портфеля'],
    wallets:   ['МОИ КОШЕЛЬКИ', 'Управление кошельками'],
    transactions: ['ТРАНЗАКЦИИ', 'История операций'],
    notifications: ['УВЕДОМЛЕНИЯ', 'Центр уведомлений'],
    market:    ['РЫНОК', 'Цены и аналитика'],
    settings:  ['НАСТРОЙКИ', 'Конфигурация приложения'],
  };
  const [title, sub] = titles[page] || ['', ''];
  const ht = document.getElementById('header-title');
  const hs = document.getElementById('header-sub');
  if (ht) ht.textContent = title;
  if (hs) hs.textContent = sub;
}

// ── SIDEBAR RENDER ──────────────────────────────────────────
function renderSidebar() {
  const walletList = document.getElementById('sidebar-wallet-list');
  if (!walletList) return;
  walletList.innerHTML = STATE.wallets.map(w => `
    <div class="wallet-mini" onclick="navigateTo('wallets')">
      <div class="wallet-mini-dot ${w.online ? 'online' : 'offline'}"></div>
      <div class="wallet-mini-info">
        <div class="wallet-mini-addr">${w.shortAddr}</div>
        <div class="wallet-mini-net">${w.network.toUpperCase()}</div>
      </div>
      <div class="wallet-mini-bal">$${formatNum(w.balanceUsd)}</div>
    </div>
  `).join('');
}

// ── DASHBOARD ───────────────────────────────────────────────
function renderDashboard() {
  const total = STATE.wallets.reduce((s, w) => s + w.balanceUsd, 0);
  STATE.portfolioTotal = total;
  const avgChange = STATE.wallets.reduce((s, w) => s + w.change24h, 0) / STATE.wallets.length;
  STATE.portfolioChange24h = avgChange;

  const el = id => document.getElementById(id);

  if (el('stat-total'))  el('stat-total').textContent  = '$' + formatNum(total, 2);
  if (el('stat-change')) el('stat-change').textContent = (avgChange >= 0 ? '+' : '') + avgChange.toFixed(2) + '%';
  if (el('stat-wallets'))el('stat-wallets').textContent = STATE.wallets.length;
  if (el('stat-online')) el('stat-online').textContent  = STATE.wallets.filter(w => w.online).length + '/' + STATE.wallets.length;
  if (el('stat-txcount'))el('stat-txcount').textContent = DEMO_TXS.length;
  if (el('stat-alerts')) el('stat-alerts').textContent  = DEMO_NOTIFS.filter(n => !n.read).length;

  renderWalletCards();
  renderRecentTxs();
  renderTokenBreakdown();
}

function renderWalletCards() {
  const container = document.getElementById('wallet-list');
  if (!container) return;
  container.innerHTML = STATE.wallets.map(w => `
    <a class="wallet-item" href="#" onclick="showWalletDetail('${w.id}'); return false;">
      <div class="wallet-avatar ${w.network}">
        ${NET_ICONS[w.network]}
        <div class="wallet-online ${w.online ? '' : 'offline'}"></div>
      </div>
      <div class="wallet-info">
        <div class="wallet-label">${w.label}</div>
        <div class="wallet-addr">${w.shortAddr}</div>
        <span class="wallet-network ${w.network}">${w.network.toUpperCase()}</span>
      </div>
      <div class="wallet-balance-col">
        <div class="wallet-usd">$${formatNum(w.balanceUsd, 2)}</div>
        <div class="wallet-change ${w.change24h >= 0 ? 'up' : 'down'}">
          ${w.change24h >= 0 ? '▲' : '▼'} ${Math.abs(w.change24h).toFixed(2)}%
        </div>
      </div>
    </a>
  `).join('');
}

function renderRecentTxs() {
  const container = document.getElementById('recent-txs');
  if (!container) return;
  container.innerHTML = DEMO_TXS.slice(0, 5).map(tx => buildTxItem(tx)).join('');
}

function buildTxItem(tx) {
  const icons = { in: '↓', out: '↑', swap: '⇄' };
  const labels = { in: 'in', out: 'out', swap: 'swap' };
  return `
    <div class="tx-item">
      <div class="tx-direction ${labels[tx.type]}">${icons[tx.type]}</div>
      <div class="tx-info">
        <div class="tx-type">${tx.label}</div>
        <div class="tx-addr">${tx.from}</div>
        <div class="tx-time">${tx.time} · <span class="net-tag" style="color:var(--text-muted)">${tx.net.toUpperCase()}</span></div>
      </div>
      <div class="tx-amounts">
        <div class="tx-token ${labels[tx.type]}">${tx.amount}</div>
        <div class="tx-usd">${tx.usd}</div>
      </div>
      <span class="tx-status ${tx.status}">${tx.status === 'confirmed' ? '✓' : tx.status === 'pending' ? '⏳' : '✗'}</span>
    </div>
  `;
}

function renderTokenBreakdown() {
  const container = document.getElementById('token-breakdown');
  if (!container) return;
  const allTokens = STATE.wallets.flatMap(w => (w.tokens_list || []).map(t => ({...t, wallet: w.label})));
  const sorted = allTokens.sort((a, b) => b.usd - a.usd).slice(0, 8);
  const total = sorted.reduce((s, t) => s + t.usd, 0);
  const colors = ['#00f5ff','#2979ff','#c77dff','#ff2d78','#39ff14','#ffd700','#9945ff','#f3ba2f'];
  container.innerHTML = sorted.map((t, i) => `
    <div class="token-row">
      <div class="token-icon">${t.icon}</div>
      <div class="token-meta">
        <div class="token-sym">${t.sym}</div>
        <div class="token-name-small">${t.name}</div>
      </div>
      <div style="flex:1">
        <div class="token-bal text-mono">$${formatNum(t.usd, 2)}</div>
        <div class="token-pct-bar" style="margin-top:4px">
          <div class="token-pct-fill" style="width:${(t.usd/total*100).toFixed(1)}%; background:${colors[i]}"></div>
        </div>
      </div>
      <div style="text-align:right;margin-left:12px">
        <div class="token-usd" style="color:${colors[i]};font-family:var(--font-mono);font-size:13px;font-weight:700">${(t.usd/total*100).toFixed(1)}%</div>
        <div class="token-change-sm ${t.change >= 0 ? 'text-green' : 'text-pink'}">${t.change >= 0 ? '+' : ''}${t.change.toFixed(1)}%</div>
      </div>
    </div>
  `).join('');

  // Draw donut chart
  drawDonutChart('portfolio-donut', sorted.map(t => t.usd/total*100), colors, sorted.map(t => t.sym));
}

// ── PRICES PANEL ────────────────────────────────────────────
function renderPricesPanel() {
  const container = document.getElementById('prices-panel');
  if (!container) return;
  const coins = Object.entries(LIVE_PRICES).slice(0, 7);
  container.innerHTML = coins.map(([sym, coin]) => `
    <div class="price-item" id="price-row-${sym}">
      <div class="coin-icon" style="color:${coin.color}">${coin.icon}</div>
      <div class="coin-name">
        <div class="coin-name-main">${sym}</div>
        <div class="coin-name-sub">${coin.id.replace(/-/g,' ')}</div>
      </div>
      <div class="sparkline-wrap">
        <canvas class="sparkline" id="spark-${sym}"></canvas>
      </div>
      <div class="coin-price">
        <div class="coin-price-main" id="cprice-${sym}">${formatPrice(coin.price)}</div>
        <div class="coin-price-change ${coin.change >= 0 ? 'up' : 'down'}" id="cchange-${sym}">
          ${coin.change >= 0 ? '▲' : '▼'} ${Math.abs(coin.change).toFixed(2)}%
        </div>
      </div>
    </div>
  `).join('');

  // Draw sparklines
  setTimeout(() => {
    Object.entries(LIVE_PRICES).slice(0, 7).forEach(([sym, coin]) => {
      drawSparkline(`spark-${sym}`, generateSparkData(coin.change >= 0), coin.color);
    });
  }, 100);
}

function updatePriceItems() {
  Object.entries(LIVE_PRICES).forEach(([sym, coin]) => {
    const priceEl  = document.getElementById(`cprice-${sym}`);
    const changeEl = document.getElementById(`cchange-${sym}`);
    if (priceEl)  priceEl.textContent = formatPrice(coin.price);
    if (changeEl) {
      changeEl.textContent = `${coin.change >= 0 ? '▲' : '▼'} ${Math.abs(coin.change).toFixed(2)}%`;
      changeEl.className = `coin-price-change ${coin.change >= 0 ? 'up' : 'down'}`;
    }
  });
}

// ── TRANSACTIONS PAGE ────────────────────────────────────────
function renderTransactions() {
  const container = document.getElementById('all-txs');
  if (!container) return;
  container.innerHTML = DEMO_TXS.map(tx => buildTxItem(tx)).join('');
}

// ── NOTIFICATIONS PAGE ───────────────────────────────────────
function renderNotifications() {
  const container = document.getElementById('notif-list');
  if (!container) return;
  container.innerHTML = DEMO_NOTIFS.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}">
      <div class="notif-icon">${n.type === 'in' ? '💰' : n.type === 'out' ? '📤' : n.type === 'swap' ? '🔄' : '⚡'}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
        <div class="notif-time">${n.time} · <span class="net-tag" style="font-size:10px;color:var(--text-muted)">${n.net.toUpperCase()}</span></div>
      </div>
      ${!n.read ? '<div style="width:6px;height:6px;border-radius:50%;background:var(--neon-cyan);flex-shrink:0;margin-top:4px;box-shadow:var(--glow-cyan)"></div>' : ''}
    </div>
  `).join('');
}

// ── SETTINGS PAGE ────────────────────────────────────────────
function renderSettings() {
  const s = STATE.settings;
  const el = id => document.getElementById(id);
  if (el('set-currency')) el('set-currency').value = s.currency;
  if (el('set-speed'))    el('set-speed').value    = s.updateSpeed;
}

// ── PORTFOLIO CHART ──────────────────────────────────────────
function initPortfolioChart() {
  const canvas = document.getElementById('portfolio-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const labels = generateTimeLabels('24h');
  const data   = generatePortfolioHistory(STATE.portfolioTotal, '24h');

  if (STATE.priceChart) STATE.priceChart.destroy();
  STATE.priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#00f5ff',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#00f5ff',
        fill: true,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
          g.addColorStop(0, 'rgba(0,245,255,0.18)');
          g.addColorStop(1, 'rgba(0,245,255,0)');
          return g;
        },
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0c0f1a',
          borderColor: 'rgba(0,245,255,0.3)',
          borderWidth: 1,
          titleColor: '#7986cb',
          bodyColor: '#e8eaf6',
          padding: 10,
          callbacks: {
            label: ctx => ' $' + formatNum(ctx.raw, 2),
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(121,134,203,0.06)' },
          ticks: { color: '#3d4a6b', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 8 },
          border: { color: 'rgba(121,134,203,0.1)' },
        },
        y: {
          grid: { color: 'rgba(121,134,203,0.06)' },
          ticks: {
            color: '#3d4a6b',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: v => '$' + formatNum(v)
          },
          border: { color: 'rgba(121,134,203,0.1)' },
        }
      }
    }
  });
}

function switchChartPeriod(period) {
  STATE.activeChartPeriod = period;
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.toggle('active', t.dataset.period === period));
  const labels = generateTimeLabels(period);
  const data   = generatePortfolioHistory(STATE.portfolioTotal, period);
  if (STATE.priceChart) {
    STATE.priceChart.data.labels   = labels;
    STATE.priceChart.data.datasets[0].data = data;
    STATE.priceChart.update('none');
  }
}

// ── WALLET DETAIL ────────────────────────────────────────────
function showWalletDetail(walletId) {
  const w = STATE.wallets.find(x => x.id === walletId);
  if (!w) return;

  const overlay = document.getElementById('wallet-detail-overlay');
  if (!overlay) return;

  overlay.querySelector('#wd-label').textContent   = w.label;
  overlay.querySelector('#wd-addr').textContent    = w.address;
  overlay.querySelector('#wd-usd').textContent     = '$' + formatNum(w.balanceUsd, 2);
  overlay.querySelector('#wd-change').textContent  = (w.change24h >= 0 ? '+' : '') + w.change24h.toFixed(2) + '%';
  overlay.querySelector('#wd-change').className    = `stat-change ${w.change24h >= 0 ? 'up' : 'down'}`;
  overlay.querySelector('#wd-net').textContent     = w.network.toUpperCase();
  overlay.querySelector('#wd-net').className       = `wallet-network ${w.network}`;

  const tokenList = overlay.querySelector('#wd-tokens');
  const colors = ['#00f5ff','#2979ff','#c77dff','#ff2d78','#39ff14','#ffd700','#9945ff','#f3ba2f'];
  tokenList.innerHTML = (w.tokens_list || []).map((t, i) => `
    <div class="token-row">
      <div class="token-icon">${t.icon}</div>
      <div class="token-meta">
        <div class="token-sym">${t.sym}</div>
        <div class="token-name-small">${t.name}</div>
      </div>
      <div style="flex:1;padding:0 12px">
        <div class="token-bal text-mono" style="font-size:12px;color:var(--text-muted)">${formatNum(t.bal, t.bal > 1000 ? 0 : 4)} ${t.sym}</div>
        <div class="token-pct-bar" style="margin-top:4px">
          <div class="token-pct-fill" style="width:${t.pct}%;background:${colors[i]}"></div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:${colors[i]}">$${formatNum(t.usd, 2)}</div>
        <div class="${t.change >= 0 ? 'text-green' : 'text-pink'}" style="font-size:11px">${t.change >= 0 ? '+' : ''}${t.change.toFixed(2)}%</div>
      </div>
    </div>
  `).join('');

  const txList = overlay.querySelector('#wd-txs');
  const walletTxs = DEMO_TXS.filter(tx => tx.wallet === walletId);
  txList.innerHTML = walletTxs.length ? walletTxs.map(buildTxItem).join('') : `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Нет транзакций</div></div>`;

  overlay.style.opacity = '1'; overlay.style.pointerEvents = 'all';
  overlay.querySelector('.modal').style.transform = 'scale(1) translateY(0)';
}

function closeWalletDetail() {
  const overlay = document.getElementById('wallet-detail-overlay');
  if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
}

// ── ADD WALLET MODAL ─────────────────────────────────────────
function setupModal() {
  const overlay = document.getElementById('add-wallet-modal');
  if (!overlay) return;

  // Network selector
  overlay.querySelectorAll('.net-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.net-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const hints = {
        sol: 'Base58 адрес (32-44 символа): напр. 9WzDXwBb...',
        eth: '0x + 40 символов: напр. 0x742d35Cc...',
        bsc: '0x + 40 символов: напр. 0x8Ba1f109...',
        base:'0x + 40 символов: напр. 0x1C0Aa8cc...',
        ton: 'Base64 адрес: напр. EQD2NmD_...',
      };
      const hint = document.getElementById('addr-hint');
      if (hint) hint.textContent = hints[btn.dataset.net] || '';
    });
  });
}

function openAddWallet() {
  const overlay = document.getElementById('add-wallet-modal');
  if (overlay) overlay.classList.add('open');
}

function closeAddWallet() {
  const overlay = document.getElementById('add-wallet-modal');
  if (overlay) overlay.classList.remove('open');
}

async function saveWallet() {
  const net  = document.querySelector('.net-btn.selected')?.dataset.net || 'sol';
  const addr = document.getElementById('wallet-addr-input')?.value?.trim();
  const label= document.getElementById('wallet-label-input')?.value?.trim() || 'Новый кошелёк';

  if (!addr) { showToast('error', 'Ошибка', 'Введите адрес кошелька'); return; }

  const valid = validateAddress(addr, net);
  if (!valid) { showToast('error', 'Неверный адрес', `Формат адреса ${net.toUpperCase()} не распознан`); return; }

  const newWallet = {
    id: 'w' + Date.now(), network: net, label,
    address: addr, shortAddr: addr.slice(0,6) + '...' + addr.slice(-4),
    balance: 0, balanceUsd: 0, change24h: 0, tokens: 0, online: true,
    tokens_list: [],
  };

  STATE.wallets.push(newWallet);
  localStorage.setItem('wwp_wallets', JSON.stringify(STATE.wallets));
  closeAddWallet();
  renderSidebar();
  renderWalletCards();
  showToast('success', 'Кошелёк добавлен', `${label} успешно добавлен и подключён к мониторингу`);

  // Try fetch real balance
  fetchWalletBalance(newWallet);
}

async function fetchWalletBalance(wallet) {
  try {
    if (wallet.network === 'sol') {
      const res = await fetch(API.SOLANA_RPC, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [wallet.address] })
      });
      const data = await res.json();
      if (data.result?.value != null) {
        const solBal = data.result.value / 1e9;
        wallet.balance = solBal;
        wallet.balanceUsd = solBal * (LIVE_PRICES.SOL?.price || 100);
        renderWalletCards();
        showToast('info', 'Баланс загружен', `${wallet.label}: ${solBal.toFixed(4)} SOL`);
      }
    }
  } catch(e) { console.warn('Balance fetch failed:', e); }
}

function validateAddress(addr, net) {
  if (net === 'sol') return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
  if (['eth','bsc','base'].includes(net)) return /^0x[0-9a-fA-F]{40}$/.test(addr);
  if (net === 'ton') return addr.length >= 48 && addr.length <= 67;
  return false;
}

// ── DONUT CHART ──────────────────────────────────────────────
function drawDonutChart(canvasId, values, colors, labels) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (canvas._chart) canvas._chart.destroy();
  canvas._chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#0c0f1a', hoverOffset: 6 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0c0f1a',
          borderColor: 'rgba(0,245,255,0.3)',
          borderWidth: 1,
          bodyColor: '#e8eaf6',
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toFixed(1)}%` }
        }
      }
    }
  });
}

// ── SPARKLINE ────────────────────────────────────────────────
function drawSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || 70;
  const h = canvas.offsetHeight || 28;
  canvas.width = w; canvas.height = h;

  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length-1)) * w, y: h - ((v-min)/range)*(h-4)-2 }));

  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fill
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '44'); grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad; ctx.fill();
}

// ── TICKER ──────────────────────────────────────────────────
function startTickerAnimation() {
  const wrap = document.getElementById('ticker-wrap');
  if (!wrap) return;
  updateTickerPrices();
}

function updateTickerPrices() {
  const wrap = document.getElementById('ticker-wrap');
  if (!wrap) return;
  const coins = Object.entries(LIVE_PRICES);
  const html = [...coins, ...coins].map(([sym, coin]) => `
    <div class="ticker-item">
      <span class="ticker-sym">${sym}</span>
      <span class="ticker-price">${formatPrice(coin.price)}</span>
      <span class="ticker-change ${coin.change >= 0 ? 'up' : 'down'}">${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%</span>
    </div>
  `).join('');
  wrap.innerHTML = html;
}

// ── STAT CARDS UPDATE ─────────────────────────────────────────
function updateStatCards() {
  const solPrice = LIVE_PRICES.SOL?.price;
  const ethPrice = LIVE_PRICES.ETH?.price;
  if (solPrice) {
    const el = document.getElementById('live-sol');
    if (el) el.textContent = '$' + formatNum(solPrice, 2);
  }
  if (ethPrice) {
    const el = document.getElementById('live-eth');
    if (el) el.textContent = '$' + formatNum(ethPrice, 2);
  }
}

function updateWalletBalances() {
  // Recalc USD using live prices
  STATE.wallets.forEach(w => {
    if (w.tokens_list?.length) {
      w.tokens_list.forEach(t => {
        const lp = LIVE_PRICES[t.sym];
        if (lp) { t.usd = t.bal * lp.price; t.change = lp.change; }
      });
      w.balanceUsd = w.tokens_list.reduce((s, t) => s + t.usd, 0);
      w.change24h = w.tokens_list.reduce((s, t) => s + t.change * (t.usd / w.balanceUsd), 0);
    }
  });
  const total = STATE.wallets.reduce((s, w) => s + w.balanceUsd, 0);
  const totalEl = document.getElementById('stat-total');
  if (totalEl) totalEl.textContent = '$' + formatNum(total, 2);
}

// ── TOAST ───────────────────────────────────────────────────
function showToast(type, title, msg) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <div style="cursor:pointer;color:var(--text-muted);margin-left:8px;font-size:16px" onclick="this.parentElement.remove()">×</div>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── FILTER TABS ──────────────────────────────────────────────
function filterTxs(type) {
  document.querySelectorAll('#page-transactions .filter-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === type));
  const container = document.getElementById('all-txs');
  if (!container) return;
  const filtered = type === 'all' ? DEMO_TXS : DEMO_TXS.filter(tx => tx.type === type);
  container.innerHTML = filtered.length ? filtered.map(buildTxItem).join('') : `
    <div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Транзакций не найдено</div></div>`;
}

function filterNotifs(type) {
  document.querySelectorAll('#page-notifications .filter-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === type));
  const container = document.getElementById('notif-list');
  if (!container) return;
  let filtered = type === 'all' ? DEMO_NOTIFS : type === 'unread' ? DEMO_NOTIFS.filter(n => !n.read) : DEMO_NOTIFS.filter(n => n.net === type);
  container.innerHTML = filtered.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}">
      <div class="notif-icon">${n.type === 'in' ? '💰' : n.type === 'out' ? '📤' : n.type === 'swap' ? '🔄' : '⚡'}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
        <div class="notif-time">${n.time}</div>
      </div>
      ${!n.read ? '<div style="width:6px;height:6px;border-radius:50%;background:var(--neon-cyan);flex-shrink:0;margin-top:4px;box-shadow:var(--glow-cyan)"></div>' : ''}
    </div>
  `).join('') || `<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">Уведомлений нет</div></div>`;
}

// ── SAVE SETTINGS ────────────────────────────────────────────
function saveSettings() {
  const s = STATE.settings;
  s.currency    = document.getElementById('set-currency')?.value || 'USD';
  s.updateSpeed = document.getElementById('set-speed')?.value    || 'standard';
  localStorage.setItem('wwp_settings', JSON.stringify(s));
  showToast('success', 'Настройки сохранены', 'Все изменения применены');
}

// ── HELPERS ──────────────────────────────────────────────────
const NET_ICONS = { sol: '◎', eth: '⬡', bsc: '🔶', base: '🔷', ton: '💎' };

function formatNum(n, decimals = 0) {
  if (n >= 1e6)  return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3)  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return n.toFixed(decimals);
}

function formatPrice(p) {
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1)    return '$' + p.toFixed(2);
  if (p >= 0.01) return '$' + p.toFixed(4);
  return '$' + p.toFixed(8);
}

function generateSparkData(trending, points = 20) {
  const data = [50];
  for (let i = 1; i < points; i++) {
    const trend = trending ? 0.3 : -0.3;
    data.push(Math.max(5, Math.min(95, data[i-1] + (Math.random()-0.5+trend)*8)));
  }
  return data;
}

function generateTimeLabels(period) {
  const now = new Date();
  const configs = { '24h': [24, 'h'], '7d': [7, 'd'], '30d': [30, 'd'], '1y': [12, 'm'], 'all': [24, 'm'] };
  const [count, unit] = configs[period] || [24, 'h'];
  return Array.from({length: count}, (_, i) => {
    const d = new Date(now);
    if (unit === 'h') d.setHours(d.getHours() - (count - i));
    if (unit === 'd') d.setDate(d.getDate() - (count - i));
    if (unit === 'm') d.setMonth(d.getMonth() - (count - i));
    if (unit === 'h') return d.getHours().toString().padStart(2,'0') + ':00';
    if (unit === 'd') return d.toLocaleDateString('ru', { day:'numeric', month:'short' });
    return d.toLocaleDateString('ru', { month:'short', year:'2-digit' });
  });
}

function generatePortfolioHistory(currentTotal, period) {
  const configs = { '24h': 24, '7d': 7, '30d': 30, '1y': 12, 'all': 24 };
  const count = configs[period] || 24;
  const volatility = { '24h': 0.02, '7d': 0.05, '30d': 0.08, '1y': 0.15, 'all': 0.25 }[period] || 0.02;
  const data = [currentTotal * (0.85 + Math.random() * 0.15)];
  for (let i = 1; i < count; i++) {
    const prev = data[i-1];
    data.push(Math.max(prev * 0.5, prev * (1 + (Math.random()-0.45) * volatility)));
  }
  data[data.length-1] = currentTotal;
  return data;
}

function copyAddress(addr) {
  navigator.clipboard.writeText(addr).then(() => showToast('success', 'Скопировано', addr.slice(0,20) + '...'));
}

function exportData(format) {
  const data = { wallets: STATE.wallets, transactions: DEMO_TXS, exported: new Date().toISOString() };
  const content = format === 'json' ? JSON.stringify(data, null, 2) :
    'Wallet,Network,Balance USD,Change 24h\n' + STATE.wallets.map(w => `${w.label},${w.network},${w.balanceUsd},${w.change24h}%`).join('\n');
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `wallet-watcher-export.${format}`; a.click();
  showToast('success', 'Экспорт', `Данные сохранены в wallet-watcher-export.${format}`);
}

// Live websocket simulation
setInterval(() => {
  const netLabels = ['SOL','ETH','BNB','BASE','TON'];
  const amounts = ['$'+Math.floor(Math.random()*9000+100)];
  const net = netLabels[Math.floor(Math.random()*netLabels.length)];
  if (Math.random() > 0.85) {
    showToast('info', `⚡ Новая транзакция · ${net}`, `Входящая ${amounts[0]} на отслеживаемый кошелёк`);
  }
}, 15000);

// ═══════════════════════════════════════════════════════════════
// CAPACITOR INTEGRATION
// ═══════════════════════════════════════════════════════════════

// Initialize Capacitor plugins when ready
document.addEventListener('DOMContentLoaded', async () => {
  if (window.CapacitorBridge?.isCapacitor) {
    await initializeCapacitor();
  }
});

async function initializeCapacitor() {
  const bridge = window.CapacitorBridge;
  
  console.log('[Capacitor] Initializing plugins...');
  
  // Check biometric availability
  const bio = await bridge.checkBiometricAvailability();
  console.log('[Capacitor] Biometric available:', bio.available);
  STATE.biometricAvailable = bio.available;
  
  // Setup push notifications
  await bridge.setupPushNotifications();
  
  // Setup background runner for price updates
  await bridge.setupBackgroundRunner();
  
  // Load preferences from secure storage
  const savedSettings = await bridge.getPreference('wwp_settings');
  if (savedSettings) {
    STATE.settings = { ...STATE.settings, ...savedSettings };
  }
  
  const savedWallets = await bridge.getPreference('wwp_wallets');
  if (savedWallets) {
    STATE.wallets = savedWallets;
    renderSidebar();
    renderWalletCards();
  }
  
  // Listen for network changes
  window.addEventListener('networkStatusChange', (e) => {
    console.log('[Capacitor] Network status:', e.detail);
    STATE.isOnline = e.detail.connected;
    if (e.detail.connected && typeof fetchLivePrices === 'function') {
      fetchLivePrices();
    }
  });
  
  // Listen for app state changes
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && typeof fetchLivePrices === 'function') {
      fetchLivePrices();
    }
  });
  
  // Deep link handler
  window.handleWalletDeepLink = async (address, network, label) => {
    console.log('[DeepLink] Adding wallet:', address, network);
    showToast('info', 'Deep Link', `Добавление кошелька ${address.slice(0,10)}...`);
    // TODO: Add wallet logic
  };
  
  // Override saveSettings to use Preferences
  window.saveSettings = async function() {
    const s = STATE.settings;
    s.currency = document.getElementById('set-currency')?.value || 'USD';
    s.updateSpeed = document.getElementById('set-speed')?.value || 'standard';
    
    // Save to Capacitor Preferences
    await bridge.setPreference('wwp_settings', s);
    
    // Also localStorage for web fallback
    localStorage.setItem('wwp_settings', JSON.stringify(s));
    
    showToast('success', 'Настройки сохранены', 'Все изменения применены');
  };
  
  // Override wallet save
  window.saveWallet = async function() {
    // ... existing wallet save logic ...
    // After saving:
    await bridge.setPreference('wwp_wallets', STATE.wallets);
    localStorage.setItem('wwp_wallets', JSON.stringify(STATE.wallets));
  };
  
  // Override export to use Filesystem
  window.exportData = async function(format = 'json') {
    const data = {
      wallets: STATE.wallets,
      transactions: DEMO_TXS,
      settings: STATE.settings,
      exported: new Date().toISOString(),
    };
    
    const content = format === 'json' 
      ? JSON.stringify(data, null, 2)
      : 'Wallet,Network,Balance USD,Change 24h\n' + 
        STATE.wallets.map(w => `${w.label},${w.network},${w.balanceUsd},${w.change24h}%`).join('\n');
    
    const filename = `wallet-watcher-export.${format}`;
    
    if (bridge.isCapacitor) {
      await bridge.writeFile(filename, content, 'DOCUMENTS');
      bridge.shareContent(content, 'Wallet Watcher Pro Export');
    } else {
      // Web fallback
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    showToast('success', 'Экспорт', `Данные сохранены в ${filename}`);
  };
  
  // Add biometric lock toggle to settings
  if (bio.available) {
    injectBiometricSetting();
  }
  
  console.log('[Capacitor] Initialization complete');
}

// Inject biometric setting into settings page
function injectBiometricSetting() {
  // This will be called when settings page renders
  // We'll patch renderSettingsPage to add the biometric toggle
  const originalRenderSettings = window.renderSettingsPage;
  if (originalRenderSettings) {
    window.renderSettingsPage = function() {
      originalRenderSettings();
      
      // Add biometric section after a short delay for DOM
      setTimeout(() => {
        const container = document.querySelector('#page-content');
        if (container) {
          const bioSection = document.createElement('div');
          bioSection.className = 'settings-group';
          bioSection.innerHTML = `
            <div class="settings-group-title">🔐 Биометрия и безопасность</div>
            <div class="settings-row">
              <div class="settings-label">
                <div class="settings-label-main">Биометрическая блокировка</div>
                <div class="settings-label-sub">Требовать Face ID / отпечаток для входа</div>
              </div>
              <div class="toggle-wrap">
                <input type="checkbox" id="set-biometric" class="toggle-input" ${STATE.settings.biometricLock ? 'checked' : ''}>
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-label">
                <div class="settings-label-main">Автоблокировка</div>
                <div class="settings-label-sub">Блокировать при сворачивании приложения</div>
              </div>
              <div class="toggle-wrap">
                <input type="checkbox" id="set-autolock" class="toggle-input" ${STATE.settings.autoLock !== false ? 'checked' : ''}>
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
              </div>
            </div>
          `;
          container.appendChild(bioSection);
          
          // Event listeners
          document.getElementById('set-biometric')?.addEventListener('change', async (e) => {
            STATE.settings.biometricLock = e.target.checked;
            await window.CapacitorBridge.setPreference('wwp_settings', STATE.settings);
            if (e.target.checked) {
              const result = await window.CapacitorBridge.authenticateWithBiometric();
              if (!result.success) {
                e.target.checked = false;
                STATE.settings.biometricLock = false;
                showToast('error', 'Ошибка', result.error || 'Биометрия недоступна');
              }
            }
          });
          
          document.getElementById('set-autolock')?.addEventListener('change', async (e) => {
            STATE.settings.autoLock = e.target.checked;
            await window.CapacitorBridge.setPreference('wwp_settings', STATE.settings);
          });
        }
      }, 100);
    };
  }
}

// Biometric lock check on app resume
async function checkBiometricLock() {
  const bridge = window.CapacitorBridge;
  if (!bridge?.isCapacitor || !STATE.settings?.biometricLock) return true;
  
  const result = await bridge.authenticateWithBiometric('Разблокируйте Wallet Watcher Pro');
  if (!result.success) {
    // Exit app or show lock screen
    if (bridge.isAndroid && window.App) {
      App.exitApp();
    }
    return false;
  }
  return true;
}

// Hook into page navigation
const originalNavigate = window.navigateTo;
window.navigateTo = async function(page) {
  // Check biometric lock before showing sensitive pages
  if (['wallets', 'settings'].includes(page) && STATE.settings?.biometricLock) {
    const unlocked = await checkBiometricLock();
    if (!unlocked) return;
  }
  
  return originalNavigate(page);
};

// Handle background/foreground for biometric lock
document.addEventListener('visibilitychange', async () => {
  if (!document.hidden && STATE.settings?.biometricLock && STATE.settings?.autoLock !== false) {
    await checkBiometricLock();
  }
});

console.log('[App] Capacitor integration loaded');
