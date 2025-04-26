import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

class AuthManager {
    constructor() {
        this.loginBtn = document.getElementById('loginBtn');
        this.loginModal = document.getElementById('loginModal');
        this.loginForm = document.getElementById('loginForm');
        this.adminPanel = document.getElementById('adminPanel');
        this.closeBtn = document.querySelector('.close');
        
        this.setupEventListeners();
        this.checkSession();
    }

    setupEventListeners() {
        this.loginBtn.addEventListener('click', () => this.toggleModal());
        this.closeBtn.addEventListener('click', () => this.toggleModal());
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        window.addEventListener('click', (e) => {
            if (e.target === this.loginModal) {
                this.toggleModal();
            }
        });
    }

    toggleModal() {
        this.loginModal.style.display = 
            this.loginModal.style.display === 'block' ? 'none' : 'block';
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.toggleModal();
            this.showAdminPanel();
            this.loginBtn.textContent = 'Logout';
            this.loginBtn.onclick = () => this.handleLogout();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.hideAdminPanel();
            this.loginBtn.textContent = 'Admin Login';
            this.loginBtn.onclick = () => this.toggleModal();
        } catch (error) {
            alert('Logout failed: ' + error.message);
        }
    }

    async checkSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.showAdminPanel();
            this.loginBtn.textContent = 'Logout';
            this.loginBtn.onclick = () => this.handleLogout();
        }
    }

    showAdminPanel() {
        this.adminPanel.classList.remove('hidden');
    }

    hideAdminPanel() {
        this.adminPanel.classList.add('hidden');
    }
}

// Initialize auth management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Notification helper
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}