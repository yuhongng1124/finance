// --- REFINED STATE ---
let state = {
    tasks: [
        { id: 1, text: "Finish 5k Run / 50 Pushups", done: false, category: "Health" },
        { id: 2, text: "DCA into SPY/BTC ($100)", done: true, category: "Wealth" },
        { id: 3, text: "Read 10 pages / Meditate", done: false, category: "Soul" }
    ],
    gymLogs: {
        "2026-02-18": "done", "2026-02-19": "done",
        "2026-02-20": "missed", "2026-02-21": "done"
    },
    prWall: { bench: 100, dead: 140, squat: 120 },
    assets: [
        { id: 1, name: "S&P 500 (SPY)", type: "stock", value: 10, price: 505, cost: 480, img: "https://logo.clearbit.com/standardandpoors.com" },
        { id: 2, name: "Bitcoin (BTC)", type: "crypto", value: 0.12, price: 52000, cost: 42000, img: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
        { id: 3, name: "Emergency Cash", type: "bank", value: 4500, price: 1, cost: 1, img: "https://logo.clearbit.com/maybank.com" }
    ],
    expenses: [
        { id: 1, name: "Venti Latte", amount: 7, type: "junk", date: "2026-02-21" },
        { id: 2, name: "Game Skin", amount: 15, type: "junk", date: "2026-02-20" }
    ],
    targetGoal: 1000000,
    allocationChart: null,
    menuOpen: false
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
        if (item.getAttribute('onclick')?.includes(viewId)) item.classList.add('active');
    });

    if (viewId === 'wealth') updateAllocChart();
    renderAll();
    lucide.createIcons();
    if (state.menuOpen) toggleMenu(); // Close menu on view switch
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

    // Wealth List
    const wealthList = document.getElementById('wealth-assets-list');
    wealthList.innerHTML = state.assets.map(a => {
        const roi = (((a.price - a.cost) / a.cost) * 100).toFixed(1);
        return `
            <div class="asset-card">
                <div class="a-left">
                    <img src="${a.img}" class="a-img" onerror="this.src='https://via.placeholder.com/40'">
                    <div>
                        <p class="a-name">${a.name}</p>
                        <p class="a-type">DCA Avg: $${a.cost.toLocaleString()}</p>
                    </div>
                </div>
                <div class="a-right">
                    <p class="a-val">$${(a.value * a.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p class="a-sub positive">${roi >= 0 ? '+' : ''}${roi}%</p>
                </div>
            </div>
        `;
    }).join('');

    // Soul / Prophet Logic
    const remaining = state.targetGoal - total;
    const years = (remaining / (2500 * 12)).toFixed(1); // Assuming 2.5k savings/mo
    document.getElementById('time-prediction').textContent = years;

    // Junk calculation
    const junkTotal = state.expenses.filter(e => e.type === 'junk').reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('junk-total').textContent = `$${junkTotal}`;
    // Future value logic: Junk * 1.1^5 (10% growth) * 5 (just a multiplier for dramatic effect)
    document.getElementById('future-btc').textContent = `$${Math.round(junkTotal * 7.5)}`;

    if (state.allocationChart) updateAllocChart();
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
    return state.assets.reduce((sum, a) => sum + (a.value * a.price), 0);
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
    }
    const today = new Date().toISOString().split('T')[0];
    state.gymLogs[today] = 'done';
    closeModal();
    renderAll();
}

function saveAsset() {
    // Basic implementation for demo
    closeModal();
    renderAll();
}
