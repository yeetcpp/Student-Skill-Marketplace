// public/js/login.js

const supabase = Supabase.createClient('https://alnsqajokzufxfbymzrs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbnNxYWpva3p1ZnhmYnltenJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTY5ODUsImV4cCI6MjA1ODIzMjk4NX0.aGAj3xvvO9MPVUOYiZl9C7-Oihnb5pZXifXXiJmJLdw');

document.getElementById('google-login-btn').addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:3000/auth/callback'
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error logging in with Google:', error);
        alert('Failed to log in with Google');
    }
});

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


document.querySelector('.google-login-btn').addEventListener('click', function() {
    this.classList.add('loading');
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
});