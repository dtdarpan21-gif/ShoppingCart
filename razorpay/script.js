(() => {
    const auth = window.ShoppingCartAuth;
    const current = auth.requireSession("../Shop/login.html");
    if (!current) return;
    auth.renderNavigation();

    const message = document.getElementById("checkout-message");
    const paymentButton = document.getElementById("rzp-button1");
    const cartKey = `cart_${current.session.email}`;
    let cart = [];
    try {
        const savedCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
        if (Array.isArray(savedCart)) cart = savedCart;
    } catch {
        cart = [];
    }

    const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1), 0);
    document.getElementById("checkout-total").textContent = `$${total.toFixed(2)}`;
    paymentButton.disabled = cart.length === 0;
    if (!cart.length) message.textContent = "Your cart is empty. Add products before checkout.";

    paymentButton.addEventListener("click", event => {
        event.preventDefault();
        if (!cart.length) return;
        if (typeof window.Razorpay !== "function") {
            message.textContent = "Razorpay Checkout could not load. Check your internet connection.";
            return;
        }

        // Add a Razorpay test/live key here. A server-side order and signature verification
        // are required before a production order can be considered paid.
        const options = {
            key: "rzp_test_TuYAhU7cDZZJpK",
            amount: Math.round(total * 100),
            currency: "INR",
            name: "ShoppingCart",
            description: "ShoppingCart order",
            theme: { color: "#4f46e5" },
            handler: function () {
                message.textContent = "Payment callback received. This demo has no server-side verification, so the order is not marked paid.";
            }
        };

        if (!options.key) {
            message.textContent = "Add your Razorpay key to razorpay/script.js to open the payment window.";
            return;
        }

        const checkout = new window.Razorpay(options);
        checkout.open();
    });
})();
