/* =====================================================
   CAPA DE DATOS (API)
   -----------------------------------------------------
   Todas las páginas piden los datos AQUÍ, nunca
   directamente. Así, para pasar a Laravel basta con
   cambiar MJA.config.modo a "api": el resto del código
   no se entera del cambio.

   Endpoints que tendrá que ofrecer Laravel:
     GET    /api/peliculas
     GET    /api/generos
     GET    /api/mi-lista              → [1, 4, 7]
     POST   /api/mi-lista/{id}
     DELETE /api/mi-lista/{id}
     POST   /login   ·   POST /logout
   ===================================================== */

window.MJA = window.MJA || {};

MJA.api = (function () {
    var config = MJA.config;
    var esLocal = function () { return config.modo === "local"; };

    /* ---------- Utilidades ---------- */

    // Pequeña espera para simular una petición real en modo local
    function simular(valor) {
        return new Promise(function (resolver) {
            setTimeout(function () { resolver(valor); }, 150);
        });
    }

    function copia(valor) {
        return JSON.parse(JSON.stringify(valor));
    }

    // Laravel pone el token CSRF en <meta name="csrf-token">
    function tokenCsrf() {
        var meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : "";
    }

    async function peticion(ruta, opciones) {
        var respuesta = await fetch(ruta, Object.assign({
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": tokenCsrf()
            }
        }, opciones || {}));

        if (respuesta.status === 401 || respuesta.status === 419) {
            location.href = config.rutas.login;
            throw new Error("Sesión caducada");
        }

        if (!respuesta.ok) {
            throw new Error("Error " + respuesta.status + " en " + ruta);
        }

        if (respuesta.status === 204) return null;

        var datos = await respuesta.json();
        // Los "API Resources" de Laravel envuelven los datos en { data: ... }
        return datos && datos.data !== undefined ? datos.data : datos;
    }

    var almacen = {
        leer: function (clave, porDefecto) {
            try {
                var valor = localStorage.getItem(clave);
                return valor ? JSON.parse(valor) : porDefecto;
            } catch (error) {
                return porDefecto;
            }
        },
        guardar: function (clave, valor) {
            try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (error) { /* modo privado */ }
        }
    };

    /* ---------- Películas y géneros ---------- */

    var peliculas = {
        listar: async function () {
            if (esLocal()) return simular(copia(MJA.datosDemo.peliculas));
            return peticion(config.apiBase + "/peliculas");
        }
    };

    var generos = {
        listar: async function () {
            if (esLocal()) return simular(copia(MJA.datosDemo.generos));
            return peticion(config.apiBase + "/generos");
        }
    };

    /* ---------- Mi lista ---------- */

    var miLista = {
        ids: async function () {
            if (esLocal()) return almacen.leer("mja.miLista", []);
            return peticion(config.apiBase + "/mi-lista");
        },

        // Añade o quita una película. Devuelve true si queda en la lista.
        alternar: async function (id) {
            var actuales = await miLista.ids();
            var estaba = actuales.indexOf(id) !== -1;

            if (esLocal()) {
                var nuevas = estaba
                    ? actuales.filter(function (x) { return x !== id; })
                    : actuales.concat(id);
                almacen.guardar("mja.miLista", nuevas);
                return !estaba;
            }

            await peticion(config.apiBase + "/mi-lista/" + id, { method: estaba ? "DELETE" : "POST" });
            return !estaba;
        }
    };

    /* ---------- Sesión ---------- */

    var auth = {
        sesion: function () {
            try {
                var guardada = sessionStorage.getItem("mja.sesion") || localStorage.getItem("mja.sesion");
                return guardada ? JSON.parse(guardada) : null;
            } catch (error) {
                return null;
            }
        },

        // Solo se usa en modo local. Con Laravel el formulario se envía normal.
        login: async function (usuario, password, recordar) {
            await simular(null);
            var demo = config.demo;

            if (usuario.trim().toLowerCase() !== demo.usuario || password !== demo.password) {
                throw new Error("Usuario o contraseña incorrectos.");
            }

            var datos = JSON.stringify({ usuario: demo.usuario, nombre: demo.nombre });
            try {
                (recordar ? localStorage : sessionStorage).setItem("mja.sesion", datos);
            } catch (error) { /* sin almacenamiento */ }
            return true;
        },

        logout: async function () {
            if (esLocal()) {
                try {
                    sessionStorage.removeItem("mja.sesion");
                    localStorage.removeItem("mja.sesion");
                } catch (error) { /* nada */ }
            } else {
                await fetch(config.rutas.logout, {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "X-CSRF-TOKEN": tokenCsrf(), "X-Requested-With": "XMLHttpRequest" }
                });
            }
            location.href = config.rutas.login;
        }
    };

    return { peliculas: peliculas, generos: generos, miLista: miLista, auth: auth };
})();
