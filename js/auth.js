import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getConfig } from './config.js'

let supabase = null;

async function initializeSupabase() {
    const config = await getConfig();
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    return supabase;
}

class AuthManager {
    constructor() {
        this.loginBtn = document.getElementById('loginBtn');
        this.loginModal = document.getElementById('loginModal');
        this.loginForm = document.getElementById('loginForm');
        this.adminPanel = document.getElementById('adminPanel');
        this.closeBtn = document.querySelector('.close');
        this.adminNavBtns = document.querySelectorAll('.admin-nav-btn');
        this.productsList = document.getElementById('productsList');
        this.searchInput = document.getElementById('searchProducts');
        
        this.init();
    }

    async init() {
        await initializeSupabase();
        this.setupEventListeners();
        this.checkSession();
    }

    setupEventListeners() {
        this.loginBtn.addEventListener('click', () => this.toggleModal());
        this.closeBtn.addEventListener('click', () => this.toggleModal());
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Admin navigation
        this.adminNavBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Search products
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce(() => this.searchProducts(), 300));
        }

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
            await this.showAdminPanel();
            this.loginBtn.textContent = 'Logout';
            this.loginBtn.onclick = () => this.handleLogout();
            showNotification('Welcome back! 🐰', 'success');
        } catch (error) {
            showNotification('Login failed: ' + error.message, 'error');
        }
    }

    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.hideAdminPanel();
            this.loginBtn.textContent = 'Admin Login';
            this.loginBtn.onclick = () => this.toggleModal();
            showNotification('Logged out successfully! 👋', 'info');
        } catch (error) {
            showNotification('Logout failed: ' + error.message, 'error');
        }
    }

    async checkSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await this.showAdminPanel();
            this.loginBtn.textContent = 'Logout';
            this.loginBtn.onclick = () => this.handleLogout();
        }
    }

    async showAdminPanel() {
        this.adminPanel.classList.remove('hidden');
        await this.loadProducts();
        this.switchTab('add');
    }

    hideAdminPanel() {
        this.adminPanel.classList.add('hidden');
    }

    switchTab(tabId) {
        // Update buttons
        this.adminNavBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.toggle('active', tab.id === tabId + 'ProductTab');
        });

        if (tabId === 'manage') {
            this.loadProducts();
        }
    }

    async loadProducts() {
        if (!this.productsList) return;

        try {
            this.productsList.innerHTML = '<div class="loading"></div>';
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.renderProductsList(products);
        } catch (error) {
            showNotification('Failed to load products: ' + error.message, 'error');
            this.productsList.innerHTML = '<div class="error-state"><p>Failed to load products 😢</p></div>';
        }
    }

    renderProductsList(products) {
        if (!products.length) {
            this.productsList.innerHTML = '<div class="empty-state"><p>No products found 🐰</p></div>';
            return;
        }

        this.productsList.innerHTML = products.map(product => `
            <div class="product-item" data-id="${product.id}">
                <img src="${product.image_url}" alt="${product.name}" 
                     onerror="this.src='./assets/placeholder.svg'">
                <div class="product-item-info">
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                </div>
                <div class="product-item-actions">
                    <button class="action-btn edit-btn" onclick="editProduct('${product.id}')">✏️</button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    async searchProducts() {
        const query = this.searchInput.value.toLowerCase();
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            showNotification('Search failed: ' + error.message, 'error');
            return;
        }

        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query)
        );

        this.renderProductsList(filteredProducts);
    }
}

// Helper function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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

// Initialize auth management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});