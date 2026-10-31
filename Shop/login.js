const email = document.getElementById('email');
const password = document.getElementById('password');
const auth = window.ShoppingCartAuth;
auth.renderNavigation();
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

if (auth.getSession()) {
    window.location.replace("index.html");
} else loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginMessage.textContent = "";
    loginMessage.className = "form-message";

    if (!loginForm.reportValidity()) return;

    const normalizedEmail = email.value.trim().toLowerCase();
    let users;
    try {
        users = JSON.parse(localStorage.getItem("users") ?? "[]");
    } catch {
        users = [];
    }
    if (!Array.isArray(users)) users = [];
    const user = users.find((savedUser) => savedUser && typeof savedUser.email === "string" && savedUser.email.trim().toLowerCase() === normalizedEmail);

    if (!user) {
        loginMessage.textContent = "No account was found for this email. Create an account first.";
        loginMessage.classList.add("error");
        return;
    }

    if (user.password !== password.value) {
        loginMessage.textContent = "Incorrect password. Please try again.";
        loginMessage.classList.add("error");
        return;
    }

    auth.setSession(user);
    window.location.href = "index.html";
});
