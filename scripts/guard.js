/* =====================================================
   PÁGINA DE INICIO
   Carrusel principal, géneros, destacadas y mejor
   valoradas.
   ===================================================== */

(async function () {
    var ui = MJA.ui;
    var api = MJA.api;
    var rutas = MJA.config.rutas;

    ui.iniciarCabecera();

    var carrusel = document.getElementById("featured-track");
    var mejores = document.getElementById("top-grid");
    carrusel.innerHTML = ui.esqueletos(5);
    mejores.innerHTML = ui.esqueletos(4);

    var peliculas, generos, ids;
    try {
        var resultados = await Promise.all([api.peliculas.listar(), api.generos.listar(), api.miLista.ids()]);
        peliculas = resultados[0];
        generos = resultados[1];
        ids = resultados[2];
    } catch (error) {
        ui.error(mejores, "No hemos podido cargar el catálogo.");
        carrusel.innerHTML = "";
        return;
    }

    ui.registrar(peliculas, generos, ids);

    /* ---------- Selector de género del buscador ---------- */

    var selectGenero = document.getElementById("home-genre");
    selectGenero.insertAdjacentHTML("beforeend", generos.map(function (g) {
        return '<option value="' + ui.esc(g.slug) + '">' + ui.esc(g.nombre) + '</option>';
    }).join(""));

    /* ---------- Mosaico de géneros (cada uno con su fondo) ---------- */

    document.getElementById("genre-tiles").innerHTML = generos.map(function (g) {
        var total = peliculas.filter(function (p) { return p.genero === g.slug; }).length;
        return '<a class="genre-tile tema-fondo" data-tema="' + ui.esc(g.slug) + '" href="' + rutas.explorar + '?genero=' + encodeURIComponent(g.slug) + '">' +
            '<span class="genre-tile-name">' + ui.esc(g.nombre) + '</span>' +
            '<span class="genre-tile-count">' + total + (total === 1 ? " película" : " películas") + ' <span aria-hidden="true">→</span></span>' +
        '</a>';
    }).join("");

    /* ---------- Destacadas y mejor valoradas ---------- */

    var ordenadas = peliculas.slice().sort(function (a, b) {
        return (b.destacada - a.destacada) || (b.anio - a.anio);
    });
    carrusel.innerHTML = ordenadas.slice(0, 8).map(ui.tarjeta).join("");

    var top = peliculas.slice().sort(function (a, b) { return b.valoracion - a.valoracion; }).slice(0, 4);
    mejores.innerHTML = top.map(ui.tarjeta).join("");

    // Flechas del carrusel
    var anterior = document.getElementById("featured-prev");
    var siguiente = document.getElementById("featured-next");

    function actualizarFlechas() {
        var max = carrusel.scrollWidth - carrusel.clientWidth - 2;
        anterior.disabled = carrusel.scrollLeft <= 2;
        siguiente.disabled = carrusel.scrollLeft >= max;
    }
    function desplazar(direccion) {
        carrusel.scrollBy({ left: direccion * carrusel.clientWidth * 0.85, behavior: "smooth" });
    }
    anterior.addEventListener("click", function () { desplazar(-1); });
    siguiente.addEventListener("click", function () { desplazar(1); });
    carrusel.addEventListener("scroll", actualizarFlechas, { passive: true });
    window.addEventListener("resize", actualizarFlechas);
    actualizarFlechas();

    /* ---------- Carrusel principal (hero) ---------- */

    var heroe = document.getElementById("inicio");
    var fondos = document.getElementById("hero-backdrops");
    var contenido = document.getElementById("hero-slide");
    var posterHeroe = document.getElementById("hero-poster");
    var indice = document.getElementById("hero-index");
    var puntos = document.getElementById("hero-dots");

    var slides = peliculas.filter(function (p) { return p.destacada; }).slice(0, 3);
    if (!slides.length) slides = peliculas.slice(0, 3);

    ui.crearFondos(fondos, slides.map(function (p) { return p.genero; }));
    puntos.innerHTML = slides.map(function (p, i) {
        return '<button type="button" class="hero-dot" data-slide="' + i + '" aria-label="Ver ' + ui.esc(p.titulo) + '"></button>';
    }).join("");

    var actual = 0;
    var temporizador = null;
    var reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function pintarSlide(i) {
        actual = (i + slides.length) % slides.length;
        var p = slides[actual];

        ui.mostrarFondo(fondos, p.genero);
        heroe.dataset.tema = p.genero;

        contenido.classList.remove("entrando");
        posterHeroe.classList.remove("entrando");
        void contenido.offsetWidth;

        contenido.innerHTML =
            '<p class="eyebrow hero-eyebrow"><span class="sparkle" aria-hidden="true">✦</span> ' + ui.esc(ui.nombreGenero(p.genero)).toUpperCase() + ' · ' + p.anio + '</p>' +
            '<h1 id="hero-title">' + ui.esc(p.titulo) + '</h1>' +
            '<p class="hero-description">' + ui.esc(p.sinopsis) + '</p>' +
            '<div class="hero-actions">' +
                '<button class="button button-primary" type="button" data-accion="ficha" data-id="' + p.id + '"><span class="play-icon" aria-hidden="true">▶</span> Ver ficha</button>' +
                ui.botonLista(p, true) +
            '</div>' +
            '<div class="hero-meta"><span class="meta-line"></span> <span class="rating">★ ' + p.valoracion.toFixed(1) + '</span> · DIRIGIDA POR ' + ui.esc(p.director).toUpperCase() + '</div>';

        posterHeroe.innerHTML = '<button class="card-open" type="button" data-accion="ficha" data-id="' + p.id + '" aria-label="Ver ficha de ' + ui.esc(p.titulo) + '">' + ui.poster(p) + '</button>';

        contenido.classList.add("entrando");
        posterHeroe.classList.add("entrando");

        indice.innerHTML = '<span>' + String(actual + 1).padStart(2, "0") + '</span><i></i> ' + String(slides.length).padStart(2, "0");
        puntos.querySelectorAll(".hero-dot").forEach(function (punto, n) {
            punto.setAttribute("aria-current", n === actual ? "true" : "false");
        });
    }

    function iniciarAuto() {
        if (reducirMovimiento || slides.length < 2) return;
        detenerAuto();
        temporizador = setInterval(function () { pintarSlide(actual + 1); }, 7000);
    }
    function detenerAuto() { clearInterval(temporizador); }

    document.getElementById("hero-prev").addEventListener("click", function () { pintarSlide(actual - 1); iniciarAuto(); });
    document.getElementById("hero-next").addEventListener("click", function () { pintarSlide(actual + 1); iniciarAuto(); });
    puntos.addEventListener("click", function (evento) {
        var punto = evento.target.closest(".hero-dot");
        if (punto) { pintarSlide(Number(punto.dataset.slide)); iniciarAuto(); }
    });

    // Pausa mientras el usuario está encima o usando el teclado dentro
    heroe.addEventListener("mouseenter", detenerAuto);
    heroe.addEventListener("mouseleave", iniciarAuto);
    heroe.addEventListener("focusin", detenerAuto);
    heroe.addEventListener("focusout", iniciarAuto);

    pintarSlide(0);
    iniciarAuto();
})();
