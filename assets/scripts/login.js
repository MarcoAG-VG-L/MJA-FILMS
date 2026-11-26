/* =====================================================
   PÁGINA DE LOGIN
   En modo "local" se comprueba aquí con datos de prueba.
   En modo "api" no se intercepta nada: el formulario se
   envía a Laravel (POST /login) de forma normal.
   ===================================================== */

(function () {
    var config = MJA.config;
    var formulario = document.getElementById("login-form");
    var usuario = document.getElementById("username");
    var password = document.getElementById("password");
    var recordar = document.getElementById("remember");
    var errorTexto = document.getElementById("login-error");
    var botonEnviar = formulario.querySelector(".login-submit");
    var botonVer = document.getElementById("toggle-password");

    // Mostrar / ocultar contraseña
    botonVer.addEventListener("click", function () {
        var oculta = password.type === "password";
        password.type = oculta ? "text" : "password";
        botonVer.setAttribute("aria-pressed", String(oculta));
        botonVer.setAttribute("aria-label", oculta ? "Ocultar contraseña" : "Mostrar contraseña");
        password.focus();
    });

    [usuario, password].forEach(function (campo) {
        campo.addEventListener("input", function () {
            errorTexto.textContent = "";
            formulario.classList.remove("con-error");
        });
    });

    if (config.modo !== "local") return;

    // Si ya hay sesión, directo al inicio
    if (MJA.api.auth.sesion()) {
        location.replace(config.rutas.inicio);
        return;
    }

    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        botonEnviar.disabled = true;
        botonEnviar.classList.add("cargando");

        try {
            await MJA.api.auth.login(usuario.value, password.value, recordar.checked);
            location.href = config.rutas.inicio;
        } catch (error) {
            errorTexto.textContent = error.message;
            formulario.classList.remove("con-error");
            void formulario.offsetWidth; // reinicia la animación
            formulario.classList.add("con-error");
            password.value = "";
            password.focus();
            botonEnviar.disabled = false;
            botonEnviar.classList.remove("cargando");
        }
    });
})();
