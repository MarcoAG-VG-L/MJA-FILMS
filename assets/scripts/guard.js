(function () {
    if (MJA.config.modo === "local" && !MJA.api.auth.sesion()) {
        location.replace(MJA.config.rutas.login);
    }
})();
