let state = {
    settings: { baseCurrency: 'USD', myrRate: 4.78, monthlyBurn: 2200 },
    stats: { vitality: 85, level: 12, xp: 650 },
    tasks: [
        { id: 1, text: "Finish 5k Run / 50 Pushups", done: false, category: "Health", xp: 50 },
        { id: 2, text: "DCA into SPY/BTC ($100)", done: true, category: "Wealth", xp: 100 },
        { id: 3, text: "Read 10 pages / Meditate", done: false, category: "Soul", xp: 30 }
    ],
    gymLogs: { "2026-02-18": "done", "2026-02-19": "done", "2026-02-20": "missed", "2026-02-21": "done" },
    gymVolume: [
        { date: "Feb 15", vol: 2200 }, { date: "Feb 17", vol: 2450 }, { date: "Feb 19", vol: 2100 }, { date: "Feb 21", vol: 2800 }
    ],
    prWall: { bench: 100, dead: 140, squat: 120 },
    assets: [
        { id: 1, symbol: "SPY", name: "S&P 500", type: "stock", value: 10, price: 505.2, cost: 480, currency: 'USD' },
        { id: 2, symbol: "BTC", name: "Bitcoin", type: "crypto", value: 0.12, price: 51840, cost: 42000, currency: 'USD' },
        { id: 3, symbol: "MYB", name: "Maybank", type: "bank", value: 4500, price: 1, cost: 1, currency: 'MYR' }
    ],
    activeFilter: 'all',
    expenses: [{ id: 1, name: "Venti Latte", amount: 7, type: "junk", date: "2026-02-21" }],
    targetGoal: 1000000,
    allocationChart: null,
    menuOpen: false,
    timerActive: false,
    timerSeconds: 0
};

// --- CORE APP LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    initAllocChart();
    renderAll();
    setupCalendar();
});

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${viewId}-view`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        // Match viewId in onclick attribute
        if (item.getAttribute('onclick')?.includes(`'${viewId}'`)) item.classList.add('active');
    });

    if (viewId === 'wealth' || (viewId === 'home' && document.getElementById('assetAllocationChart'))) {
        updateAllocChart();
    }
    renderAll();
    lucide.createIcons();
    if (state.menuOpen) toggleMenu();
}

// --- RENDERING ---
function renderAll() {
    const total = calculateNetWorth();
    document.getElementById('home-net-worth').textContent = `$${total.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

    // Task List with Category badges
    const taskList = document.getElementById('tasks-list');
    taskList.innerHTML = state.tasks.map(task => `
        <div class="task-item ${task.done ? 'done' : ''}" onclick="toggleTask(${task.id})">
            <div class="task-checkbox">${task.done ? '<i data-lucide="check"></i>' : ''}</div>
            <div class="task-content">
                <span class="task-text">${task.text}</span>
            </div>
        </div>
    `).join('');

    const doneCount = state.tasks.filter(t => t.done).length;
    document.getElementById('task-count').textContent = `${doneCount}/${state.tasks.length}`;

    // PR Wall
    document.getElementById('pr-bench').textContent = `${state.prWall.bench}kg`;
    document.getElementById('pr-dead').textContent = `${state.prWall.dead}kg`;
    document.getElementById('pr-squat').textContent = `${state.prWall.squat}kg`;

    // Wealth List with Logo Automation & PnL
    const wealthList = document.getElementById('wealth-assets-list');
    const filtered = state.activeFilter === 'all' ? state.assets : state.assets.filter(a => a.type === state.activeFilter);
    wealthList.innerHTML = filtered.map(a => {
        const valueUSD = a.currency === 'USD' ? (a.value * a.price) : (a.value * a.price / state.settings.myrRate);
        const costUSD = a.currency === 'USD' ? (a.value * a.cost) : (a.value * a.cost / state.settings.myrRate);
        const roi = (((valueUSD - costUSD) / costUSD) * 100).toFixed(1);
        const logo = a.type === 'crypto' ? `https://cryptologos.cc/logos/${a.name.toLowerCase().replace(' ', '-')}-${a.symbol.toLowerCase()}-logo.png` : `https://logo.clearbit.com/${a.name.toLowerCase().replace(' ', '')}.com`;

        return `
            <div class="asset-card">
                <div class="a-left">
                    <img src="${logo}" class="a-img" onerror="this.src='https://ui-avatars.com/api/?name=${a.symbol}&background=random'">
                    <div>
                        <p class="a-name">${a.symbol}</p>
                        <p class="a-type">${a.name} (${a.currency})</p>
                    </div>
                </div>
                <div class="a-right">
                    <p class="a-val">$${valueUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p class="a-sub ${roi >= 0 ? 'positive' : 'negative'}">${roi >= 0 ? '+' : ''}${roi}%</p>
                </div>
            </div>
        `;
    }).join('');

    // Archon Survival Logic
    const emergencyCash = state.assets.filter(a => a.type === 'bank').reduce((sum, a) => sum + (a.currency === 'USD' ? a.value : a.value / state.settings.myrRate), 0);
    const survivalDays = Math.round((emergencyCash / (state.settings.monthlyBurn / 30)));
    document.getElementById('survival-runway').textContent = `${survivalDays} Days`;
    document.getElementById('survival-status').textContent = survivalDays > 180 ? 'Fortress' : 'Warning';

    // Soul / Prophet Logic
    const remaining = state.targetGoal - total;
    const years = (remaining / (2500 * 12)).toFixed(1); // Assuming 2.5k savings/mo
    document.getElementById('time-prediction').textContent = years;

    // Junk calculation
    const junkTotal = state.expenses.filter(e => e.type === 'junk').reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('junk-total').textContent = `$${junkTotal}`;
    // Future value logic: Junk * 1.1^5 (10% growth) * 5 (just a multiplier for dramatic effect)
    document.getElementById('future-btc').textContent = `$${Math.round(junkTotal * 7.5)}`;

    const totalVol = state.gymVolume.reduce((sum, v) => sum + v.vol, 0);
    document.getElementById('training-volume').textContent = totalVol.toLocaleString();

    if (state.allocationChart) updateAllocChart();
}

