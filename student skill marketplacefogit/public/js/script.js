// public/js/script.js

// Select all sidebar menu items
const menuItems = document.querySelectorAll('.sidebar nav ul li');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');
const cards = document.querySelectorAll('.card.animate');
const userProfileLink = document.querySelector('.user-profile a');

// Add click event to each menu item
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        menuItems.forEach(i => i.classList.remove('active'));
        // Add active class to the clicked item
        item.classList.add('active');
        // Add click animation
        item.classList.add('clicked');
        
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

// Ensure no card is selected by default on page load
document.addEventListener('DOMContentLoaded', () => {
    cards.forEach(card => card.classList.remove('selected'));
});

// Add click event to each card
cards.forEach(card => {
    card.addEventListener('click', () => {
        // Remove selected class from all cards
        cards.forEach(c => c.classList.remove('selected'));
        // Add selected class to the clicked card
        card.classList.add('selected');
        // Add click animation
        card.classList.add('clicked');
        // Log the click (for debugging)
        console.log('Card clicked:', card.querySelector('h2').textContent);
    });
});