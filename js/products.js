import { supabase, initializeSupabase } from './config.js'

class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('products');
        this.init();
    }

    async init() {
        try {
            await initializeSupabase();
            this.supabase = supabase;
            
            if (!this.supabase) {
                throw new Error('Failed to initialize Supabase client');
            }

            await this.loadProducts();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showErrorState();
        }
    }

    async loadProducts() {
        try {
            if (!this.productsGrid) return;
            
            this.showLoading();
            const { data: products, error } = await this.supabase
                .from('products')
                .select('*');

            if (error) throw error;

            if (!products || products.length === 0) {
                this.showEmptyState();
                return;
            }

            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showErrorState();
        } finally {
            this.hideLoading();
        }
    }

    renderProducts(products) {
        if (!this.productsGrid) return;
        
        this.productsGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
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

    hideLoading() {
        const loading = this.productsGrid?.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
}

export default ProductManager;