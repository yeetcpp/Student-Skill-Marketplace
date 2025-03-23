// public/js/profileSetup.js

// Sidebar menu functionality
const menuItems = document.querySelectorAll('.sidebar nav ul li');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        item.classList.add('clicked');
        
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });
});

hamburgerMenu.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});