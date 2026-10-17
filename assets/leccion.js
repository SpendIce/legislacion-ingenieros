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
 */
(function () {
  "use strict";

  var estado = { recuerdo: {}, quiz: {}, casos: {}, ordenar: null };

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
      var caja = el("textarea", { placeholder: "Escribilo de memoria, sin mirar arriba. El esfuerzo de recordar es lo que fija.", "aria-label": "Tu respuesta" });
      var modelo = el("div", { class: "modelo", hidden: "" });
      modelo.innerHTML = "<span class='rotulo'>Respuesta modelo</span>" + it.r;
      var auto = el("div", { class: "autoeval", hidden: "" });
      [["la-tenia", "La tenía"], ["a-medias", "A medias"], ["no-la-tenia", "No la tenía"]].forEach(function (par) {
        auto.appendChild(el("button", {
          text: par[1],
          onclick: function (ev) {
            estado.recuerdo[i] = par[0];
            Array.prototype.forEach.call(auto.querySelectorAll("button"), function (b) { b.classList.remove("elegido"); });
            ev.target.classList.add("elegido");
            actualizarResultado();
          }
        }));
      });
      var ver = el("button", {
        class: "primario", text: "Comparar con la respuesta modelo",
        onclick: function () { modelo.hidden = false; auto.hidden = false; ver.disabled = true; }
      });
      cont.appendChild(el("section", { class: "ejercicio" }, [
        encabezado(i + 1, items.length, "Evocación"),
        el("p", { class: "consigna", html: it.p }),
        caja, ver, modelo, auto
      ]));
    });
  }

  /* ---------- Ordenar etapas ---------- */
  function montarOrdenar(cont, datos) {
    var orden = mezclar(datos.pasos);
    var lista = el("ol", { class: "lista-ordenar" });
    var dev = el("div", { class: "devolucion", hidden: "" });

    function pintar() {
      lista.innerHTML = "";
      orden.forEach(function (paso, i) {
        lista.appendChild(el("li", {}, [
          el("span", { text: paso }),
          el("button", { text: "↑", "aria-label": "Subir", onclick: function () { mover(i, -1); } }),
          el("button", { text: "↓", "aria-label": "Bajar", onclick: function () { mover(i, 1); } })
        ]));
      });
    }
    function mover(i, d) {
      var j = i + d;
      if (j < 0 || j >= orden.length) return;
      var t = orden[i]; orden[i] = orden[j]; orden[j] = t;
      pintar();
    }
    function corregir() {
      var bien = 0;
      Array.prototype.forEach.call(lista.children, function (li, i) {
        var ok = orden[i] === datos.pasos[i];
        if (ok) bien++;
        li.classList.add(ok ? "en-su-lugar" : "fuera-de-lugar");
      });
      estado.ordenar = bien + "/" + datos.pasos.length;
      dev.hidden = false;
      dev.className = "devolucion " + (bien === datos.pasos.length ? "bien" : "mal");
      dev.innerHTML = "<span class='veredicto'>" + bien + " de " + datos.pasos.length + " en su lugar.</span> " +
        (bien === datos.pasos.length ? "Secuencia completa." : "Los marcados en rojo están fuera de lugar: movelos y volvé a corregir.") +
        (datos.fuente ? " <span class='cita'>" + datos.fuente + "</span>" : "");
      actualizarResultado();
    }

    pintar();
    cont.appendChild(el("section", { class: "ejercicio" }, [
      el("div", { class: "num-ej", text: "Secuencia" }),
      el("p", { class: "consigna", html: datos.consigna }),
      lista,
      el("button", { class: "primario", text: "Corregir orden", onclick: corregir }),
      dev
    ]));
  }

  /* ---------- Opción múltiple ---------- */
  function montarQuiz(cont, preguntas) {
    preguntas.forEach(function (q, i) {
      var dev = el("div", { class: "devolucion", hidden: "" });
      var grupo = el("div", { class: "opciones" });
      var correcta = q.o[q.c];
      mezclar(q.o).forEach(function (texto) {
        grupo.appendChild(el("button", {
          text: texto,
          onclick: function (ev) {
            if (estado.quiz[i] !== undefined) return;
            var acerto = texto === correcta;
            estado.quiz[i] = acerto;
            Array.prototype.forEach.call(grupo.children, function (b) {
              b.disabled = true;
              if (b.textContent === correcta) b.classList.add("correcta");
            });
            if (!acerto) ev.target.classList.add("incorrecta");
            dev.hidden = false;
            dev.className = "devolucion " + (acerto ? "bien" : "mal");
            dev.innerHTML = "<span class='veredicto'>" + (acerto ? "Correcto." : "No. La respuesta es «" + correcta + "».") + "</span> " + q.e;
            actualizarResultado();
          }
        }));
      });
      cont.appendChild(el("section", { class: "ejercicio" }, [
        encabezado(i + 1, preguntas.length, "Pregunta"),
        el("p", { class: "consigna", html: q.p }),
        grupo, dev
      ]));
    });
  }

  /* ---------- Casos prácticos ---------- */
  function montarCasos(cont, casos) {
    casos.forEach(function (caso, i) {
      var guia = el("div", { class: "modelo guia", hidden: "" });
      guia.appendChild(el("span", { class: "rotulo", text: "Guía de corrección — tildá lo que tu respuesta ya decía" }));
      caso.guia.forEach(function (punto) {
        var check = el("input", { type: "checkbox" });
        check.addEventListener("change", function () {
          estado.casos[i] = guia.querySelectorAll("input:checked").length + "/" + caso.guia.length;
          actualizarResultado();
        });
        var etiqueta = el("label", {}, [check]);
        etiqueta.appendChild(el("span", { html: punto }));
        guia.appendChild(etiqueta);
      });
      var ver = el("button", {
        class: "primario", text: "Ver guía de corrección",
        onclick: function () {
          guia.hidden = false; ver.disabled = true;
          estado.casos[i] = "0/" + caso.guia.length;
          actualizarResultado();
        }
      });
      cont.appendChild(el("section", { class: "ejercicio" }, [
        encabezado(i + 1, casos.length, "Caso"),
        el("h3", { text: caso.titulo }),
        el("p", { class: "consigna", html: caso.enunciado }),
        el("textarea", { placeholder: "Resolvelo como en el parcial: identificá la figura, fundamentá y concluí.", style: "min-height: 9rem", "aria-label": "Tu resolución" }),
        ver, guia
      ]));
    });
  }

  /* ---------- Resultado ---------- */
  function actualizarResultado() {
    var cont = document.getElementById("resultado");
    var L = window.LECCION;
    if (!cont || !L) return;

    var total = (L.quiz || []).length;
    var respondidas = Object.keys(estado.quiz).length;
    var aciertos = Object.keys(estado.quiz).filter(function (k) { return estado.quiz[k]; }).length;
    var falladas = Object.keys(estado.quiz).filter(function (k) { return !estado.quiz[k]; })
      .map(function (k) { return "  - " + L.quiz[k].p.replace(/<[^>]+>/g, ""); });

    var lineas = ["Lección " + L.id + " — " + L.titulo];
    if (total) lineas.push("Opción múltiple: " + aciertos + "/" + total + " (respondidas " + respondidas + ")");
    if (falladas.length) lineas.push("Fallé:\n" + falladas.join("\n"));
    if (estado.ordenar) lineas.push("Secuencia: " + estado.ordenar + " en su lugar");
    var rec = Object.keys(estado.recuerdo).map(function (k) { return (Number(k) + 1) + "=" + estado.recuerdo[k]; });
    if (rec.length) lineas.push("Evocación: " + rec.join(", "));
    var cas = Object.keys(estado.casos).map(function (k) { return (Number(k) + 1) + "=" + estado.casos[k]; });
    if (cas.length) lineas.push("Casos (puntos de la guía cubiertos): " + cas.join(", "));

    cont.innerHTML = "";
    cont.appendChild(el("span", { class: "rotulo", text: "Tu resultado" }));
    if (total) cont.appendChild(el("div", { class: "puntaje", text: aciertos + " / " + total }));
    cont.appendChild(el("p", { html: "Pegale este resumen a tu docente (Claude) en la terminal: con eso registra qué ya sabés y decide qué repasar en la próxima sesión." }));
    var area = el("textarea", { readonly: "", "aria-label": "Resumen del resultado" });
    area.value = lineas.join("\n");
    cont.appendChild(area);
    cont.appendChild(el("button", {
      text: "Copiar resumen",
      onclick: function (ev) {
        area.select();
        var listo = function () { ev.target.textContent = "Copiado"; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(area.value).then(listo, function () { document.execCommand("copy"); listo(); });
        else { document.execCommand("copy"); listo(); }
      }
    }));
  }

  document.addEventListener("DOMContentLoaded", function () {
    var L = window.LECCION;
    if (!L) return;
    var partes = [
      ["recuerdo", montarRecuerdo], ["ordenar", montarOrdenar],
      ["quiz", montarQuiz], ["casos", montarCasos]
    ];
    partes.forEach(function (par) {
      var cont = document.getElementById(par[0]);
      if (cont && L[par[0]]) par[1](cont, L[par[0]]);
    });
    actualizarResultado();
  });
})();
