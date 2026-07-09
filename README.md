# ⬡ WALLET WATCHER PRO

> Мультичейн дашборд мониторинга кошельков в неоновом киберпанк стиле

---

## 🚀 Быстрый старт

Просто открыть `index.html` в браузере — никакой сборки не нужно.

---

## 🆓 Бесплатные API (без ключей)

| Сервис | Назначение | Лимит |
|--------|-----------|-------|
| **CoinGecko** `/api/v3` | Live цены SOL/ETH/BNB/TON/BTC | 30 запросов/мин |
| **Solana Public RPC** `api.mainnet-beta.solana.com` | Балансы, транзакции SOL | Без ключа |
| **Ethereum PublicNode** `ethereum.publicnode.com` | ETH балансы и данные | Без ключа |
| **BSC Dataseed** `bsc-dataseed.binance.org` | BNB Chain данные | Без ключа |
| **Base Mainnet** `mainnet.base.org` | Base L2 данные | Без ключа |
| **TonCenter** `toncenter.com/api/v2` | TON транзакции и балансы | 1 запрос/сек |

---

## 📁 Структура проекта

```
wallet-watcher-pro/
├── index.html          # Главный файл — весь UI
├── css/
│   └── style.css       # Дизайн-система (неон/киберпанк)
├── js/
│   └── app.js          # Логика, API, Charts, State
└── README.md
```

---

## 🎨 Дизайн-система

| Токен | Значение | Применение |
|-------|---------|-----------|
| `--neon-cyan` | `#00f5ff` | Основной акцент, активные элементы |
| `--neon-green` | `#39ff14` | Позитивные изменения, онлайн-статус |
| `--neon-pink` | `#ff2d78` | Негативные изменения, ошибки |
| `--neon-gold` | `#ffd700` | Предупреждения, алерты |
| `--bg-void` | `#040508` | Фон страницы |
| `--bg-panel` | `#0c0f1a` | Панели и карточки |

**Шрифты:** Orbitron (заголовки), Space Grotesk (текст), JetBrains Mono (данные)

---

## 🔧 Функционал

### ✅ Реализовано
- 📊 **Dashboard** — общий портфель, графики (Chart.js), статистика
- 👛 **Кошельки** — 5 демо-кошельков (SOL/ETH/BSC/Base/TON), детали
- 📋 **Транзакции** — история с фильтрами, экспорт CSV/JSON
- 🔔 **Уведомления** — центр с фильтрами, quick-настройки
- 📈 **Рынок** — live цены CoinGecko + сравнение с BTC
- ⚙️ **Настройки** — валюта, язык, уведомления, безопасность, экспорт
- ➕ **Добавление кошелька** — валидация адреса + реальный баланс SOL через RPC
- 🎯 **Sparklines** — мини-графики для каждого токена
- 🏃 **Live ticker** — бегущая строка с ценами
- 🍩 **Donut chart** — распределение портфеля
- 💾 **LocalStorage** — сохранение кошельков и настроек
- 🔄 **Auto-refresh** — цены обновляются каждые 30 секунд

### 🔮 Для Android-версии (следующий шаг)
- WebSocket Helius (Solana real-time)
- WebSocket Alchemy (ETH/BSC/Base real-time)
- Firebase FCM push-уведомления
- Biometric auth
- Background Foreground Service

---

## 🌐 Поддерживаемые сети

| Сеть | Иконка | RPC | WebSocket |
|------|--------|-----|-----------|
| **Solana** | ◎ | Public RPC | Helius (нужен ключ) |
| **Ethereum** | ⬡ | PublicNode | Alchemy (нужен ключ) |
| **BNB Chain** | 🔶 | BSC Dataseed | QuickNode |
| **Base L2** | 🔷 | Base Mainnet | Alchemy |
| **TON** | 💎 | TonCenter | Polling (3с) |

---

## 📐 Архитектура JS

```
STATE (глобальное состояние)
├── wallets[]      — список кошельков (localStorage)
├── prices{}       — live цены (CoinGecko)
├── notifications[]— история уведомлений
└── settings{}     — настройки пользователя

fetchLivePrices()  — CoinGecko API каждые 30с
renderDashboard()  — главный экран
renderWalletsPage()— страница кошельков
navigateTo(page)   — роутинг между страницами
showWalletDetail() — детали кошелька (overlay)
showToast()        — всплывающие уведомления
exportData()       — CSV/JSON экспорт
```

---

## 💡 Расширение под production

1. **Helius API** (бесплатный tier): `https://dev.helius.xyz/` → WebSocket для Solana
2. **Alchemy** (бесплатный tier): `https://alchemy.com` → ETH/Base/BSC WebSocket  
3. **Firebase** (бесплатный Spark): FCM push + Firestore для синхронизации
4. **TonCenter** (бесплатно): HTTP polling уже реализован

---

*Создано: 2026-07-09 | Версия: 1.0 | Стек: Vanilla JS + Chart.js + CSS*
