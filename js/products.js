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
        this.currentEditId = null;
        this.init();
    }

    async init() {
        try {
            await initializeSupabase();
            this.setupEventListeners();
            await this.loadProducts();
            this.showNotification('Website loaded successfully! 🎀', 'info');
        } catch (error) {
            this.showNotification('Failed to initialize the website 😢', 'error');
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

        // Make edit and delete functions available globally
        window.editProduct = (id) => this.editProduct(id);
        window.deleteProduct = (id) => this.deleteProduct(id);
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
            submitButton.innerHTML = '<span class="button-icon">⏳</span> Processing...';
            
            const productData = {
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                image_url: document.getElementById('productImage').value,
                product_link: document.getElementById('productLink').value,
                created_at: new Date().toISOString()
            };

            let error;
            if (this.currentEditId) {
                ({ error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', this.currentEditId));
            } else {
                ({ error } = await supabase
                    .from('products')
                    .insert([productData]));
            }

            if (error) throw error;

            this.showNotification(
                this.currentEditId ? 'Product updated successfully! 🎉' : 'Product added successfully! ✨', 
                'success'
            );
            
            form.reset();
            this.currentEditId = null;
            submitButton.innerHTML = '<span class="button-icon">✨</span> Add Product';
            await this.loadProducts();
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            submitButton.disabled = false;
        }
    }

    async editProduct(id) {
        try {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Fill the form with product data
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productImage').value = product.image_url;
            document.getElementById('productLink').value = product.product_link;

            // Update form for edit mode
            this.currentEditId = id;
            const submitButton = this.productForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<span class="button-icon">✏️</span> Update Product';

            // Switch to add product tab
            document.querySelector('[data-tab="add"]').click();
        } catch (error) {
            this.showNotification('Failed to load product: ' + error.message, 'error');
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product? 🗑️')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showNotification('Product deleted successfully! 🗑️', 'success');
            await this.loadProducts();
        } catch (error) {
            this.showNotification('Failed to delete product: ' + error.message, 'error');
        }
    }

    renderProducts(products) {
        if (!this.productsGrid) return;
        
        this.productsGrid.innerHTML = '';
        products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.animationDelay = `${index * 0.1}s`;
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="product-image" 
                     onerror="this.src='./assets/placeholder.svg'">
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
        if (this.productsGrid) {
            this.productsGrid.innerHTML = '<div class="loading"></div>';
        }
    }

    showEmptyState() {
        if (this.productsGrid) {
            this.productsGrid.innerHTML = `
                <div class="empty-state">
                    <p>No products found in the collection yet! 🐰</p>
                    ${this.isAdmin() ? '<p>Add some products using the form above!</p>' : ''}
                </div>
            `;
        }
    }

    showErrorState() {
        if (this.productsGrid) {
            this.productsGrid.innerHTML = `
                <div class="error-state">
                    <p>Oops! Something went wrong while loading the products 😢</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            `;
        }
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

    hideLoading() {
        const loading = this.productsGrid?.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
}

// Initialize products management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductManager();
});