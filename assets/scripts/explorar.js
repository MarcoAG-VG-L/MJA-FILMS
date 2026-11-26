/* =====================================================
   PÁGINA EXPLORAR
   Búsqueda, filtros, ordenación, Mi lista y fondo de
   pantalla según el género elegido.
   Los filtros se guardan en la URL (?genero=drama&q=...)
   para poder compartir o recargar la búsqueda.
   ===================================================== */

(async function () {
    var ui = MJA.ui;
    var api = MJA.api;

    ui.iniciarCabecera();

    /* ---------- Elementos ---------- */

    var $ = function (id) { return document.getElementById(id); };
    var cuerpo = document.body;
    var rejilla = $("movie-grid");
    var vacio = $("empty-state");
    var contador = $("result-count");
    var buscador = $("search");
    var selectGenero = $("genre");
    var selectAnio = $("year");
    var selectValoracion = $("min-rating");
    var selectOrden = $("sort");
    var pestanas = $("genre-tabs");
    var botonFiltros = $("more-filters");
    var panelFiltros = $("extra-filters");
    var fondos = $("page-backdrop");

    /* ---------- Estado (lo que el usuario ha elegido) ---------- */

    var parametros = new URLSearchParams(location.search);
    var estado = {
        q: parametros.get("q") || "",
        genero: parametros.get("genero") || "",
        anio: parametros.get("anio") || "",
        min: Number(parametros.get("min")) || 0,
        orden: parametros.get("orden") || "featured",
        lista: parametros.get("lista") === "1"
    };

    var peliculas = [];
    var generos = [];

    rejilla.innerHTML = ui.esqueletos(8);

    try {
        var datos = await Promise.all([api.peliculas.listar(), api.generos.listar(), api.miLista.ids()]);
        peliculas = datos[0];
        generos = datos[1];
        ui.registrar(peliculas, generos, datos[2]);
    } catch (error) {
        ui.error(rejilla, "No hemos podido cargar el catálogo. Revisa tu conexión.");
        return;
    }

    if (!generos.some(function (g) { return g.slug === estado.genero; })) estado.genero = "";

    /* ---------- Construir controles a partir de los géneros ---------- */

    ui.crearFondos(fondos, ["todas"].concat(generos.map(function (g) { return g.slug; })));

    selectGenero.insertAdjacentHTML("beforeend", generos.map(function (g) {
        return '<option value="' + ui.esc(g.slug) + '">' + ui.esc(g.nombre) + '</option>';
    }).join(""));

    pestanas.innerHTML =
        '<button class="genre-tab" type="button" data-genero="" data-tema="todas">Todas</button>' +
        generos.map(function (g) {
            return '<button class="genre-tab" type="button" data-genero="' + ui.esc(g.slug) + '" data-tema="' + ui.esc(g.slug) + '">' +
                '<span class="tab-dot" aria-hidden="true"></span>' + ui.esc(g.nombre) +
            '</button>';
        }).join("");

    /* ---------- Filtrar y ordenar ---------- */

    function enRango(anio, rango) {
        switch (rango) {
            case "2020-2026": return anio >= 2020;
            case "2010-2019": return anio >= 2010 && anio <= 2019;
            case "2000-2009": return anio >= 2000 && anio <= 2009;
            case "antes-2000": return anio < 2000;
            default: return true;
        }
    }

    function filtrar() {
        var texto = ui.normalizar(estado.q.trim());
        var lista = new Set(ui.idsLista());

        var resultado = peliculas.filter(function (p) {
            if (estado.lista && !lista.has(p.id)) return false;
            if (estado.genero && p.genero !== estado.genero) return false;
            if (!enRango(p.anio, estado.anio)) return false;
            if (p.valoracion < estado.min) return false;
            if (texto) {
                var donde = ui.normalizar([p.titulo, p.director, p.reparto.join(" "), ui.nombreGenero(p.genero)].join(" "));
                if (donde.indexOf(texto) === -1) return false;
            }
            return true;
        });

        var orden = {
            featured: function (a, b) { return (b.destacada - a.destacada) || (b.valoracion - a.valoracion); },
            rating: function (a, b) { return b.valoracion - a.valoracion; },
            recent: function (a, b) { return b.anio - a.anio; },
            title: function (a, b) { return a.titulo.localeCompare(b.titulo, "es"); }
        };
        return resultado.sort(orden[estado.orden] || orden.featured);
    }

    /* ---------- Pintar la página ---------- */

    function hayFiltros() {
        return Boolean(estado.q || estado.genero || estado.anio || estado.min);
    }

    function pintar() {
        var resultado = filtrar();
        var tema = estado.genero || (estado.lista ? "lista" : "todas");
        var textos = ui.temas[tema] || ui.temas.todas;

        // Fondo de pantalla y color del género
        cuerpo.dataset.tema = estado.genero || "todas";
        ui.mostrarFondo(fondos, estado.genero || "todas");

        // Textos de cabecera
        $("explore-eyebrow").textContent = textos.eyebrow;
        $("explore-title").innerHTML = textos.titulo;
        $("explore-description").textContent = textos.texto;
        $("breadcrumb-current").textContent = estado.lista ? "Mi lista" : (estado.genero ? ui.nombreGenero(estado.genero) : "Explorar");
        $("catalog-title").textContent = estado.lista
            ? (estado.genero ? "Mi lista · " + ui.nombreGenero(estado.genero) : "Mi lista")
            : (estado.genero ? ui.nombreGenero(estado.genero) : "Todas las películas");
        document.title = (estado.lista ? "Mi lista" : estado.genero ? ui.nombreGenero(estado.genero) : "Explorar") + " | MJA FILMS";

        // Navegación activa
        $("nav-explore").classList.toggle("active", !estado.lista);
        $("nav-list").classList.toggle("active", estado.lista);
        if (estado.lista) { $("nav-list").setAttribute("aria-current", "page"); $("nav-explore").removeAttribute("aria-current"); }
        else { $("nav-explore").setAttribute("aria-current", "page"); $("nav-list").removeAttribute("aria-current"); }

        // Controles sincronizados con el estado
        if (document.activeElement !== buscador) buscador.value = estado.q;
        selectGenero.value = estado.genero;
        selectAnio.value = estado.anio;
        selectValoracion.value = String(estado.min);
        selectOrden.value = estado.orden;
        pestanas.querySelectorAll(".genre-tab").forEach(function (tab) {
            var activa = tab.dataset.genero === estado.genero;
            tab.classList.toggle("active", activa);
            tab.setAttribute("aria-pressed", String(activa));
        });

        var extras = (estado.anio ? 1 : 0) + (estado.min ? 1 : 0);
        $("filters-badge").textContent = extras;
        $("filters-badge").hidden = extras === 0;

        // Resultados
        contador.textContent = resultado.length === 1 ? "1 película" : resultado.length + " películas";
        rejilla.innerHTML = resultado.map(ui.tarjeta).join("");
        rejilla.hidden = resultado.length === 0;
        vacio.hidden = resultado.length > 0;

        if (resultado.length === 0) {
            var listaVacia = estado.lista && !hayFiltros();
            $("empty-title").textContent = listaVacia ? "Tu lista está vacía." : "No encontramos películas.";
            $("empty-copy").textContent = listaVacia
                ? "Pulsa el botón + de cualquier película para guardarla aquí."
                : "Prueba con otros filtros o una búsqueda diferente.";
            $("empty-reset").hidden = listaVacia;
            $("empty-explore").hidden = !listaVacia;
        }

        guardarEnUrl();
    }

    function guardarEnUrl() {
        var p = new URLSearchParams();
        if (estado.lista) p.set("lista", "1");
        if (estado.genero) p.set("genero", estado.genero);
        if (estado.q) p.set("q", estado.q);
        if (estado.anio) p.set("anio", estado.anio);
        if (estado.min) p.set("min", estado.min);
        if (estado.orden !== "featured") p.set("orden", estado.orden);
        var consulta = p.toString();
        history.replaceState(null, "", location.pathname + (consulta ? "?" + consulta : ""));
    }

    function limpiar() {
        estado.q = "";
        estado.genero = "";
        estado.anio = "";
        estado.min = 0;
        estado.orden = "featured";
        pintar();
        buscador.focus();
    }

    /* ---------- Eventos ---------- */

    var espera;
    buscador.addEventListener("input", function () {
        clearTimeout(espera);
        espera = setTimeout(function () { estado.q = buscador.value; pintar(); }, 180);
    });
    buscador.closest("form").addEventListener("submit", function (evento) {
        evento.preventDefault();
        estado.q = buscador.value;
        pintar();
    });

    selectGenero.addEventListener("change", function () { estado.genero = selectGenero.value; pintar(); });
    selectAnio.addEventListener("change", function () { estado.anio = selectAnio.value; pintar(); });
    selectValoracion.addEventListener("change", function () { estado.min = Number(selectValoracion.value); pintar(); });
    selectOrden.addEventListener("change", function () { estado.orden = selectOrden.value; pintar(); });

    pestanas.addEventListener("click", function (evento) {
        var tab = evento.target.closest(".genre-tab");
        if (!tab) return;
        estado.genero = tab.dataset.genero;
        pintar();
    });

    botonFiltros.addEventListener("click", function () {
        var abrir = panelFiltros.hidden;
        panelFiltros.hidden = !abrir;
        botonFiltros.setAttribute("aria-expanded", String(abrir));
    });
    if (estado.anio || estado.min) {
        panelFiltros.hidden = false;
        botonFiltros.setAttribute("aria-expanded", "true");
    }

    $("reset-filters").addEventListener("click", limpiar);
    $("empty-reset").addEventListener("click", limpiar);

    // Cambiar entre Explorar y Mi lista sin recargar
    $("nav-list").addEventListener("click", function (evento) {
        evento.preventDefault();
        estado.lista = true;
        pintar();
    });
    $("nav-explore").addEventListener("click", function (evento) {
        evento.preventDefault();
        estado.lista = false;
        pintar();
    });
    $("empty-explore").addEventListener("click", function (evento) {
        evento.preventDefault();
        estado.lista = false;
        limpiar();
    });

    // Si quitas algo de Mi lista mientras la estás viendo, desaparece
    document.addEventListener("mja:lista", function () {
        if (estado.lista) pintar();
    });

    pintar();
})();
