window.LECCION = {
  id: "0005",
  titulo: "Responsabilidad civil: los cuatro presupuestos",
  recuerdo: [
    {
      p: "Enumerá los cuatro presupuestos de la responsabilidad civil y decí en una línea qué es cada uno.",
      r: "1) <strong>Acto ilícito / antijuridicidad:</strong> acción u omisión que causa un daño y no está justificada. 2) <strong>Daño</strong> cierto: patrimonial (daño emergente y lucro cesante) o extrapatrimonial. 3) <strong>Factor de atribución:</strong> la razón por la cual se le asigna el daño a alguien; subjetivo (culpa o dolo) u objetivo (riesgo). 4) <strong>Relación causal:</strong> el daño debe ser consecuencia de esa acción u omisión."
    },
    {
      p: "¿En qué se diferencia una condena civil de una condena penal?",
      r: "La civil tiene naturaleza <strong>resarcitoria</strong>: busca reparar el daño causado a la víctima. La penal tiene naturaleza <strong>punitoria</strong>: castiga al autor con una sanción (multa, prisión, reclusión, inhabilitación) y exige que la conducta esté <strong>tipificada</strong>. Un mismo hecho puede generar ambas."
    },
    {
      p: "¿Quién debe probar qué, según el factor de atribución sea subjetivo u objetivo?",
      r: "<strong>Subjetivo:</strong> la regla es que el damnificado debe probar la culpa del autor (aunque el juez puede distribuir la carga). <strong>Objetivo:</strong> el damnificado no necesita probar culpa; el responsable solo se libera probando la <strong>ruptura del nexo causal</strong>: caso fortuito, hecho de un tercero por quien no debe responder, o hecho de la propia víctima."
    },
    {
      p: "¿Cuáles son los «rostros» del obrar culposo? Definí cada uno.",
      r: "<strong>Negligencia:</strong> hacer menos de lo que se debía. <strong>Imprudencia:</strong> hacer más de lo que se debía. <strong>Impericia:</strong> falta de conocimiento o destreza en el arte o profesión. En los tres falta la malicia: no hay intención de dañar."
    }
  ],
  quiz: [
    {
      p: "¿Qué naturaleza tiene la condena <em>civil</em> por daños?",
      o: ["Resarcitoria", "Punitoria", "Tributaria", "Disciplinaria"],
      c: 0,
      e: "Civil = resarcitoria (repara a la víctima). Penal = punitoria (castiga al autor)."
    },
    {
      p: "Un técnico omite un control que el protocolo exigía y se produce un daño. Hizo <em>menos</em> de lo que debía. Eso es…",
      o: ["Negligencia", "Imprudencia", "Impericia", "Dolo"],
      c: 0,
      e: "Negligencia = hacer menos de lo debido. Imprudencia = hacer de más. Las dos son formas de culpa."
    },
    {
      p: "Alguien no quiere dañar, pero se representa que el daño puede ocurrir y sigue adelante igual. Hay…",
      o: ["Dolo eventual", "Dolo directo", "Culpa leve", "Caso fortuito"],
      c: 0,
      e: "Dolo indirecto o eventual: no hay intención de dañar, pero el sujeto se representó el resultado dañoso y continuó con su accionar."
    },
    {
      p: "Una máquina industrial lesiona a un tercero aunque su dueño fue perfectamente diligente. El dueño responde por un…",
      o: ["Factor objetivo", "Factor subjetivo", "Dolo directo", "Hecho involuntario"],
      c: 0,
      e: "Teoría del riesgo: quien posee una cosa que crea riesgos responde por los daños que ocasiona aunque no haya habido culpa de su parte."
    },
    {
      p: "Por el daño que sufriste, tu empresa dejó de facturar durante un mes. Esa ganancia frustrada se llama…",
      o: ["Lucro cesante", "Daño emergente", "Daño moral", "Cláusula penal"],
      c: 0,
      e: "Daño patrimonial = daño emergente (la pérdida sufrida) + lucro cesante (la ganancia dejada de percibir)."
    },
    {
      p: "Cuando el factor de atribución es objetivo, ¿qué debe probar el demandado para liberarse?",
      o: ["Ruptura del nexo causal", "Ausencia de culpa propia", "Autorización administrativa de uso", "Cumplimiento de normas técnicas"],
      c: 0,
      e: "Como la culpa es irrelevante, probar diligencia no sirve. Tampoco son eximentes la autorización administrativa ni el cumplimiento de las técnicas de prevención. Solo libera la causa ajena."
    },
    {
      p: "Según la cátedra, el ingeniero que se compromete a entregar la obra terminada asume una…",
      o: ["Obligación de resultado", "Obligación de medios", "Obligación de seguridad", "Obligación de custodia"],
      c: 0,
      e: "El abogado promete medios; el arquitecto o ingeniero promete un resultado (la obra terminada) y responde igualmente por los defectos de construcción."
    }
  ],
  casos: [
    {
      titulo: "El firmware que falló",
      enunciado: "Desarrollaste el firmware de control de una prensa hidráulica para una fábrica. Por un error tuyo en la lógica de seguridad —no probaste un caso límite que la norma técnica indicaba probar— la prensa se acciona sola y lesiona a un operario, que queda tres meses sin trabajar. <strong>Analizá los cuatro presupuestos</strong> de la responsabilidad civil: tuya y del dueño de la fábrica. ¿Qué factor de atribución corresponde a cada uno? ¿Podría haber además responsabilidad penal?",
      guia: [
        "<strong>Antijuridicidad:</strong> acción u omisión que causa daño a otro sin estar justificada (no hay legítima defensa, estado de necesidad, etc.).",
        "<strong>Daño:</strong> patrimonial (gastos médicos = daño emergente; tres meses sin ingresos = lucro cesante) y extrapatrimonial.",
        "<strong>Factor de atribución mío:</strong> subjetivo — culpa por negligencia o impericia (omití una prueba exigible); y si comprometí un resultado, la cátedra lo trata como obligación de resultado.",
        "<strong>Factor de atribución del dueño:</strong> objetivo — la prensa es una cosa riesgosa; responde aunque haya sido diligente.",
        "<strong>Relación causal:</strong> el daño es consecuencia del error; el dueño solo se libera probando causa ajena (caso fortuito, hecho de un tercero, hecho de la víctima).",
        "<strong>Penal:</strong> es un plano distinto; requiere que la conducta esté tipificada (ej. lesiones culposas) y la condena es punitoria, no resarcitoria.",
        "Mencioné la <strong>prescripción</strong>: tres años para el reclamo de daños."
      ]
    }
  ]
};
