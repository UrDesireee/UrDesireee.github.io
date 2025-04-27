import { supabase, initializeSupabase } from './config.js'

class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('products');
        this.searchInput = document.getElementById('searchProducts');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.supabase = null;
        this.allProducts = [];
        this.init();
    }

    async init() {
        try {
            // Ensure Supabase is initialized
            await initializeSupabase();
            this.supabase = supabase;
            
            // Only proceed if we have a valid Supabase client
            if (!this.supabase) {
                throw new Error('Failed to initialize Supabase client');
            }

            this.setupEventListeners();
            
            // Load data
            await Promise.all([
                this.loadProducts(),
                this.loadCategories()
            ]);
        } catch (error) {
            console.error('Initialization error:', error);
            this.showErrorState();
        }
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filterProducts());
        }

        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => this.filterProducts());
        }
    }

    async loadCategories() {
        try {
            const { data: categories, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            if (this.categoryFilter && categories) {
                this.categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
                    categories.map(category => `
                        <option value="${category.id}">${category.name}</option>
                    `).join('');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadProducts() {
        try {
            if (!this.productsGrid) return;
            
            this.showLoading();
            const { data: products, error } = await this.supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get categories separately
            const { data: categories } = await this.supabase
                .from('categories')
                .select('id, name');

            // Map category names to products
            this.allProducts = products.map(product => {
                const category = categories?.find(c => c.id === product.category);
                return {
                    ...product,
                    categories: category ? { name: category.name } : null
                };
            });

            if (this.allProducts.length === 0) {
                this.showEmptyState();
            } else {
                this.renderProducts(this.allProducts);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showErrorState();
        } finally {
            this.hideLoading();
        }
    }

    filterProducts() {
        if (!this.allProducts) return;

        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        const selectedCategory = this.categoryFilter?.value || '';

        let filteredProducts = this.allProducts;

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );
        }

        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(product =>
                product.category === selectedCategory
            );
        }

        this.renderProducts(filteredProducts);
    }

    renderProducts(products) {
        if (!this.productsGrid) return;
        
        if (products.length === 0) {
            this.productsGrid.innerHTML = `
                <div class="empty-state">
                    <p>No products found 🐰</p>
                </div>
            `;
            return;
        }

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
                    ${product.categories ? `<p class="product-category">${product.categories.name}</p>` : ''}
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
                    <p>No products found in the collection yet! 🐰</div>
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

export default ProductManager;