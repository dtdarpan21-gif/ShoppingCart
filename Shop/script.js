(() => {
    const auth = window.ShoppingCartAuth;
    const current = auth.requireSession("login.html");
    if (!current) return;
    auth.renderNavigation();

    const grid = document.getElementById("product-grid");
    const message = document.getElementById("shop-message");
    const searchInput = document.getElementById("search-products");
    const sortSelect = document.getElementById("sort-products");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const minRatingInput = document.getElementById("min-rating");
    const ratingValue = document.getElementById("rating-value");
    const cartKey = `cart_${current.session.email}`;
    let products = readCachedProducts();
    let activeCategory = "all";
    let appliedMinPrice = null;
    let appliedMaxPrice = null;
    let appliedMinRating = 0;

    function readCachedProducts() {
        try {
            const cached = JSON.parse(localStorage.getItem("products") || "[]");
            return Array.isArray(cached) ? cached.filter(product => product && product.id != null && product.category) : [];
        } catch {
            return [];
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function readCart() {
        try {
            const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
            return Array.isArray(cart) ? cart : [];
        } catch {
            return [];
        }
    }

    function getRating(product) {
        const value = Number(product.rating && product.rating.rate);
        return Number.isFinite(value) ? value : 0;
    }

    function getVisibleProducts() {
        const search = searchInput.value.trim().toLowerCase();
        let visible = products.filter(product => {
            const categoryMatches = activeCategory === "all" || String(product.category).toLowerCase() === activeCategory;
            const price = Number(product.price);
            const priceMatches = Number.isFinite(price) &&
                (appliedMinPrice === null || price >= appliedMinPrice) &&
                (appliedMaxPrice === null || price <= appliedMaxPrice);
            const ratingMatches = getRating(product) >= appliedMinRating;
            const searchMatches = !search || `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(search);
            return categoryMatches && priceMatches && ratingMatches && searchMatches;
        });

        switch (sortSelect.value) {
            case "price-asc": visible.sort((a, b) => Number(a.price) - Number(b.price)); break;
            case "price-desc": visible.sort((a, b) => Number(b.price) - Number(a.price)); break;
            case "rating-desc": visible.sort((a, b) => getRating(b) - getRating(a)); break;
            case "title-asc": visible.sort((a, b) => String(a.title).localeCompare(String(b.title))); break;
        }
        return visible;
    }

    function renderProducts() {
        const visible = getVisibleProducts();
        if (!visible.length) {
            grid.innerHTML = '<div class="empty-state"><h2>No products found</h2><p>Try changing your search or filters.</p></div>';
            if (!message.textContent.startsWith("Added")) message.textContent = "";
            return;
        }

        grid.innerHTML = visible.map(product => {
            const rating = getRating(product);
            const ratingCount = Number(product.rating && product.rating.count) || 0;
            return `<article class="product-card">
                <div class="product-image-wrap"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.title)}" loading="lazy"></div>
                <div class="product-info">
                    <p class="category-label">${escapeHTML(product.category)}</p>
                    <h3 title="${escapeHTML(product.title)}">${escapeHTML(product.title)}</h3>
                    <p class="rating">★ ${rating.toFixed(1)} <span>(${ratingCount})</span></p>
                    <div class="product-bottom"><strong>$${Number(product.price).toFixed(2)}</strong>
                        <button class="button primary add-button" type="button" data-cart-add="${Number(product.id)}">Add to Cart</button>
                    </div>
                </div>
            </article>`;
        }).join("");
        if (!message.textContent.startsWith("Added")) message.textContent = `${visible.length} product${visible.length === 1 ? "" : "s"} shown.`;
    }

    function applyFilters() {
        const min = minPriceInput.value.trim();
        const max = maxPriceInput.value.trim();
        appliedMinPrice = min === "" ? null : Number(min);
        appliedMaxPrice = max === "" ? null : Number(max);
        appliedMinRating = Number(minRatingInput.value) || 0;
        if ((appliedMinPrice !== null && (!Number.isFinite(appliedMinPrice) || appliedMinPrice < 0)) ||
            (appliedMaxPrice !== null && (!Number.isFinite(appliedMaxPrice) || appliedMaxPrice < 0))) {
            message.textContent = "Enter valid non-negative prices.";
            return;
        }
        if (appliedMinPrice !== null && appliedMaxPrice !== null && appliedMinPrice > appliedMaxPrice) {
            message.textContent = "Minimum price must not be higher than maximum price.";
            return;
        }
        message.textContent = "";
        renderProducts();
    }

    document.getElementById("applyFilters").addEventListener("click", applyFilters);
    document.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category;
            document.querySelectorAll("[data-category]").forEach(item => {
                const selected = item === button;
                item.classList.toggle("active", selected);
                item.setAttribute("aria-pressed", String(selected));
            });
            applyFilters();
        });
    });
    minRatingInput.addEventListener("input", () => { ratingValue.textContent = minRatingInput.value; });
    searchInput.addEventListener("input", renderProducts);
    sortSelect.addEventListener("change", renderProducts);
    grid.addEventListener("click", event => {
        const button = event.target.closest("[data-cart-add]");
        if (!button) return;
        const product = products.find(item => Number(item.id) === Number(button.dataset.cartAdd));
        if (!product) return;
        const cart = readCart();
        const existing = cart.find(item => Number(item.id) === Number(product.id));
        if (existing) existing.quantity += 1;
        else cart.push({
            id: Number(product.id), title: product.title, price: Number(product.price),
            image: product.image, category: product.category, quantity: 1
        });
        localStorage.setItem(cartKey, JSON.stringify(cart));
        message.textContent = `Added “${product.title}” to your cart.`;
    });

    async function loadProducts() {
        if (products.length) {
            renderProducts();
            return;
        }
        message.textContent = "Loading products…";
        try {
            const response = await fetch("https://fakestoreapi.com/products");
            if (!response.ok) throw new Error("The product service is unavailable.");
            const fetched = await response.json();
            if (!Array.isArray(fetched)) throw new Error("The product service returned invalid data.");
            products = fetched;
            localStorage.setItem("products", JSON.stringify(products));
            renderProducts();
        } catch {
            message.textContent = "Products could not be loaded. Check your connection and reload the Shop page.";
            grid.innerHTML = "";
        }
    }

    loadProducts();
})();