function filterAssets(type) {
    state.activeFilter = type;
    document.querySelectorAll('.asset-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${type}'`));
    });
    renderAll();
}

// --- INTERACTIVE ACTIONS ---
function toggleMenu() {
    state.menuOpen = !state.menuOpen;
    const menu = document.getElementById('floating-menu');
    const plus = document.getElementById('plus-icon');
    const btn = document.querySelector('.center-btn');

    if (state.menuOpen) {
        menu.classList.add('active');
        btn.classList.add('active');
    } else {
        menu.classList.remove('active');
        btn.classList.remove('active');
    }
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) task.done = !task.done;
    renderAll();
    lucide.createIcons();
}

function calculateNetWorth() {
    return state.assets.reduce((sum, a) => {
        const val = a.value * a.price;
        return sum + (a.currency === 'USD' ? val : val / state.settings.myrRate);
    }, 0);
}

// --- REST TIMER ---
function toggleTimer(sec) {
    if (state.timerActive) return;
    state.timerActive = true;
    state.timerSeconds = sec;
    const btn = document.getElementById('timer-display');
    btn.classList.add('active');

    const interval = setInterval(() => {
        state.timerSeconds--;
        btn.textContent = `${state.timerSeconds}s`;
        if (state.timerSeconds <= 0) {
            clearInterval(interval);
            state.timerActive = false;
            btn.textContent = 'REST';
            btn.classList.remove('active');
            new Audio('https://assets.mixkit.net/sfx/preview/mixkit-simple-notification-alert-2630.mp3').play();
        }
    }, 1000);
}

// --- CALENDAR ---
function setupCalendar() {
    const calGrid = document.getElementById('calendar-days');
    if (!calGrid) return;
    calGrid.innerHTML = '';
    const days = 28;
    for (let i = 1; i <= days; i++) {
        const dateStr = `2026-02-${i.toString().padStart(2, '0')}`;
        const status = state.gymLogs[dateStr] || '';
        const dayEl = document.createElement('div');
        dayEl.className = `cal-day ${status ? 'has-' + status : ''}`;
        dayEl.textContent = i;
        calGrid.appendChild(dayEl);
    }
}

// --- CHARTS ---
function initAllocChart() {
    const ctx = document.getElementById('assetAllocationChart').getContext('2d');
    state.allocationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Stock', 'Crypto', 'Cash'],
            datasets: [{
                data: [40, 30, 30],
                backgroundColor: ['#0A84FF', '#FFD60A', '#32D74B'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateAllocChart() {
    const totals = { stock: 0, crypto: 0, bank: 0 };
    state.assets.forEach(a => totals[a.type] += (a.value * a.price));
    state.allocationChart.data.datasets[0].data = [totals.stock, totals.crypto, totals.bank];
    state.allocationChart.update();
}

// --- MODAL & SAVE ---
function openModal(type) {
    document.getElementById('action-modal').style.display = 'flex';
    document.getElementById('action-modal').classList.add('active');
    document.querySelectorAll('.form-section').forEach(f => f.classList.add('hidden'));

    // Support mapping 'task' to gym form or add a task form
    const formId = type === 'task' ? 'form-gym' : `form-${type}`;
    const formEl = document.getElementById(formId);
    if (formEl) formEl.classList.remove('hidden');

    document.getElementById('modal-title').textContent = type === 'asset' ? "Execute Order" : "Growth Log";
    if (state.menuOpen) toggleMenu();
}

function closeModal() {
    document.getElementById('action-modal').classList.remove('active');
}

function saveGym() {
    const weight = parseInt(document.getElementById('gym-weight').value);
    const name = document.getElementById('gym-name').value;
    if (weight > 0) {
        if (name.toLowerCase().includes('bench')) state.prWall.bench = weight;
        if (name.toLowerCase().includes('dead')) state.prWall.dead = weight;
        if (name.toLowerCase().includes('squat')) state.prWall.squat = weight;

        state.gymVolume.push({ date: new Date().toLocaleDateString(), vol: weight * 10 }); // Dummy vol calc
    }
    const today = new Date().toISOString().split('T')[0];
    state.gymLogs[today] = 'done';
    closeModal();
    renderAll();
}

function saveAsset() {
    const symbol = document.getElementById('asset-name').value.toUpperCase();
    const qty = parseFloat(document.getElementById('asset-value').value);
    const type = document.getElementById('asset-type').value;

    if (symbol && qty > 0) {
        state.assets.push({
            id: Date.now(),
            symbol: symbol,
            name: symbol, // Simulating name for demo
            type: type,
            value: qty,
            price: type === 'crypto' ? 51000 : 500, // Dummy prices
            cost: type === 'crypto' ? 51000 : 500,
            currency: 'USD'
        });
        closeModal();
        renderAll();
        updateAllocChart();
    }
}
