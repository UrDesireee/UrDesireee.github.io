import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getConfig } from './config.js'

let supabase = null;

async function initializeSupabase() {
    const config = await getConfig();
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    return supabase;
}

class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('products');
        this.productForm = document.getElementById('productForm');
        this.init();
    }

    async init() {
        try {
            await initializeSupabase();
            this.setupEventListeners();
            await this.loadProducts();
            this.showNotification('Website loaded successfully!', 'info');
        } catch (error) {
            this.showNotification('Failed to initialize the website. Please check your configuration.', 'error');
            console.error('Initialization error:', error);
        }
    }

    setupEventListeners() {
        if (this.productForm) {
            this.productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }

        // Add smooth scrolling for collection link
        document.querySelector('a[href="#collections"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#collections').scrollIntoView({ behavior: 'smooth' });
        });
    }

    async loadProducts() {
        try {
            this.showLoading();
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (products.length === 0) {
                this.showEmptyState();
            } else {
                this.renderProducts(products);
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
            this.showErrorState();
        } finally {
            this.hideLoading();
        }
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Adding...';
            
            const productData = {
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                image_url: document.getElementById('productImage').value,
                product_link: document.getElementById('productLink').value,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('products')
                .insert([productData]);

            if (error) throw error;

            this.showNotification('Product added successfully!', 'success');
            form.reset();
            await this.loadProducts();
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Add Product';
        }
    }

    renderProducts(products) {
        this.productsGrid.innerHTML = '';
        products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.animationDelay = `${index * 0.1}s`;
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="product-image" 
                     onerror="this.src='./assets/placeholder.jpg'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <a href="${product.product_link}" target="_blank" class="browse-btn">View on Yesstyle</a>
                </div>
            `;
            this.productsGrid.appendChild(productCard);
        });
    }

    showLoading() {
        this.productsGrid.innerHTML = '<div class="loading"></div>';
    }

    showEmptyState() {
        this.productsGrid.innerHTML = `
            <div class="empty-state">
                <p>No products found in the collection yet! 🐰</p>
                ${this.isAdmin() ? '<p>Add some products using the form above!</p>' : ''}
            </div>
        `;
    }

    showErrorState() {
        this.productsGrid.innerHTML = `
            <div class="error-state">
                <p>Oops! Something went wrong while loading the products. 😢</p>
                <button onclick="window.location.reload()">Try Again</button>
            </div>
        `;
    }

    isAdmin() {
        return document.getElementById('adminPanel')?.classList.contains('hidden') === false;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize products management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductManager();
});