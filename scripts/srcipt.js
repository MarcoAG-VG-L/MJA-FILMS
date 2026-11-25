const loginForm = document.getElementById("login-form");
const loginScreen = document.getElementById("login-screen");
const appShell = document.getElementById("app-shell");
const loginError = document.getElementById("login-error");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const logoutButton = document.getElementById("logout-button");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (usernameInput.value.trim() !== "admin" || passwordInput.value !== "1234") {
        loginError.textContent = "Usuario o contraseña incorrectos.";
        passwordInput.value = "";
        passwordInput.focus();
        return;
    }

    loginError.textContent = "";
    loginScreen.hidden = true;
    appShell.hidden = false;
});

logoutButton.addEventListener("click", () => {
    appShell.hidden = true;
    loginScreen.hidden = false;
    loginForm.reset();
    loginError.textContent = "";
    usernameInput.focus();
});