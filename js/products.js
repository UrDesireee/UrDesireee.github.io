import { supabase, initializeSupabase } from './config.js'

class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('products');
        this.searchInput = document.getElementById('searchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.init();
    }

    async init() {
        try {
            await initializeSupabase();
            this.supabase = supabase;
            
            if (!this.supabase) {
                throw new Error('Failed to initialize Supabase client');
            }

            this.setupEventListeners();
            await this.loadCategories();
            await this.loadProducts();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showErrorState();
        }
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.filterProducts();
            });
        }
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => {
                this.filterProducts();
            });
        }
    }

    async loadCategories() {
        try {
            const { data: categories, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;

            if (this.categoryFilter && categories) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    this.categoryFilter.appendChild(option);
                });
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
                .select('*, categories(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!products || products.length === 0) {
                this.showEmptyState();
                return;
            }

            this.allProducts = products; // Store all products for filtering
            this.renderProducts(products);
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

        let filtered = this.allProducts;

        if (searchTerm) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm)
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(product => 
                product.category === selectedCategory
            );
        }

        this.renderProducts(filtered);
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
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <a href="${product.product_link}" target="_blank" class="product-card-link"></a>
                <img src="${product.image_url}" alt="${product.name}" class="product-image" 
                     onerror="this.src='./assets/placeholder.svg'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    ${product.categories ? `<span class="product-category">${product.categories.name}</span>` : ''}
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