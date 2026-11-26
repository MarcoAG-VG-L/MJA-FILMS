/* =====================================================
   CONFIGURACIÓN GENERAL - MJA FILMS
   -----------------------------------------------------
   Este es el ÚNICO archivo que tendrás que tocar
   cuando conectes el proyecto con Laravel.

   modo: "local" → todo funciona en el navegador con
                   datos de prueba (lo que usamos ahora).
         "api"   → los datos vienen de Laravel
                   (rutas /api/...).
   ===================================================== */

window.MJA = window.MJA || {};

MJA.config = {
    modo: "local",

    // Prefijo de la API de Laravel (routes/api.php)
    apiBase: "/api",

    // Rutas de las páginas. Con Laravel serán "/login", "/", "/explorar"...
    rutas: {
        login: "login.html",
        inicio: "index.html",
        explorar: "explorar.html",
        logout: "/logout"
    },

    // Solo para el modo "local". Con Laravel, el usuario y la
    // contraseña se comprueban en el servidor y esto se borra.
    demo: {
        usuario: "admin",
        password: "1234",
        nombre: "Admin"
    }
};
