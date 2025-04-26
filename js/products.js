// Products management
class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('products');
        this.productForm = document.getElementById('productForm');
        this.setupEventListeners();
        this.loadProducts();
    }

    setupEventListeners() {
        this.productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
    }

    async loadProducts() {
        try {
            this.showLoading();
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.renderProducts(products);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            image_url: document.getElementById('productImage').value,
            product_link: document.getElementById('productLink').value,
        };

        try {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select();

            if (error) throw error;

            showNotification('Product added successfully!', 'success');
            this.productForm.reset();
            this.loadProducts();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    renderProducts(products) {
        this.productsGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button onclick="window.open('${product.product_link}', '_blank')" class="view-product">View Product</button>
                </div>
            `;
            this.productsGrid.appendChild(productCard);
        });
    }

    showLoading() {
        const loader = document.createElement('div');
        loader.className = 'loading';
        this.productsGrid.innerHTML = '';
        this.productsGrid.appendChild(loader);
    }

    hideLoading() {
        const loader = this.productsGrid.querySelector('.loading');
        if (loader) {
            loader.remove();
        }
    }
}

// Initialize products management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductManager();
});