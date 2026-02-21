// --- STATE ---
let state = {
    tasks: [
        { id: 1, text: "Push 100kg Bench", done: false },
        { id: 2, text: "Buy TSLA dip", done: true },
        { id: 3, text: "Log daily earnings", done: false }
    ],
    gymLogs: {
        "2026-02-18": "done",
        "2026-02-19": "done",
        "2026-02-20": "missed",
        "2026-02-21": "done"
    },
    assets: [
        { id: 1, name: "Tesla (TSLA)", type: "stock", value: 10, price: 850, img: "https://logo.clearbit.com/tesla.com" },
        { id: 2, name: "Bitcoin", type: "crypto", value: 0.1, price: 52000, img: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
        { id: 3, name: "Maybank", type: "bank", value: 5000, price: 1, img: "https://logo.clearbit.com/maybank.com" }
    ],
    earnings: [
        { date: "2026-02-21", amount: 150 },
        { date: "2026-02-20", amount: -40 },
        { date: "2026-02-19", amount: 200 }
    ],
    targetGoal: 1000000, // 1 Million USD
    tempImage: null
};

// --- INITIALIZE & VIEW CONTROL ---
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    renderAll();
    setupCalendar();
});

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${viewId}-view`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(viewId)) item.classList.add('active');
    });

    renderAll();
    lucide.createIcons();
}

// --- RENDERERS ---
function renderAll() {
    renderHome();
    renderGym();
    renderWealth();
    renderProgress();
}

function renderHome() {
    const total = calculateTotalNetWorth();
    document.getElementById('home-net-worth').textContent = `$${total.toLocaleString()}`;

    const taskList = document.getElementById('tasks-list');
    taskList.innerHTML = state.tasks.map(task => `
        <div class="task-item ${task.done ? 'done' : ''}" onclick="toggleTask(${task.id})">
            <div class="task-checkbox">${task.done ? '<i data-lucide="check"></i>' : ''}</div>
            <span class="task-text">${task.text}</span>
        </div>
    `).join('');

    const doneCount = state.tasks.filter(t => t.done).length;
    document.getElementById('task-count').textContent = `${doneCount}/${state.tasks.length}`;
}

function renderGym() {
    setupCalendar();
}

function renderWealth() {
    const list = document.getElementById('wealth-assets-list');
    list.innerHTML = state.assets.map(a => `
        <div class="asset-card">
            <div class="a-left">
                <img src="${a.img || 'https://via.placeholder.com/50'}" class="a-img" alt="">
                <div>
                    <p class="a-name">${a.name}</p>
                    <p class="a-type">${a.type}</p>
                </div>
            </div>
            <div class="a-right">
                <p class="a-val">$${(a.value * a.price).toLocaleString()}</p>
                <p class="a-sub">+0.00%</p>
            </div>
        </div>
    `).join('');
}

function renderProgress() {
    const total = calculateTotalNetWorth();
    const remaining = Math.max(0, state.targetGoal - total);
    document.getElementById('milestone-remaining').textContent = `$${remaining.toLocaleString()} to go`;

    const pct = Math.min(100, (total / state.targetGoal) * 100).toFixed(1);
    document.getElementById('milestone-percent').textContent = `${pct}%`;

    // Simple projection: if we save $10k a year...
    const years = (remaining / 12000).toFixed(1);
    document.getElementById('time-prediction').textContent = years;

    const earnList = document.getElementById('earnings-list');
    earnList.innerHTML = state.earnings.map(e => `
        <div class="asset-card" style="padding: 12px 20px;">
            <p style="font-weight:700;">${e.date}</p>
            <p style="font-weight:800; color: ${e.amount >= 0 ? 'var(--ios-green)' : 'var(--ios-red)'}">
                ${e.amount >= 0 ? '+' : ''}$${e.amount}
            </p>
        </div>
    `).join('');
}

// --- LOGIC HELPERS ---
function calculateTotalNetWorth() {
    return state.assets.reduce((sum, a) => sum + (a.value * a.price), 0);
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) task.done = !task.done;
    renderHome();
    lucide.createIcons();
}

function setupCalendar() {
    const calGrid = document.getElementById('calendar-days');
    if (!calGrid) return;

    calGrid.innerHTML = '';
    const daysInMonth = 28; // Simplified for demo

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `2026-02-${i.toString().padStart(2, '0')}`;
        const status = state.gymLogs[dateStr] || '';

        const dayEl = document.createElement('div');
        dayEl.className = `cal-day ${status ? 'has-' + status : ''} ${i === 21 ? 'today' : ''}`;
        dayEl.textContent = i;
        dayEl.onclick = () => logGymDirect(dateStr);
        calGrid.appendChild(dayEl);
    }
}

function logGymDirect(date) {
    const current = state.gymLogs[date];
    if (!current) state.gymLogs[date] = 'done';
    else if (current === 'done') state.gymLogs[date] = 'missed';
    else delete state.gymLogs[date];
    renderGym();
}

// --- MODALS ---
function openModal(type) {
    state.tempImage = null;
    document.getElementById('action-modal').classList.add('active');
    document.querySelectorAll('.form-section').forEach(f => f.classList.add('hidden'));
    document.getElementById(`form-${type}`).classList.remove('hidden');
    document.getElementById('modal-title').textContent = `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
}

function closeModal() {
    document.getElementById('action-modal').classList.remove('remove');
    document.getElementById('action-modal').classList.remove('active');
}

function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.tempImage = e.target.result;
            document.getElementById('image-preview').innerHTML = `<img src="${state.tempImage}" style="width:50px; height:50px; border-radius:10px; margin-top:10px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveAsset() {
    const name = document.getElementById('asset-name').value;
    const type = document.getElementById('asset-type').value;
    const value = parseFloat(document.getElementById('asset-value').value);
    const price = parseFloat(document.getElementById('asset-price').value);

    if (name && value && price) {
        state.assets.push({
            id: Date.now(),
            name, type, value, price,
            img: state.tempImage || `https://logo.clearbit.com/${name.toLowerCase().replace(' ', '')}.com`
        });
        closeModal();
        renderAll();
    }
}

function saveEarning() {
    const amount = parseFloat(document.getElementById('earning-amount').value);
    if (!isNaN(amount)) {
        state.earnings.unshift({
            date: new Date().toISOString().split('T')[0],
            amount: amount
        });
        closeModal();
        renderAll();
    }
}

// --- CHARTS ---
function initChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Net Worth',
                data: [45000, 48000, 52000, 51000, 58000, 62000],
                borderColor: '#007aff',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
