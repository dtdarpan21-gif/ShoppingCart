(function () {
    const USERS_KEY = "users";
    const SESSION_KEY = "currUser";

    function readUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
            return Array.isArray(users) ? users.filter(user => user && typeof user.email === "string") : [];
        } catch {
            return [];
        }
    }

    function getSession() {
        let session;
        try {
            session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        } catch {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }

        if (!session || typeof session.email !== "string" || typeof session.token !== "string" || !session.token) {
            if (session !== null) localStorage.removeItem(SESSION_KEY);
            return null;
        }

        const email = session.email.trim().toLowerCase();
        const user = readUsers().find(savedUser => savedUser.email.trim().toLowerCase() === email);
        if (!user) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return { session, user };
    }

    function setSession(user) {
        const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const session = { email: user.email.trim().toLowerCase(), token };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    function renderNavigation() {
        const authenticated = Boolean(getSession());
        document.querySelectorAll("[data-auth-only]").forEach(item => {
            item.hidden = !authenticated;
        });
        document.querySelectorAll("[data-guest-only]").forEach(item => {
            item.hidden = authenticated;
        });
        document.querySelectorAll("[data-logout]").forEach(button => {
            if (button.dataset.logoutBound) return;
            button.dataset.logoutBound = "true";
            button.addEventListener("click", () => {
                localStorage.removeItem(SESSION_KEY);
                window.location.href = button.dataset.home || "index.html";
            });
        });
        return authenticated;
    }

    function requireSession(loginPath) {
        const current = getSession();
        if (!current) {
            window.location.replace(loginPath);
            return null;
        }
        return current;
    }

    window.ShoppingCartAuth = { getSession, setSession, renderNavigation, requireSession };
})();
