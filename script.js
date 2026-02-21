// 1. STATE MANAGEMENT
let state = {
    gym: [
        { id: 1, name: "Bench Press", weight: 80, reps: 10, date: "2026-02-21" },
        { id: 2, name: "Squats", weight: 120, reps: 8, date: "2026-02-20" }
    ],
    assets: [
        { id: 1, name: "Maybank Savings", type: "bank", value: 5400, price: 1 },
        { id: 2, name: "Tesla (TSLA)", type: "stock", value: 10, price: 850 }
    ],
    goals: [
        { id: 1, name: "New iPhone 17 Pro", current: 1500, target: 4500 }
    ]
};

// 2. VIEW CONTROLLER
function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    // Show target view
    const target = document.getElementById(`${viewId}-view`);
    if (target) target.classList.add('active');

    // Update Nav Icons
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick')?.includes(viewId)) {
            item.classList.add('active');
        }
    });

    // Refresh contents
    renderAll();
}

// 3. RENDERING LOGIC
function renderAll() {
    renderDashboard();
    renderGym();
    renderWealth();
    renderGoals();
    lucide.createIcons();
}

function renderDashboard() {
    const totalNetWorth = state.assets.reduce((sum, asset) => sum + (asset.value * asset.price), 0);
    document.getElementById('total-net-worth').textContent = `$${totalNetWorth.toLocaleString()}`;

    // Last Workout
    const lastWorkout = state.gym[state.gym.length - 1];
    if (lastWorkout) {
        document.getElementById('last-workout').textContent = `${lastWorkout.name} - ${lastWorkout.weight}kg`;
    }

    // Recent Assets Preview
    const previewContainer = document.getElementById('asset-list-preview');
    previewContainer.innerHTML = state.assets.slice(0, 3).map(asset => `
        <div class="list-item">
            <div class="item-icon" style="background: ${asset.type === 'stock' ? 'rgba(54,185,80,0.1)' : 'rgba(88,166,255,0.1)'}">
                ${asset.name.charAt(0)}
            </div>
            <div class="card-info">
                <h4>${asset.name}</h4>
                <p>${asset.type.toUpperCase()}</p>
            </div>
            <div style="flex:1; text-align:right; font-weight:700;">
                $${(asset.value * asset.price).toLocaleString()}
            </div>
        </div>
    `).join('');
}

function renderGym() {
    const list = document.getElementById('gym-records-list');
    if (!list) return;
    list.innerHTML = state.gym.slice().reverse().map(record => `
        <div class="log-item">
            <div class="log-main">
                <h4>${record.name}</h4>
                <p class="log-meta">${record.date} • ${record.weight}kg x ${record.reps}</p>
            </div>
            <span class="log-badge">Completed</span>
        </div>
    `).join('');
}

function renderWealth() {
    const list = document.getElementById('assets-full-list');
    const totalDisp = document.getElementById('total-balance-wealth');
    if (!list) return;

    const total = state.assets.reduce((sum, a) => sum + (a.value * a.price), 0);
    totalDisp.textContent = `$${total.toLocaleString()}`;

    list.innerHTML = state.assets.map(asset => `
        <div class="asset-item">
            <div class="asset-left">
                <div class="asset-icon-box">
                    <i data-lucide="${asset.type === 'stock' ? 'trending-up' : 'wallet'}"></i>
                </div>
                <div>
                    <p class="asset-name">${asset.name}</p>
                    <p class="asset-sub">${asset.type === 'stock' ? `${asset.value} shares @ $${asset.price}` : 'Liquid Cash'}</p>
                </div>
            </div>
            <div class="asset-right">
                <p class="asset-price">$${(asset.value * asset.price).toLocaleString()}</p>
                <p class="asset-change positive">+0.00%</p>
            </div>
        </div>
    `).join('');
}

function renderGoals() {
    const list = document.getElementById('goals-list');
    const progText = document.getElementById('goal-progress');
    if (!list) return;

    if (state.goals.length > 0) {
        const primary = state.goals[0];
        const pct = Math.round((primary.current / primary.target) * 100);
        progText.textContent = `${pct}% to ${primary.name}`;
    }

    list.innerHTML = state.goals.map(goal => {
        const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
        return `
            <div class="goal-card">
                <div class="goal-title">${goal.name}</div>
                <div class="goal-progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
                <div class="goal-stats">
                    <span>$${goal.current.toLocaleString()} saved</span>
                    <span>Target: $${goal.target.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 4. MODAL & FORM LOGIC
function openModal(type) {
    document.getElementById('action-modal').classList.add('active');
    document.querySelectorAll('.form-container').forEach(f => f.classList.add('hidden'));

    if (type === 'gym') {
        document.getElementById('modal-title').textContent = "New Workout";
        document.getElementById('gym-form').classList.remove('hidden');
    } else if (type === 'asset') {
        document.getElementById('modal-title').textContent = "New Asset";
        document.getElementById('asset-form').classList.remove('hidden');
    } else if (type === 'goal') {
        document.getElementById('modal-title').textContent = "Set Goal";
        document.getElementById('goal-form').classList.remove('hidden');
    }
}

function openActionMenu() {
    // Default to gym or show a picker
    openModal('gym');
}

function closeModal() {
    document.getElementById('action-modal').classList.remove('active');
}

// --- SAVE ACTIONS ---
function saveGymRecord() {
    const name = document.getElementById('gym-exercise').value;
    const weight = parseFloat(document.getElementById('gym-weight').value);
    const reps = parseInt(document.getElementById('gym-reps').value);

    if (name && weight) {
        state.gym.push({
            id: Date.now(),
            name,
            weight,
            reps,
            date: new Date().toISOString().split('T')[0]
        });
        closeModal();
        renderAll();
    }
}

function saveAsset() {
    const name = document.getElementById('asset-name').value;
    const type = document.getElementById('asset-type').value;
    const value = parseFloat(document.getElementById('asset-value').value);
    const price = parseFloat(document.getElementById('asset-price').value || 1);

    if (name && value) {
        state.assets.push({ id: Date.now(), name, type, value, price });
        closeModal();
        renderAll();
    }
}

function saveGoal() {
    const name = document.getElementById('goal-name').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    const current = parseFloat(document.getElementById('goal-current').value || 0);

    if (name && target) {
        state.goals.push({ id: Date.now(), name, target, current });
        closeModal();
        renderAll();
    }
}

// 5. INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
});
