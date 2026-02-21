document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');
            
            // Handle Home and Wallet logic for now
            if (targetView === 'home' || targetView === 'wallet') {
                // Update active nav
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Update active view
                views.forEach(v => v.classList.remove('active'));
                const viewEl = document.getElementById(`${targetView}-view`);
                if (viewEl) {
                    viewEl.classList.add('active');
                }
            } else {
                alert(`${targetView.charAt(0).toUpperCase() + targetView.slice(1)} view coming soon!`);
            }
        });
    });

    // Simple animation for the "prosperity card"
    const card = document.querySelector('.god-wealth-card');
    if (card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(-10deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) rotate(-10deg)';
        });
    }
});
