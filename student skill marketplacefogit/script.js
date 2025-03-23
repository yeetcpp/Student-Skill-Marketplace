// Select all sidebar menu items
const menuItems = document.querySelectorAll('.sidebar nav ul li');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');
const cards = document.querySelectorAll('.card.animate');
const ctaButton = document.querySelector('.cta-button');

// Add click event to each menu item
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        menuItems.forEach(i => i.classList.remove('active'));
        // Add active class to the clicked item
        item.classList.add('active');
        
        // Close sidebar on mobile after clicking a menu item
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });
});

// Toggle sidebar on hamburger menu click
hamburgerMenu.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Staggered animation for cards
cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
});

// Ripple effect on CTA button click
ctaButton.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ctaButton.appendChild(ripple);

    const rect = ctaButton.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    setTimeout(() => ripple.remove(), 600);
});