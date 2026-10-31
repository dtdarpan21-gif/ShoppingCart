let fname = document.getElementById('fname');
let lname = document.getElementById('lname');
let email =  document.getElementById('email');
let password =  document.getElementById('password');
let confirmPassword =  document.getElementById('confirmPassword');

let error = document.getElementById("error");
const auth = window.ShoppingCartAuth;
auth.renderNavigation();

document.getElementById("signup").addEventListener("click",(e) => {
    const normalizedEmail = email.value.trim().toLowerCase();
    if(fname.value.trim() == "" || lname.value.trim() == "" || normalizedEmail == "" || password.value == "" || confirmPassword.value == ""){

    
        error.textContent = "Please fill in all required fields.";
        error.className = "error";
    } else if (!email.checkValidity()) {
        email.reportValidity();
        return;
    } else if (password.value.length < 8) {
        error.textContent = "Password must be at least 8 characters long.";
        error.className = "error";
    } else if (password.value == confirmPassword.value) {
        let users;
        try {
            users = JSON.parse(localStorage.getItem('users') ?? "[]");
            if (!Array.isArray(users)) users = [];
        } catch {
            users = [];
        }
        let filteredUsers = users.filter((user) => user && typeof user.email === "string" && user.email.toLowerCase() == normalizedEmail);
        if(filteredUsers.length > 0) {
            error.textContent = "An account with this email already exists.";
            error.className = "error";
        
        } else{
            users.push({
                email: normalizedEmail,
                password : password.value,
                fname: fname.value.trim(),
                lname : lname.value.trim(),
                createdAt: new Date(),
            });

            localStorage.setItem("users", JSON.stringify(users));
            error.textContent = "Account created. You can now log in.";
            error.className = "success";
            fname.value ="";
            lname.value = "";
            email.value = "";
            password.value = "";
            confirmPassword.value = "";

        }
    }
    else {
        error.textContent = "Please make sure the password and confirmation match.";
        error.className = "error";
    }
})
