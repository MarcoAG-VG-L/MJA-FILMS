/* =====================================================
   COMPONENTES COMPARTIDOS
   Tarjetas, pósters, ficha (modal), avisos, fondos
   por género y cabecera. Lo usan todas las páginas.
   ===================================================== */

window.MJA = window.MJA || {};

MJA.ui = (function () {

    /* ---------- Textos y fondos de cada género ---------- */

    var temas = {
        "todas": {
            eyebrow: "EL CINE NO TIENE LÍMITES",
            titulo: "Descubre nuevas <span>historias.</span>",
            texto: "Explora nuestro catálogo, encuentra películas de todos los géneros y guarda las historias que no te quieres perder."
        },
        "accion": {
            eyebrow: "ADRENALINA PURA",
            titulo: "Acción sin <span>pausa.</span>",
            texto: "Persecuciones, golpes imposibles y héroes al límite. Abróchate el cinturón."
        },
        "aventura": {
            eyebrow: "RUMBO A LO DESCONOCIDO",
            titulo: "Más allá del <span>mapa.</span>",
            texto: "Viajes épicos, paisajes imposibles y finales que se ganan paso a paso."
        },
        "drama": {
            eyebrow: "HISTORIAS QUE SE SIENTEN",
            titulo: "Emociones que <span>se quedan.</span>",
            texto: "Personajes reales, decisiones difíciles y momentos que te acompañan después de los créditos."
        },
        "ciencia-ficcion": {
            eyebrow: "MÁS ALLÁ DE LAS ESTRELLAS",
            titulo: "El futuro empieza <span>aquí.</span>",
            texto: "Otros mundos, viajes en el tiempo y preguntas que no tienen una respuesta fácil."
        },
        "comedia": {
            eyebrow: "RISAS GARANTIZADAS",
            titulo: "Para reír sin <span>parar.</span>",
            texto: "Comedias para desconectar, compartir con quien quieras y volver a ver."
        },
        "thriller": {
            eyebrow: "NADA ES LO QUE PARECE",
            titulo: "Tensión hasta el <span>final.</span>",
            texto: "Misterios, giros y secretos que no te dejarán apartar la vista de la pantalla."
        },
        "lista": {
            eyebrow: "TU COLECCIÓN",
            titulo: "Mi <span>lista.</span>",
            texto: "Las películas que has guardado para ver más tarde, siempre a mano."
        }
    };

    var catalogo = new Map();
    var generos = new Map();
    var idsEnLista = new Set();

    /* ---------- Utilidades ---------- */

    function esc(texto) {
        return String(texto == null ? "" : texto)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function normalizar(texto) {
        return String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    }

    function nombreGenero(slug) {
        return generos.get(slug) || slug;
    }

    function duracion(minutos) {
        var h = Math.floor(minutos / 60);
        var m = minutos % 60;
        return h + " h " + (m < 10 ? "0" : "") + m + " min";
    }

    function registrar(listaPeliculas, listaGeneros, ids) {
        listaPeliculas.forEach(function (p) { catalogo.set(p.id, p); });
        (listaGeneros || []).forEach(function (g) { generos.set(g.slug, g.nombre); });
        idsEnLista = new Set(ids || []);
    }

    /* ---------- Fondos por género ---------- */

    // Crea una capa por género dentro del contenedor (se cruzan con un fundido)
    function crearFondos(contenedor, listaTemas) {
        contenedor.innerHTML = listaTemas.map(function (tema) {
            return '<div class="tema-fondo capa-fondo" data-tema="' + esc(tema) + '"></div>';
        }).join("");
    }

    function mostrarFondo(contenedor, tema) {
        contenedor.querySelectorAll(".capa-fondo").forEach(function (capa) {
            capa.classList.toggle("activa", capa.dataset.tema === tema);
        });
    }

    /* ---------- Póster y tarjeta ---------- */

    function poster(p) {
        if (p.poster_url) {
            return '<div class="poster poster-imagen"><img src="' + esc(p.poster_url) + '" alt="" loading="lazy"></div>';
        }

        var titulo = esc(p.titulo_poster || p.titulo.toUpperCase()).split("|").join("<br>");

        return '<div class="poster" data-estilo="' + esc(p.estilo) + '" aria-hidden="true">' +
            '<span class="poster-kicker">' + esc(p.eslogan) + '</span>' +
            '<span class="poster-title">' + titulo + '</span>' +
            '<span class="poster-bottom">' + esc(p.lema) + '</span>' +
        '</div>';
    }

    function botonLista(p, conTexto) {
        var en = idsEnLista.has(p.id);
        var etiqueta = (en ? "Quitar " : "Añadir ") + p.titulo + (en ? " de Mi lista" : " a Mi lista");

        if (conTexto) {
            return '<button class="button button-ghost boton-lista" type="button" data-accion="lista" data-id="' + p.id + '" aria-pressed="' + en + '">' +
                '<span class="lista-icono" aria-hidden="true">' + (en ? "✓" : "＋") + '</span>' +
                '<span class="lista-texto">' + (en ? "En mi lista" : "Mi lista") + '</span>' +
            '</button>';
        }

        return '<button class="favorite-button" type="button" data-accion="lista" data-id="' + p.id + '" aria-pressed="' + en + '" aria-label="' + esc(etiqueta) + '" title="' + (en ? "Quitar de Mi lista" : "Añadir a Mi lista") + '">' +
            '<span class="lista-icono" aria-hidden="true">' + (en ? "✓" : "+") + '</span>' +
        '</button>';
    }

    function tarjeta(p) {
        return '<article class="movie-card" data-id="' + p.id + '">' +
            '<button class="card-open" type="button" data-accion="ficha" data-id="' + p.id + '" aria-label="Ver ficha de ' + esc(p.titulo) + '">' +
                poster(p) +
            '</button>' +
            botonLista(p, false) +
            '<div class="movie-info">' +
                '<div>' +
                    '<h3>' + esc(p.titulo) + '</h3>' +
                    '<p>' + esc(nombreGenero(p.genero)) + ' <span>·</span> ' + p.anio + '</p>' +
                '</div>' +
                '<span class="rating" aria-label="Valoración ' + p.valoracion.toFixed(1) + ' sobre 10">★ ' + p.valoracion.toFixed(1) + '</span>' +
            '</div>' +
        '</article>';
    }

    function esqueletos(cantidad) {
        var html = "";
        for (var i = 0; i < cantidad; i++) {
            html += '<div class="movie-card skeleton" aria-hidden="true"><div class="poster"></div><div class="sk-line"></div><div class="sk-line short"></div></div>';
        }
        return html;
    }

    /* ---------- Mi lista: actualizar todos los botones a la vez ---------- */

    function pintarBotonesLista(id, en) {
        var p = catalogo.get(id);
        document.querySelectorAll('[data-accion="lista"][data-id="' + id + '"]').forEach(function (boton) {
            boton.setAttribute("aria-pressed", String(en));
            var icono = boton.querySelector(".lista-icono");
            var texto = boton.querySelector(".lista-texto");

            if (texto) {
                icono.textContent = en ? "✓" : "＋";
                texto.textContent = en ? "En mi lista" : "Mi lista";
            } else {
                icono.textContent = en ? "✓" : "+";
                boton.title = en ? "Quitar de Mi lista" : "Añadir a Mi lista";
                if (p) boton.setAttribute("aria-label", (en ? "Quitar " : "Añadir ") + p.titulo + (en ? " de Mi lista" : " a Mi lista"));
            }
        });
    }

    async function alternarLista(id) {
        try {
            var en = await MJA.api.miLista.alternar(id);
            if (en) idsEnLista.add(id); else idsEnLista.delete(id);
            pintarBotonesLista(id, en);

            var p = catalogo.get(id);
            aviso(en ? "Añadida a Mi lista: " + p.titulo : "Quitada de Mi lista: " + p.titulo);
            document.dispatchEvent(new CustomEvent("mja:lista", { detail: { id: id, en: en } }));
        } catch (error) {
            aviso("No se pudo actualizar Mi lista. Inténtalo de nuevo.");
        }
    }

    /* ---------- Avisos (toasts) ---------- */

    var temporizadorAviso;

    function aviso(mensaje) {
        var caja = document.getElementById("toast");
        if (!caja) {
            caja = document.createElement("div");
            caja.id = "toast";
            caja.className = "toast";
            caja.setAttribute("role", "status");
            caja.setAttribute("aria-live", "polite");
            document.body.appendChild(caja);
        }
        caja.textContent = mensaje;
        caja.classList.add("visible");
        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(function () { caja.classList.remove("visible"); }, 2600);
    }

    /* ---------- Ficha de película (modal) ---------- */

    function crearModal() {
        var modal = document.getElementById("ficha");
        if (modal) return modal;

        modal = document.createElement("dialog");
        modal.id = "ficha";
        modal.className = "ficha";
        modal.setAttribute("aria-labelledby", "ficha-titulo");
        document.body.appendChild(modal);

        // Cerrar al hacer clic fuera del contenido
        modal.addEventListener("click", function (evento) {
            if (evento.target === modal) modal.close();
        });
        modal.addEventListener("close", function () {
            document.body.classList.remove("modal-abierto");
        });
        return modal;
    }

    function abrirFicha(id) {
        var p = catalogo.get(id);
        if (!p) return;
        var modal = crearModal();
        var rutaGenero = MJA.config.rutas.explorar + "?genero=" + encodeURIComponent(p.genero);

        modal.innerHTML =
            '<div class="ficha-panel">' +
                '<div class="ficha-cabecera tema-fondo" data-tema="' + esc(p.genero) + '">' +
                    '<button class="icon-button ficha-cerrar" type="button" aria-label="Cerrar ficha" data-cerrar>' +
                        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
                    '</button>' +
                    '<div class="ficha-poster">' + poster(p) + '</div>' +
                '</div>' +
                '<div class="ficha-cuerpo">' +
                    '<p class="eyebrow tema-eyebrow" data-tema="' + esc(p.genero) + '">' + esc(nombreGenero(p.genero)).toUpperCase() + '</p>' +
                    '<h2 id="ficha-titulo">' + esc(p.titulo) + '</h2>' +
                    '<ul class="ficha-meta">' +
                        '<li>' + p.anio + '</li>' +
                        '<li>' + duracion(p.duracion) + '</li>' +
                        '<li class="rating">★ ' + p.valoracion.toFixed(1) + '</li>' +
                    '</ul>' +
                    '<p class="ficha-sinopsis">' + esc(p.sinopsis) + '</p>' +
                    '<dl class="ficha-datos">' +
                        '<div><dt>Dirección</dt><dd>' + esc(p.director) + '</dd></div>' +
                        '<div><dt>Reparto</dt><dd>' + esc(p.reparto.join(", ")) + '</dd></div>' +
                    '</dl>' +
                    '<div class="ficha-acciones">' +
                        '<button class="button button-primary" type="button" data-cerrar><span aria-hidden="true">▶</span> Ver ahora</button>' +
                        botonLista(p, true) +
                        '<a class="text-link" href="' + rutaGenero + '">Más de ' + esc(nombreGenero(p.genero)) + ' <span aria-hidden="true">↗</span></a>' +
                    '</div>' +
                '</div>' +
            '</div>';

        modal.querySelectorAll("[data-cerrar]").forEach(function (b) {
            b.addEventListener("click", function () { modal.close(); });
        });

        document.body.classList.add("modal-abierto");
        modal.showModal();
        modal.querySelector(".ficha-cerrar").focus();
    }

    /* ---------- Cabecera común ---------- */

    function iniciarCabecera() {
        var sesion = MJA.api.auth.sesion();
        var etiqueta = document.getElementById("user-name");
        if (etiqueta && sesion && sesion.nombre) etiqueta.textContent = sesion.nombre;

        var salir = document.getElementById("logout-button");
        if (salir) salir.addEventListener("click", function () { MJA.api.auth.logout(); });

        // La cabecera se oscurece al hacer scroll
        var cabecera = document.querySelector(".site-header");
        if (cabecera) {
            var actualizar = function () { cabecera.classList.toggle("con-scroll", window.scrollY > 8); };
            window.addEventListener("scroll", actualizar, { passive: true });
            actualizar();
        }

        // Clics en botones de tarjetas (sirve para todas las páginas)
        document.addEventListener("click", function (evento) {
            var botonLista = evento.target.closest('[data-accion="lista"]');
            if (botonLista) {
                evento.preventDefault();
                alternarLista(Number(botonLista.dataset.id));
                return;
            }
            var botonFicha = evento.target.closest('[data-accion="ficha"]');
            if (botonFicha) {
                evento.preventDefault();
                abrirFicha(Number(botonFicha.dataset.id));
            }
        });

        // Atajo Ctrl / ⌘ + K para ir al buscador
        var buscador = document.querySelector("[data-buscador]");
        var atajo = document.querySelector(".search-shortcut");
        if (atajo) atajo.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";
        if (buscador) {
            document.addEventListener("keydown", function (evento) {
                if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
                    evento.preventDefault();
                    buscador.focus();
                    buscador.select();
                }
            });
        }
    }

    function error(contenedor, mensaje) {
        contenedor.innerHTML = '<div class="empty-state"><h3>Algo ha fallado.</h3><p>' + esc(mensaje) + '</p></div>';
    }

    return {
        temas: temas,
        esc: esc,
        normalizar: normalizar,
        nombreGenero: nombreGenero,
        registrar: registrar,
        crearFondos: crearFondos,
        mostrarFondo: mostrarFondo,
        poster: poster,
        tarjeta: tarjeta,
        botonLista: botonLista,
        esqueletos: esqueletos,
        estaEnLista: function (id) { return idsEnLista.has(id); },
        idsLista: function () { return Array.from(idsEnLista); },
        abrirFicha: abrirFicha,
        aviso: aviso,
        error: error,
        iniciarCabecera: iniciarCabecera
    };
})();
