(() => {
    const auth = window.ShoppingCartAuth;
    const current = auth.requireSession("../Shop/login.html");
    if (!current) return;
    auth.renderNavigation();

    const email = current.session.email;
    const user = current.user;
    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const emailField = document.getElementById("email");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");
    const message = document.getElementById("profile-message");

    firstName.value = user.fname ?? user.firstName ?? "";
    lastName.value = user.lname ?? user.lastName ?? "";
    emailField.value = user.email;
    phone.value = user.phone ?? "";
    address.value = user.address ?? "";
    updateAvatar();

    function updateAvatar() {
        const initials = `${firstName.value.trim().charAt(0)}${lastName.value.trim().charAt(0)}`.toUpperCase();
        document.getElementById("avatar").textContent = initials || "U";
    }

    document.getElementById("profile-form").addEventListener("submit", event => {
        event.preventDefault();
        message.textContent = "";
        let users;
        try {
            users = JSON.parse(localStorage.getItem("users") || "[]");
        } catch {
            users = [];
        }
        if (!Array.isArray(users)) users = [];

        const userIndex = users.findIndex(savedUser => savedUser && typeof savedUser.email === "string" && savedUser.email.trim().toLowerCase() === email.toLowerCase());
        if (userIndex < 0) {
            localStorage.removeItem("currUser");
            window.location.replace("../Shop/login.html");
            return;
        }

        users[userIndex] = {
            ...users[userIndex],
            fname: firstName.value.trim(),
            lname: lastName.value.trim(),
            phone: phone.value.trim(),
            address: address.value.trim()
        };
        localStorage.setItem("users", JSON.stringify(users));
        message.textContent = "Your profile has been saved.";
        message.className = "form-message success";
        updateAvatar();
    });

    document.getElementById("delete-account").addEventListener("click", () => {
        if (!window.confirm("Delete this account and its cart? This cannot be undone.")) return;
        let users;
        try {
            users = JSON.parse(localStorage.getItem("users") || "[]");
        } catch {
            message.textContent = "Account data could not be read. No account was deleted.";
            message.className = "form-message error";
            return;
        }
        if (!Array.isArray(users)) {
            message.textContent = "Account data is invalid. No account was deleted.";
            message.className = "form-message error";
            return;
        }
        const remainingUsers = users.filter(savedUser =>
            !savedUser || typeof savedUser.email !== "string" || savedUser.email.trim().toLowerCase() !== email.toLowerCase()
        );
        if (remainingUsers.length === users.length) {
            message.textContent = "The current account could not be found. No account was deleted.";
            message.className = "form-message error";
            return;
        }
        localStorage.setItem("users", JSON.stringify(remainingUsers));
        localStorage.removeItem(`cart_${email}`);
        localStorage.removeItem("currUser");
        window.location.href = "../index.html";
    });
})();
