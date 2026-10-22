/* Componentes de práctica reutilizables — Legislación para Ingenieros.
 *
 * Uso: la lección define window.LECCION (ver lessons/datos/*.js) y coloca
 * contenedores vacíos con estos ids; cada uno es opcional:
 *
 *   <div id="recuerdo"></div>   evocación libre: escribir de memoria, comparar, autoevaluarse
 *   <div id="ordenar"></div>    ordenar etapas de un procedimiento
 *   <div id="quiz"></div>       opción múltiple con devolución inmediata
 *   <div id="casos"></div>      caso práctico con guía de corrección
 *   <div id="resultado"></div>  resumen para pegarle al docente (el agente)
 *
 * Forma de LECCION:
 *   { id, titulo,
 *     recuerdo: [{ p, r }],
 *     ordenar:  { consigna, pasos: [..en el orden correcto..], fuente },
 *     quiz:     [{ p, o: [4 opciones], c: índiceCorrecto, e: explicación }],
 *     casos:    [{ titulo, enunciado, guia: [puntos esperados] }] }
 *
 * Las respuestas se guardan en localStorage (clave "li-leccion-<id>") para que
 * no se pierdan al navegar; si el almacenamiento no está disponible, la página
 * funciona igual, solo que sin recordar.
 */
(function () {
  "use strict";

  /* Las claves son el texto de cada consigna (no su posición), para que agregar
   * o reordenar ejercicios no pegue respuestas viejas a preguntas nuevas.
   * recuerdo: { consigna: { txt, auto, visto } }
   * quiz:     { consigna: opciónElegida }
   * casos:    { título: { txt, visto, marcados: [índices] } }
   * ordenar:  { orden: [...], corregido } */
  var estado = { recuerdo: {}, quiz: {}, casos: {}, ordenar: null };

  function clave() { return "li-leccion-" + window.LECCION.id; }

  function guardar() {
    try { localStorage.setItem(clave(), JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ }
  }

  function cargar() {
    try {
      var g = JSON.parse(localStorage.getItem(clave()) || "null");
      if (g && typeof g === "object") {
        estado.recuerdo = g.recuerdo || {};
        estado.quiz = g.quiz || {};
        estado.casos = g.casos || {};
        estado.ordenar = g.ordenar || null;
      }
    } catch (e) { /* sin almacenamiento o dato corrupto: se empieza de cero */ }
  }

  function borrar() {
    try { localStorage.removeItem(clave()); } catch (e) { /* nada que borrar */ }
    location.reload();
  }

  function cambio() { guardar(); actualizarResultado(); }

  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "onclick") n.addEventListener("click", attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { if (h) n.appendChild(h); });
    return n;
  }

  function texto(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent.replace(/\s+/g, " ").trim();
  }

  function mezclar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function encabezado(n, total, rotulo) {
    return el("div", { class: "num-ej", text: rotulo + " " + n + " de " + total });
  }

  /* ---------- Evocación libre ---------- */
  function montarRecuerdo(cont, items) {
    items.forEach(function (it, i) {
      var k = texto(it.p);
      var r = estado.recuerdo[k] || (estado.recuerdo[k] = { txt: "", auto: null, visto: false });
      var caja = el("textarea", { placeholder: "Escribilo de memoria, sin mirar arriba. El esfuerzo de recordar es lo que fija.", "aria-label": "Tu respuesta" });
      caja.value = r.txt;
      caja.addEventListener("input", function () { r.txt = caja.value; cambio(); });
      var modelo = el("div", { class: "modelo", hidden: "" });
      modelo.innerHTML = "<span class='rotulo'>Respuesta modelo</span>" + it.r;
      var auto = el("div", { class: "autoeval", hidden: "" });
      [["la-tenia", "La tenía"], ["a-medias", "A medias"], ["no-la-tenia", "No la tenía"]].forEach(function (par) {
        var b = el("button", {
          text: par[1],
          onclick: function () {
            r.auto = par[0];
            Array.prototype.forEach.call(auto.querySelectorAll("button"), function (x) { x.classList.remove("elegido"); });
            b.classList.add("elegido");
            cambio();
          }
        });
        if (r.auto === par[0]) b.classList.add("elegido");
        auto.appendChild(b);
      });
      var ver = el("button", {
        class: "primario", text: "Comparar con la respuesta modelo",
        onclick: function () { mostrar(); r.visto = true; cambio(); }
      });
      function mostrar() { modelo.hidden = false; auto.hidden = false; ver.disabled = true; }
      if (r.visto) mostrar();
      cont.appendChild(el("section", { class: "ejercicio" }, [
        encabezado(i + 1, items.length, "Evocación"),
        el("p", { class: "consigna", html: it.p }),
        caja, ver, modelo, auto
      ]));
    });
  }

  /* ---------- Ordenar etapas ---------- */
  function montarOrdenar(cont, datos) {
    var guardado = estado.ordenar;
    var valido = guardado && guardado.orden && guardado.orden.length === datos.pasos.length &&
      guardado.orden.every(function (p) { return datos.pasos.indexOf(p) !== -1; });
    if (!valido) estado.ordenar = { orden: mezclar(datos.pasos), corregido: false };
    var o = estado.ordenar;
    var lista = el("ol", { class: "lista-ordenar" });
    var dev = el("div", { class: "devolucion", hidden: "" });

    function pintar() {
      lista.innerHTML = "";
      o.orden.forEach(function (paso, i) {
        lista.appendChild(el("li", {}, [
          el("span", { text: paso }),
          el("button", { text: "↑", "aria-label": "Subir", onclick: function () { mover(i, -1); } }),
          el("button", { text: "↓", "aria-label": "Bajar", onclick: function () { mover(i, 1); } })
        ]));
      });
    }
    function mover(i, d) {
      var j = i + d;
      if (j < 0 || j >= o.orden.length) return;
      var t = o.orden[i]; o.orden[i] = o.orden[j]; o.orden[j] = t;
      pintar();
      guardar();
    }
    function corregir() {
      var bien = 0;
      Array.prototype.forEach.call(lista.children, function (li, i) {
        var ok = o.orden[i] === datos.pasos[i];
        if (ok) bien++;
        li.classList.add(ok ? "en-su-lugar" : "fuera-de-lugar");
      });
      o.corregido = true;
      dev.hidden = false;
      dev.className = "devolucion " + (bien === datos.pasos.length ? "bien" : "mal");
      dev.innerHTML = "<span class='veredicto'>" + bien + " de " + datos.pasos.length + " en su lugar.</span> " +
        (bien === datos.pasos.length ? "Secuencia completa." : "Los marcados en rojo están fuera de lugar: movelos y volvé a corregir.") +
        (datos.fuente ? " <span class='cita'>" + datos.fuente + "</span>" : "");
      cambio();
    }

    pintar();
    cont.appendChild(el("section", { class: "ejercicio" }, [
      el("div", { class: "num-ej", text: "Secuencia" }),
      el("p", { class: "consigna", html: datos.consigna }),
      lista,
      el("button", { class: "primario", text: "Corregir orden", onclick: corregir }),
      dev
    ]));
    if (o.corregido) corregir();
  }

  /* ---------- Opción múltiple ---------- */
  function montarQuiz(cont, preguntas) {
    preguntas.forEach(function (q, i) {
      var dev = el("div", { class: "devolucion", hidden: "" });
      var grupo = el("div", { class: "opciones" });
      var correcta = q.o[q.c];
      var k = texto(q.p);

      function responder(elegida, boton) {
        var acerto = elegida === correcta;
        Array.prototype.forEach.call(grupo.children, function (b) {
          b.disabled = true;
          if (b.textContent === correcta) b.classList.add("correcta");
        });
        if (!acerto && boton) boton.classList.add("incorrecta");
        dev.hidden = false;
        dev.className = "devolucion " + (acerto ? "bien" : "mal");
        dev.innerHTML = "<span class='veredicto'>" + (acerto ? "Correcto." : "No. La respuesta es «" + correcta + "».") + "</span> " + q.e;
      }

      mezclar(q.o).forEach(function (op) {
        grupo.appendChild(el("button", {
          text: op,
          onclick: function (ev) {
            if (estado.quiz[k] !== undefined) return;
            estado.quiz[k] = op;
            responder(op, ev.target);
            cambio();
          }
        }));
      });
      cont.appendChild(el("section", { class: "ejercicio" }, [
        encabezado(i + 1, preguntas.length, "Pregunta"),
        el("p", { class: "consigna", html: q.p }),
        grupo, dev
      ]));

      if (estado.quiz[k] !== undefined) {
        if (q.o.indexOf(estado.quiz[k]) === -1) { delete estado.quiz[k]; return; }
        var previo = Array.prototype.filter.call(grupo.children, function (b) { return b.textContent === estado.quiz[k]; })[0];
        responder(estado.quiz[k], previo);
      }
    });
  }

  /* ---------- Casos prácticos ---------- */
  function montarCasos(cont, casos) {
    casos.forEach(function (caso, i) {
      var c = estado.casos[caso.titulo] || (estado.casos[caso.titulo] = { txt: "", visto: false, marcados: [] });
      c.marcados = c.marcados.filter(function (j) { return j < caso.guia.length; });
      var guia = el("div", { class: "modelo guia", hidden: "" });
      guia.appendChild(el("span", { class: "rotulo", text: "Guía de corrección — tildá lo que tu respuesta ya decía" }));
      caso.guia.forEach(function (punto, j) {
        var check = el("input", { type: "checkbox" });
        check.checked = c.marcados.indexOf(j) !== -1;
        check.addEventListener("change", function () {
          c.marcados = c.marcados.filter(function (k) { return k !== j; });
          if (check.checked) c.marcados.push(j);
          c.marcados.sort(function (a, b) { return a - b; });
          cambio();
        });
        var etiqueta = el("label", {}, [check]);
        etiqueta.appendChild(el("span", { html: punto }));
        guia.appendChild(etiqueta);
      });
      var resolucion = el("textarea", { placeholder: "Resolvelo como en el parcial: identificá la figura, fundamentá y concluí.", style: "min-height: 9rem", "aria-label": "Tu resolución" });
      resolucion.value = c.txt;
      resolucion.addEventListener("input", function () { c.txt = resolucion.value; cambio(); });
      var ver = el("button", {
        class: "primario", text: "Ver guía de corrección",
        onclick: function () { mostrar(); c.visto = true; cambio(); }
      });
      function mostrar() { guia.hidden = false; ver.disabled = true; }
      if (c.visto) mostrar();
      cont.appendChild(el("section", { class: "ejercicio" }, [
        encabezado(i + 1, casos.length, "Caso"),
        el("h3", { text: caso.titulo }),
        el("p", { class: "consigna", html: caso.enunciado }),
        resolucion, ver, guia
      ]));
    });
  }

  /* ---------- Resultado ---------- */
  var ROTULO_AUTO = { "la-tenia": "la tenía", "a-medias": "a medias", "no-la-tenia": "no la tenía" };

  function bloqueTexto(t) {
    var limpio = (t || "").trim();
    return limpio ? limpio.split("\n").map(function (l) { return "> " + l; }).join("\n") : "> (sin respuesta)";
  }

  function aciertosQuiz(quiz) {
    return quiz.filter(function (q) { return estado.quiz[texto(q.p)] === q.o[q.c]; }).length;
  }

  function informe(L) {
    var lineas = ["# Lección " + L.id + " — " + L.titulo];
    var resumen = [];

    var quiz = L.quiz || [];
    var respondidas = quiz.filter(function (q) { return estado.quiz[texto(q.p)] !== undefined; }).length;
    if (quiz.length) resumen.push("Opción múltiple: " + aciertosQuiz(quiz) + "/" + quiz.length + " (respondidas " + respondidas + ")");

    var rec = L.recuerdo || [];
    var autos = rec.map(function (it, i) { var r = estado.recuerdo[texto(it.p)]; return r && r.auto ? (i + 1) + "=" + r.auto : null; }).filter(Boolean);
    if (autos.length) resumen.push("Evocación (autoevaluación): " + autos.join(", "));

    var cas = (L.casos || []).map(function (caso, i) {
      var c = estado.casos[caso.titulo];
      return c && c.visto ? (i + 1) + "=" + c.marcados.length + "/" + caso.guia.length : null;
    }).filter(Boolean);
    if (cas.length) resumen.push("Casos (puntos de la guía tildados): " + cas.join(", "));

    if (L.ordenar && estado.ordenar && estado.ordenar.corregido) {
      var bien = estado.ordenar.orden.filter(function (p, i) { return p === L.ordenar.pasos[i]; }).length;
      resumen.push("Secuencia: " + bien + "/" + L.ordenar.pasos.length + " en su lugar");
    }
    lineas.push(resumen.join("\n"));

    if (rec.length) {
      lineas.push("## Evocación");
      rec.forEach(function (it, i) {
        var r = estado.recuerdo[texto(it.p)] || {};
        lineas.push((i + 1) + ". " + texto(it.p) + "\n" + bloqueTexto(r.txt) +
          "\nAutoevaluación: " + (r.auto ? ROTULO_AUTO[r.auto] : (r.visto ? "sin marcar" : "no comparé con el modelo")));
      });
    }

    if (quiz.length) {
      var sinResponder = [];
      var hechas = quiz.map(function (q, i) {
        var elegida = estado.quiz[texto(q.p)];
        var correcta = q.o[q.c];
        if (elegida === undefined) { sinResponder.push(i + 1); return null; }
        if (elegida === correcta) return (i + 1) + ". ✓ «" + elegida + "» — " + texto(q.p);
        return (i + 1) + ". ✗ elegí «" + elegida + "», era «" + correcta + "» — " + texto(q.p);
      }).filter(Boolean);
      if (sinResponder.length) hechas.push("Sin responder: " + sinResponder.join(", "));
      lineas.push("## Opción múltiple\n" + hechas.join("\n"));
    }

    if (L.ordenar && estado.ordenar) {
      lineas.push("## Secuencia\n" + estado.ordenar.orden.map(function (p, i) {
        var marca = estado.ordenar.corregido ? (p === L.ordenar.pasos[i] ? "✓ " : "✗ ") : "";
        return (i + 1) + ". " + marca + p;
      }).join("\n"));
    }

    (L.casos || []).forEach(function (caso, i) {
      var c = estado.casos[caso.titulo] || { txt: "", visto: false, marcados: [] };
      var partes = ["## Caso " + (i + 1) + ": " + caso.titulo, bloqueTexto(c.txt)];
      if (!c.visto) partes.push("Guía: no la abrí todavía.");
      else {
        partes.push("Guía: tildé " + (c.marcados.length ? c.marcados.map(function (j) { return j + 1; }).join(", ") : "ninguno") + ".");
        var faltan = caso.guia.map(function (g, j) { return c.marcados.indexOf(j) === -1 ? "  - " + (j + 1) + ". " + texto(g) : null; }).filter(Boolean);
        if (faltan.length) partes.push("No tildé:\n" + faltan.join("\n"));
      }
      lineas.push(partes.join("\n"));
    });

    return lineas.join("\n\n");
  }

  function actualizarResultado() {
    var cont = document.getElementById("resultado");
    var L = window.LECCION;
    if (!cont || !L) return;

    var quiz = L.quiz || [];
    var aciertos = aciertosQuiz(quiz);

    cont.innerHTML = "";
    cont.appendChild(el("span", { class: "rotulo", text: "Tu resultado" }));
    if (quiz.length) cont.appendChild(el("div", { class: "puntaje", text: aciertos + " / " + quiz.length }));
    cont.appendChild(el("p", { html: "Pegale este informe a tu docente (Claude) en la terminal. Lleva lo que escribiste en cada ejercicio, así puede corregirlo además de tu autoevaluación. Tus respuestas quedan guardadas en este navegador aunque cambies de lección." }));
    var area = el("textarea", { readonly: "", "aria-label": "Informe del resultado" });
    area.value = informe(L);
    cont.appendChild(area);
    var copiar = el("button", {
      text: "Copiar informe",
      onclick: function () {
        area.select();
        var listo = function () { copiar.textContent = "Copiado"; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(area.value).then(listo, function () { document.execCommand("copy"); listo(); });
        else { document.execCommand("copy"); listo(); }
      }
    });
    cont.appendChild(copiar);
    var reiniciar = el("button", {
      text: "Borrar mis respuestas",
      onclick: function () {
        if (reiniciar.getAttribute("data-confirmar")) return borrar();
        reiniciar.setAttribute("data-confirmar", "1");
        reiniciar.textContent = "Tocá de nuevo para borrar todo";
      }
    });
    cont.appendChild(reiniciar);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var L = window.LECCION;
    if (!L) return;
    cargar();
    var partes = [
      ["recuerdo", montarRecuerdo], ["ordenar", montarOrdenar],
      ["quiz", montarQuiz], ["casos", montarCasos]
    ];
    partes.forEach(function (par) {
      var cont = document.getElementById(par[0]);
      if (cont && L[par[0]]) par[1](cont, L[par[0]]);
    });
    guardar();
    actualizarResultado();
  });
})();
