(() => {
    const auth = window.ShoppingCartAuth;
    const current = auth.requireSession("../Shop/login.html");
    if (!current) return;
    auth.renderNavigation();

    const key = `cart_${current.session.email}`;
    const money = value => `$${Number(value || 0).toFixed(2)}`;

    function readCart() {
        try {
            const cart = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(cart) ? cart.filter(item => item && item.id != null) : [];
        } catch {
            return [];
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function writeCart(cart) {
        localStorage.setItem(key, JSON.stringify(cart));
        renderCart();
    }

    function renderCart() {
        const cart = readCart();
        const container = document.getElementById("cart-items");
        if (!cart.length) {
            container.innerHTML = '<div class="cart-empty"><h2>Your cart is empty</h2><p class="muted">Add something you like from the shop.</p><a class="button primary" href="../Shop/index.html">Browse products</a></div>';
        } else {
            container.innerHTML = cart.map(item => `<article class="cart-item">
                <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}">
                <div class="cart-item-details"><p class="category-label">${escapeHTML(item.category)}</p>
                    <h3>${escapeHTML(item.title)}</h3><strong>${money(item.price)}</strong>
                    <div class="quantity-controls">
                        <button data-action="decrease" data-id="${Number(item.id)}" aria-label="Decrease quantity">−</button>
                        <span>${Number(item.quantity) || 1}</span>
                        <button data-action="increase" data-id="${Number(item.id)}" aria-label="Increase quantity">+</button>
                        <button class="remove-button" data-action="remove" data-id="${Number(item.id)}">Remove</button>
                    </div>
                </div><strong class="line-total">${money(Number(item.price) * (Number(item.quantity) || 1))}</strong>
            </article>`).join("");
        }

        const count = cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
        const subtotal = cart.reduce((total, item) => total + Number(item.price || 0) * (Number(item.quantity) || 1), 0);
        document.getElementById("item-count").textContent = count;
        document.getElementById("subtotal").textContent = money(subtotal);
        document.getElementById("total").textContent = money(subtotal);
        document.getElementById("checkout-btn").disabled = cart.length === 0;
    }

    document.getElementById("cart-items").addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const id = Number(button.dataset.id);
        const cart = readCart();
        const item = cart.find(entry => Number(entry.id) === id);
        if (!item) return;
        if (button.dataset.action === "remove") writeCart(cart.filter(entry => Number(entry.id) !== id));
        else if (button.dataset.action === "increase") {
            item.quantity = (Number(item.quantity) || 1) + 1;
            writeCart(cart);
        } else if (button.dataset.action === "decrease") {
            item.quantity = (Number(item.quantity) || 1) - 1;
            writeCart(cart.filter(entry => Number(entry.quantity) > 0));
        }
    });

    document.getElementById("checkout-btn").addEventListener("click", () => {
        if (readCart().length) window.location.href = "../razorpay/index.html";
    });

    renderCart();
})();
