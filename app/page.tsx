'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  Code2,
  Gauge,
  GitBranch,
  ExternalLink,
  MessageSquareText,
  MonitorUp,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Visual = 'question' | 'coverage' | 'mutation' | 'imperative' | 'refactor' | 'decision' | 'ruby' | 'cost' | 'evidence' | 'pilot' | 'llm' | 'adoption' | 'reflection';
type ImperativeStep = 'contract' | 'location' | 'source' | 'ast' | 'point' | 'replacement' | 'patch' | 'killed' | 'alive';

type Slide = {
  index: string;
  section: string;
  minutes: number;
  title: string;
  copy: string;
  annotation: string;
  code?: string;
  step?: ImperativeStep;
  visual: Visual;
  presenter: string[];
  claims: string[];
};

const slides: Slide[] = [
  {
    index: '01', section: 'La pregunta', minutes: 2, visual: 'question',
    title: 'Mutation Testing en Ruby: ¿vale la pena?',
    copy: 'No empezamos con una herramienta. Empezamos con una decisión: ¿cuándo vale la pena pagar el coste de comprobar si nuestros tests distinguen el comportamiento correcto del incorrecto?',
    annotation: 'La tesis: mutation testing vale donde una decisión relevante justifica el coste de verificarla.',
    presenter: ['Abrí con una suite verde que no evitó un incidente o una regresión.', 'Prometé una respuesta condicionada: no es para todo proyecto, todo archivo ni todo commit.'],
    claims: ['Una suite verde es evidencia, pero no toda la evidencia que necesitamos.', 'La pregunta interesante no es “¿podemos usar Mutant?”, sino “¿dónde nos devuelve valor?”.'],
  },
  {
    index: '02', section: 'Cobertura', minutes: 3, visual: 'coverage',
    title: 'La línea corrió. ¿Pero su significado estaba probado?',
    copy: 'Line coverage registra que una línea fue ejecutada. Eso puede demostrar que no explotó en un escenario; no demuestra que cada decisión semántica de esa línea responda al requerimiento.',
    annotation: 'Cobertura de ejecución y cobertura semántica contestan preguntas distintas. No son métricas enemigas.',
    code: 'def adult?\n  age >= 18\nend',
    presenter: ['Pedí al público un ejemplo de una línea cubierta por un test con una aserción débil.', 'Mostrá que 17 y 19 pueden ejecutar la misma línea sin especificar el borde de 18.'],
    claims: ['100% de line coverage no equivale a 100% de confianza semántica.', 'La cobertura indica por dónde pasó la suite; Mutant pregunta qué diferencia habría detectado.'],
  },
  {
    index: '03', section: 'Mecanismo', minutes: 2, visual: 'mutation',
    title: 'Una mutación es una hipótesis que los tests deberían refutar',
    copy: 'Mutant toma un subject —una pieza de código seleccionable—, le aplica un mutation operator sobre su AST y ejecuta los tests relevantes. Si no logra refutar esa hipótesis, la mutación queda viva.',
    annotation: 'La nomenclatura de Mutant ayuda a explicar el mecanismo sin reducirlo a “cambiar una línea”.',
    code: 'original  age >= 18\nmutante   age > 18\n\nkilled → test falla\nalive  → test pasa',
    presenter: ['Presentá subject, operator y mutation como tres niveles distintos; evita llamar “mutante” a todo.', 'Definí killed y alive antes de hablar de score o herramientas.'],
    claims: ['Una mutación expresa una hipótesis sobre una diferencia semántica.', 'El valor está en la diferencia que la suite no logró refutar.'],
  },
  {
    index: '04', section: 'MiniMutant · 01', minutes: 0.5, visual: 'imperative', step: 'contract',
    title: 'Primero: una regla observable',
    copy: 'No empezamos creando una abstracción. Ejecutamos `Calculator#positive?` y fijamos el contrato que queremos proteger: `1` es positivo; `0`, no.',
    annotation: 'Todo mutante solo tiene sentido frente a una observación de comportamiento.',
    code: 'calculator = Calculator.new\nraise unless calculator.positive?(1)\nraise if calculator.positive?(0)',
    presenter: ['Mostrá el método original y los dos resultados antes de hablar de AST o de mutantes.'],
    claims: ['La prueba de borde es una decisión de dominio, no un detalle de la herramienta.'],
  },
  {
    index: '05', section: 'MiniMutant · 02', minutes: 0.5, visual: 'imperative', step: 'location',
    title: 'El método nos lleva a su source',
    copy: 'La reflexión de Ruby nos entrega el archivo y la línea de inicio del método real. Ya tenemos una coordenada verificable; no un nombre inventado ni una búsqueda textual ambigua.',
    annotation: 'Esto es lo que después una clase llamará `Subject`; por ahora son dos variables.',
    code: 'method = Calculator.instance_method(:positive?)\npath, line = method.source_location',
    presenter: ['Leé el valor de `path:line`: la siguiente operación trabaja sobre ese archivo exacto.'],
    claims: ['`source_location` conecta un método que existe en runtime con su implementación Ruby.'],
  },
  {
    index: '06', section: 'MiniMutant · 03', minutes: 0.5, visual: 'imperative', step: 'source',
    title: 'Leemos exactamente lo que Ruby ejecuta',
    copy: 'Con esa coordenada leemos el archivo y mostramos las tres líneas del método. El programa que queremos mutar todavía es texto: conserva espacios, comentarios y todo el contexto alrededor.',
    annotation: 'Antes de cambiar nada, hacemos visible el material de la mutación.',
    code: 'source = File.binread(path)\nputs source.lines[line - 1, 3]',
    presenter: ['Detenete en `number > 0`: ese carácter es la diferencia que queremos poner a prueba.'],
    claims: ['Leer source no es parsearlo: todavía no sabemos qué `>` pertenece a qué expresión.'],
  },
  {
    index: '07', section: 'MiniMutant · 04', minutes: 0.5, visual: 'imperative', step: 'ast',
    title: 'Prism convierte texto en estructura',
    copy: 'Prism parsea el archivo y recorremos el árbol hasta encontrar el `DefNode` de `positive?` que empieza en la línea conocida. Ahora delimitamos el método, no todo el archivo.',
    annotation: 'El AST no reemplaza el source: nos da una forma confiable de ubicar una parte de él.',
    code: 'tree = Prism.parse(source).value\ndefinition = nodes(tree).find { |node|\n  node.is_a?(Prism::DefNode) && node.name == :positive?\n}',
    presenter: ['Mostrá el salto: de un string completo a una única definición de método.'],
    claims: ['La selección por nombre y línea evita mutar otro método con el mismo operador.'],
  },
  {
    index: '08', section: 'MiniMutant · 05', minutes: 0.5, visual: 'imperative', step: 'point',
    title: 'Encontramos un punto, no una línea entera',
    copy: 'Dentro de ese `DefNode`, buscamos el `CallNode` cuyo mensaje es `>`. Prism devuelve su rango de bytes: sabemos con precisión qué token es reemplazable.',
    annotation: 'El mutation point es el operador y su rango; no “la línea cinco”.',
    code: 'call = nodes(definition).find { |node|\n  node.is_a?(Prism::CallNode) && node.message_loc.slice == ">"\n}\nrange = call.message_loc',
    presenter: ['Marcá que el rango señala un carácter, aunque la expresión tenga más código alrededor.'],
    claims: ['El AST guía una sustitución segura y acotada de source.'],
  },
  {
    index: '09', section: 'MiniMutant · 06', minutes: 0.5, visual: 'imperative', step: 'replacement',
    title: 'Construimos el mutante por rango',
    copy: 'Cortamos el source antes y después del rango, e insertamos `>=`. El resto del archivo queda idéntico: no serializamos un AST nuevo ni necesitamos un unparser.',
    annotation: 'Esta es la decisión didáctica central: AST-guided source mutation.',
    code: 'mutated = source.byteslice(0, range.start_offset) +\n  ">=" + source.byteslice(range.end_offset..)',
    presenter: ['Mostrá el before/after: `number > 0` se vuelve `number >= 0`.'],
    claims: ['El cambio es pequeño a propósito: expresa una hipótesis semántica precisa.'],
  },
  {
    index: '10', section: 'MiniMutant · 07', minutes: 0.5, visual: 'imperative', step: 'patch',
    title: 'El source mutado redefine el método',
    copy: 'Evaluamos el archivo mutado en runtime. El método cambia de verdad: ahora `positive?(0)` devuelve `true`. Tenemos un programa incorrecto, listo para desafiar a la suite.',
    annotation: 'Este paso es visible a propósito; todavía no aislamos el cambio.',
    code: 'TOPLEVEL_BINDING.eval(mutated, path, 1)\nputs Calculator.new.positive?(0) # true',
    presenter: ['Preguntá: ¿qué debería hacer una prueba que especifica el borde de cero?'],
    claims: ['Una mutación no es un diff decorativo: cambia el comportamiento que ejecuta Ruby.'],
  },
  {
    index: '11', section: 'MiniMutant · 08', minutes: 0.5, visual: 'imperative', step: 'killed',
    title: 'Fork: el hijo recibe el mutante',
    copy: 'Aplicamos el mismo patch dentro de un proceso hijo y ejecutamos la aserción de borde. El hijo falla, informa `killed` y termina; el proceso padre conserva la implementación original.',
    annotation: 'Isolation deja de ser vocabulario: se observa que el padre sigue respondiendo `false` para cero.',
    code: 'fork do\n  eval(mutated, TOPLEVEL_BINDING, path, 1)\n  raise if Calculator.new.positive?(0)\nend # killed',
    presenter: ['Compará ambos procesos: hijo mutado, padre intacto.'],
    claims: ['Una aserción que falla mata al mutante.'],
  },
  {
    index: '12', section: 'MiniMutant · 09', minutes: 0.5, visual: 'imperative', step: 'alive',
    title: 'Sin el borde, el mismo mutante sobrevive',
    copy: 'Ahora el hijo solo prueba que `1` es positivo. La mutación `>` → `>=` conserva ese resultado, la corrida termina limpia y el veredicto es `alive`.',
    annotation: 'Alive no exige “agregar más tests”: primero pregunta si ese borde es un comportamiento requerido.',
    code: 'raise unless Calculator.new.positive?(1)\n# no assertion for 0 → alive',
    presenter: ['Volvé a la decisión: test faltante, simplificación o mutante equivalente.'],
    claims: ['Un vivo revela una hipótesis que la suite no logró refutar.'],
  },
  {
    index: '13', section: 'MiniMutant · refactor', minutes: 0.5, visual: 'refactor',
    title: 'Recién ahora extraemos nombres reutilizables',
    copy: 'Las clases no agregan una nueva idea: reúnen las operaciones que ya vimos. `Subject`, `Discoverer`, `SourceRewriter` y `Runner` son un refactor del recorrido imperativo.',
    annotation: 'La API reusable queda como destino y material de consulta; los steps conservan el mecanismo a la vista.',
    code: 'Subject → source_location\nDiscoverer → Prism + mutation points\nSourceRewriter → range replacement\nRunner → fork + killed / alive',
    presenter: ['Mostrá los cuatro nombres como etiquetas del pipeline ya construido, no como una caja negra.'],
    claims: ['Una buena abstracción comprime una mecánica que ya entendemos.'],
  },
  {
    index: '14', section: 'Decisión', minutes: 3, visual: 'decision',
    title: 'Para Mutant, un vivo abre dos acciones concretas',
    copy: 'Si el código mutado conserva la semántica que los tests ya especifican, el original es redundante: aceptamos la simplificación. Si el original era correcto pero el comportamiento removido importa, agregamos el test que falta.',
    annotation: 'Errores de entorno, flakiness o mutantes equivalentes son problemas previos de la ejecución; no los confundimos con esas dos acciones de producto.',
    presenter: ['Mostrá primero la ruta de simplificación: es la formulación más potente del README de Mutant.', 'Después separá resultados no concluyentes de una mutación genuinamente viva.'],
    claims: ['“Quedarse con el mutante” puede significar eliminar semántica redundante.', 'La otra acción es especificar con un test el comportamiento que sí importa.'],
  },
  {
    index: '15', section: 'Ruby', minutes: 3, visual: 'ruby',
    title: 'Rails necesita discovery e isolation, no solo una gem',
    copy: 'La configuración mínima inicializa Rails en test, carga el entorno y elige integración. Para que los subjects sean visibles hay que eager-load; con workers paralelos, base de datos y demás estado compartido deben aislarse.',
    annotation: 'Esta parte explica buena parte del coste de adopción: en Rails, una corrida confiable es infraestructura de tests.',
    code: 'bundle exec mutant run \\\n+  --use rspec \\\n+  --since main \\\n+  "Billing::Price#calculate"',
    presenter: ['Usá las palabras de Mutant: eager loading para discovery e isolation para que los workers no filtren estado.', 'Mencioná licencia y compatibilidad como parte del coste real; no como nota al pie.'],
    claims: ['Un subject que no se eager-load puede no existir para Mutant.', 'Isolation también cubre filesystem, caches, colas y servicios externos, no solo la DB.'],
  },
  {
    index: '16', section: 'Coste', minutes: 3, visual: 'cost',
    title: 'El coste tiene tres relojes: ejecución, CI y revisión',
    copy: 'Cada mutante corre pruebas. Eso suma tiempo de cómputo y dinero de CI. Los supervivientes además consumen tiempo humano y, si usamos LLMs, tokens. Mutant plantea una estrategia explícita: full pass mientras entre en el tiempo aceptable; incremental sobre cambios cuando deje de entrar.',
    annotation: 'Incremental es un trade-off: acelera al mirar el working set, pero no detecta cambios indirectos.',
    presenter: ['No prometas que la IA elimina el coste: desplaza parte del esfuerzo hacia clasificación y verificación.', 'Explicá la recomendación de Mutant: incremental local, full pass nocturno si ya no entra en CI.'],
    claims: ['La estrategia incremental responde al tiempo de ida y vuelta aceptable para una persona.', 'Un full pass periódico compensa lo que `--since` no selecciona por cambios indirectos.'],
  },
  {
    index: '17', section: 'Evidencia', minutes: 3, visual: 'evidence',
    title: 'Para hablar de coste, necesitamos datos de apps reales',
    copy: 'En lugar de basarnos en una demo, vamos a explorar Real World Rails: un corpus de más de 200 checkouts. Primero inventario estático; después un piloto pequeño, reproducible y atribuido a una versión concreta.',
    annotation: 'La charla puede mostrar investigación en progreso sin convertir una muestra pequeña en una verdad universal.',
    presenter: ['Contá el orden: detectar adopción existente, seleccionar un piloto viable, medir baseline y mutar pocos sujetos.', 'Marcá el sesgo: proyectos de código abierto, versiones distintas y suites que pueden no correr hoy.'],
    claims: ['Antes de comparar resultados, hay que registrar compatibilidad, baseline y configuración.', 'Una muestra honesta vale más que una estadística inflada.'],
  },
  {
    index: '18', section: 'Piloto', minutes: 3, visual: 'pilot',
    title: 'El piloto convierte reportes en datos, no en anécdotas',
    copy: 'Para cada mutante vivo guardaremos el sujeto, operador, ejecución, clasificación, evidencia y resolución. Solo contaremos un bug real cuando haya una confirmación revisable: un test, una corrección o una especificación explícita.',
    annotation: 'CSV para comparar y sesiones/reportes crudos para volver a leer el contexto. El formato machine-readable depende de la versión y edición de la herramienta.',
    presenter: ['Mostrá que un LLM propone una clasificación, pero que el contrato sigue siendo humano y de dominio.', 'Explicá que “equivalente” y “falla del entorno” también son datos, no basura.'],
    claims: ['Un reporte de Mutant sin una taxonomía termina siendo ruido.', 'La reproducibilidad permite que la charla sea refutable y mejorable.'],
  },
  {
    index: '19', section: 'LLMs', minutes: 3, visual: 'llm',
    title: 'Un LLM puede acelerar la lectura; no decidir el requerimiento',
    copy: 'Podemos pedirle a un LLM que explique el diff, encuentre tests relacionados y proponga una clasificación. Pero aceptar una simplificación o escribir un test es una decisión de producto, seguridad y dominio.',
    annotation: 'La IA no convierte una señal en verdad; puede reducir el coste de llegar a una decisión bien fundamentada.',
    presenter: ['Evitá la promesa de “auto-fix”: el experimento debe medir también desacuerdos y falsos positivos del LLM.', 'Conectá esta idea con revisión de PRs generados por IA.'],
    claims: ['La trazabilidad de por qué aceptamos una decisión importa más que una respuesta fluida.', 'Los LLMs pueden ser un buen primer lector de mutantes, no el juez final.'],
  },
  {
    index: '20', section: 'Adopción', minutes: 3, visual: 'adoption',
    title: 'Vale la pena donde se cruzan criticidad, estabilidad y foco',
    copy: 'Empezaría por reglas de autorización, tenancy, límites, cálculos de dinero o cambios sensibles. Si la suite es flaky, no hay baseline o el coste supera la señal, primero hay trabajo previo que hacer.',
    annotation: 'No es una puerta de CI universal. Es una señal de alta fidelidad para zonas donde fallar cuesta más.',
    presenter: ['Pedí que cada persona piense una regla que no puede permitirse interpretar mal.', 'Cerrá el marco con tres preguntas: ¿qué importa?, ¿podemos medirlo?, ¿podemos revisarlo?'],
    claims: ['Seguridad no requiere más tests en abstracto: requiere tests que fallen cuando una defensa se debilita.', 'Un buen rollout es selectivo, medible y revisable.'],
  },
  {
    index: '21', section: 'Reflexión', minutes: 3, visual: 'reflection',
    title: 'Si la IA escribe más código, la escasez no será escribir',
    copy: 'El lugar interesante puede estar un nivel más arriba: herramientas que verifican, restringen y explican código generado. Mutation testing, complejidad, análisis estático y contraejemplos convierten velocidad en confianza calibrada.',
    annotation: 'Menos automatización que produce código sin verificar. Más metacódigo que nos ayuda a decidir si ese código merece confianza.',
    presenter: ['Volvé a la pregunta inicial: vale la pena cuando la decisión importa más que el coste de comprobarla.', 'Terminá invitando al público a nombrar una herramienta de verificación que les falta hoy.'],
    claims: ['La generación de código eleva el valor de la verificación.', 'La siguiente capa interesante de herramientas puede ser la que prueba el output de la anterior.'],
  },
];

const sources = [
  {
    category: 'Mutant: conceptos y uso',
    description: 'La documentación primaria para profundizar en el vocabulario y el flujo de la herramienta.',
    links: [
      ['Mutant — README', 'Punto de partida: concepto, instalación y filosofía.', 'https://github.com/mbj/mutant'],
      ['Nomenclature', 'Subject, mutation operator, mutation, kill y otros términos de la charla.', 'https://github.com/mbj/mutant/blob/main/docs/nomenclature.md'],
      ['Rails Integration', 'Discovery, eager loading e isolation en aplicaciones Rails.', 'https://github.com/mbj/mutant/blob/main/docs/rails.md'],
      ['Incremental mode', 'Qué selecciona `--since` y qué deja afuera.', 'https://github.com/mbj/mutant/blob/main/docs/incremental.md'],
      ['Reading reports', 'Cómo leer y priorizar los resultados de una corrida.', 'https://github.com/mbj/mutant/blob/main/docs/reading-reports.md'],
    ],
  },
  {
    category: 'Evidencia y corpus',
    description: 'Referencias para discutir el valor y los límites de mutation testing más allá de una demo.',
    links: [
      ['Real World Rails', 'Corpus de checkouts de aplicaciones Rails para el piloto de la charla.', 'https://github.com/eliotsykes/real-world-rails'],
      ['Just et al. — real faults', 'Trabajo sobre la relación entre mutantes y fallas reales.', 'https://homes.cs.washington.edu/~rjust/publ/mutants_real_faults_tr_2014.pdf'],
      ['Google Research — long-term effects', 'Estudio sobre efectos a largo plazo de mutation testing en desarrollo.', 'https://research.google/pubs/long-term-effects-of-mutation-testing/'],
    ],
  },
];

const formatDuration = (minutes: number) => Number.isInteger(minutes) ? `${minutes} min` : `${Math.floor(minutes)} min 30 s`;
const formatElapsed = (minutes: number) => `${Math.floor(minutes)}:${minutes % 1 === 0 ? '00' : '30'}`;

const rubyToken = /(#.*$|'[^']*'|"[^"\n]*"|\b(?:def|end|class|module|if|else|elsif|unless|do|case|when|return)\b|\b(?:true|false|nil)\b|:\w+|\b\d+\b|\b[a-z_]\w*[!?]?(?=\())/gm;

function RubyCode({ code }: { code: string }) {
  return code.replace(/^\+/gm, '').split(rubyToken).map((token, index) => {
    if (!token) return null;
    let color = 'text-[#42191f]';
    if (token.startsWith('#')) color = 'text-[#9a7073] italic';
    else if (/^['"]/.test(token)) color = 'text-[#a44a00]';
    else if (/^(def|end|class|module|if|else|elsif|unless|do|case|when|return)$/.test(token)) color = 'text-[#9c1f31] font-semibold';
    else if (/^(true|false|nil)$/.test(token)) color = 'text-[#6b3d7a] font-semibold';
    else if (/^:\w+$/.test(token)) color = 'text-[#b04b5f]';
    else if (/^\d+$/.test(token)) color = 'text-[#805246]';
    else if (/^[a-z_]\w*[!?]?$/.test(token)) color = 'text-[#6b3d7a]';
    return <span className={color} key={`${token}-${index}`}>{token}</span>;
  });
}

function Diagram({ visual, step, coverageMode, setCoverageMode }: { visual: Visual; step?: ImperativeStep; coverageMode: 'line' | 'semantic'; setCoverageMode: (mode: 'line' | 'semantic') => void }) {
  const card = 'border border-[#6c2330]/20 bg-[#fffdfb] p-4 shadow-[0_10px_30px_rgba(91,30,42,.06)]';
  const label = 'font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#9c1f31]';

  if (visual === 'question') return <div className="grid gap-4 sm:grid-cols-3"><div className={`${card} sm:col-span-2`}><p className={label}>La decisión</p><p className="mt-4 text-2xl font-semibold tracking-tight text-[#2a171a]">¿El valor de detectar esta diferencia supera el coste de encontrarla?</p><div className="mt-6 h-px bg-[#6c2330]/15"><div className="h-px w-2/3 animate-pulse bg-[#9c1f31]" /></div></div><div className="border border-[#9c1f31] bg-[#9c1f31] p-4 text-[#fffaf6]"><Scale className="size-5" /><p className="mt-8 font-mono text-xs uppercase tracking-[.14em]">No es “sí” o “no”</p><p className="mt-2 text-sm leading-relaxed text-white/80">Es una decisión situada.</p></div></div>;

  if (visual === 'coverage') return <div className={card}><div className="mb-5 flex gap-2"><button onClick={() => setCoverageMode('line')} className={`border px-3 py-1.5 text-xs font-semibold ${coverageMode === 'line' ? 'border-[#9c1f31] bg-[#9c1f31] text-[#fffaf6]' : 'border-[#6c2330]/20 text-[#75555a]'}`}>Line coverage</button><button onClick={() => setCoverageMode('semantic')} className={`border px-3 py-1.5 text-xs font-semibold ${coverageMode === 'semantic' ? 'border-[#9c1f31] bg-[#9c1f31] text-[#fffaf6]' : 'border-[#6c2330]/20 text-[#75555a]'}`}>Cobertura semántica</button></div><div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="border border-[#6c2330]/15 bg-[#fffaf6] p-4"><p className={label}>Suite</p><p className="mt-2 font-mono text-sm text-[#42191f]">age: 17 → false<br />age: 19 → true</p></div><div className="mx-auto text-2xl text-[#9c1f31]">→</div><div className={`border p-4 transition-colors ${coverageMode === 'line' ? 'border-[#cfb5b8] bg-[#f8eeea]' : 'border-[#9c1f31] bg-[#fff5f4]'}`}><p className={label}>{coverageMode === 'line' ? 'Sabemos' : 'Todavía falta'}</p><p className="mt-2 text-sm leading-relaxed text-[#42191f]">{coverageMode === 'line' ? 'La línea se ejecutó sin explotar.' : '¿Qué pasa exactamente con age: 18?'}</p></div></div></div>;

  if (visual === 'mutation') return <div className={`${card} overflow-hidden`}><div className="grid gap-3 sm:grid-cols-4 sm:items-stretch"><div className="border border-[#6c2330]/15 p-3"><p className={label}>Subject</p><p className="mt-3 font-mono text-sm text-[#42191f]">Person#adult?</p></div><div className="border border-[#9c1f31] bg-[#fff5f4] p-3"><p className={label}>Operator</p><p className="mt-3 font-mono text-sm font-semibold text-[#9c1f31]">&gt;= → &gt;</p></div><div className="border border-[#6c2330]/15 p-3"><p className={label}>Hypothesis</p><p className="mt-3 text-sm text-[#42191f]">ejecutar tests</p><div className="mt-3 h-1 overflow-hidden bg-[#f4e3df]"><div className="h-full w-2/3 animate-pulse bg-[#9c1f31]" /></div></div><div className="border border-[#6c2330]/15 p-3"><p className={label}>Veredicto</p><p className="mt-3 text-sm font-semibold text-[#42191f]">killed <span className="text-[#9a7073]">/</span> alive</p></div></div></div>;

  if (visual === 'imperative' && step) {
    const stages = {
      contract: ['Contrato', 'Calculator#positive?', '1 → true · 0 → false'],
      location: ['Reflexión', 'instance_method', 'archivo + línea'],
      source: ['Source', 'File.binread(path)', 'number > 0'],
      ast: ['Prism', 'ProgramNode → DefNode', 'solo positive?'],
      point: ['Punto', 'CallNode(">")', 'rango del token'],
      replacement: ['Mutante', '> → >=', 'source alrededor intacto'],
      patch: ['Runtime', 'eval(mutated)', '0 → true'],
      killed: ['Aislamiento', 'fork + prueba de borde', 'killed'],
      alive: ['Evidencia', 'sin prueba de borde', 'alive'],
    } as const;
    const [phase, operation, result] = stages[step];
    return <div className={`${card} overflow-hidden`}><div className="flex items-center justify-between border-b border-[#6c2330]/15 pb-4"><p className={label}>Construcción imperativa</p><span className="font-mono text-xs text-[#9c1f31]">step {String(Object.keys(stages).indexOf(step) + 1).padStart(2, '0')}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="border border-[#6c2330]/15 bg-[#fffaf6] p-3"><p className={label}>Entrada</p><p className="mt-3 text-sm font-semibold">{phase}</p></div><div className="border border-[#6c2330]/15 bg-[#fffdfb] p-3"><p className={label}>Una operación</p><p className="mt-3 font-mono text-sm font-semibold text-[#42191f]">{operation}</p></div><div className="border border-[#9c1f31] bg-[#fff5f4] p-3"><p className={label}>Observamos</p><p className="mt-3 font-mono text-sm font-semibold text-[#9c1f31]">{result}</p></div></div></div>;
  }

  if (visual === 'refactor') return <div className={`${card} overflow-hidden`}><p className={label}>Después de entender el flujo</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="border border-[#6c2330]/15 bg-[#fffaf6] p-3"><p className="font-mono text-xs text-[#9c1f31]">steps/01–09</p><p className="mt-3 text-sm font-semibold">variables, AST, source, fork</p><p className="mt-2 text-xs text-[#75555a]">mecánica visible</p></div><div className="border border-[#9c1f31] bg-[#fff5f4] p-3"><p className="font-mono text-xs text-[#9c1f31]">lib/mini_mutant</p><p className="mt-3 text-sm font-semibold">Subject, Discoverer, Runner</p><p className="mt-2 text-xs text-[#75555a]">la misma mecánica, con nombres</p></div></div></div>;

  if (visual === 'decision') return <div className="grid gap-3 sm:grid-cols-2"><div className="border border-[#9c1f31] bg-[#9c1f31] p-4 text-[#fffaf6]"><p className="font-mono text-[10px] uppercase tracking-[.14em] text-white/70">Alive mutation</p><p className="mt-2 text-xl font-semibold">La suite no refutó la hipótesis</p></div><div className="grid grid-cols-2 gap-3"><div className={card}><Check className="size-4 text-[#9c1f31]" /><p className="mt-5 text-sm font-semibold">Agregar test</p><p className="mt-1 text-xs text-[#75555a]">el original importa</p></div><div className={card}><GitBranch className="size-4 text-[#9c1f31]" /><p className="mt-5 text-sm font-semibold">Aceptar mutante</p><p className="mt-1 text-xs text-[#75555a]">simplificar original</p></div></div></div>;

  if (visual === 'ruby') return <div className={card}><div className="grid gap-3 sm:grid-cols-3"><div><p className={label}>Test mode</p><p className="mt-2 text-lg font-semibold">RAILS_ENV=test</p></div><div><p className={label}>Discovery</p><p className="mt-2 text-lg font-semibold">eager load</p></div><div><p className={label}>Isolation</p><p className="mt-2 text-lg font-semibold">DB · FS · queues</p></div></div><div className="mt-5 flex flex-wrap gap-2"><span className="border border-[#9c1f31]/30 bg-[#fff5f4] px-2 py-1 font-mono text-xs text-[#9c1f31]">RSpec / Minitest</span><span className="border border-[#9c1f31]/30 bg-[#fff5f4] px-2 py-1 font-mono text-xs text-[#9c1f31]">worker-specific state</span></div></div>;

  if (visual === 'cost') return <div className="grid gap-3 sm:grid-cols-3"><div className={card}><p className={label}>Local</p><div className="mt-5 h-2 bg-[#f4e3df]"><div className="h-full w-[46%] bg-[#9c1f31]" /></div><p className="mt-3 text-sm text-[#75555a]">incremental · `--since`</p></div><div className={card}><p className={label}>CI</p><div className="mt-5 h-2 bg-[#f4e3df]"><div className="h-full w-[72%] bg-[#b04b5f]" /></div><p className="mt-3 text-sm text-[#75555a]">full pass mientras entre</p></div><div className={card}><p className={label}>Cobertura total</p><div className="mt-5 h-2 bg-[#f4e3df]"><div className="h-full w-[85%] bg-[#6b3d7a]" /></div><p className="mt-3 text-sm text-[#75555a]">full pass nocturno</p></div></div>;

  if (visual === 'evidence') return <div className={card}><div className="flex items-center justify-between"><p className={label}>Real World Rails</p><span className="font-mono text-2xl font-semibold text-[#9c1f31]">214</span></div><p className="mt-1 text-sm text-[#75555a]">checkouts indexados para explorar</p><div className="mt-5 grid grid-cols-4 gap-2">{['inventario', 'baseline', 'piloto', 'revisión'].map((item, index) => <div className="border border-[#6c2330]/15 p-2" key={item}><span className="font-mono text-xs text-[#9c1f31]">0{index + 1}</span><p className="mt-4 text-xs font-semibold">{item}</p></div>)}</div></div>;

  if (visual === 'pilot') return <div className={`${card} relative`}><div className="absolute left-[12%] right-[12%] top-[49%] hidden h-px bg-[#9c1f31]/30 sm:block" /><div className="relative grid gap-3 sm:grid-cols-5">{['app + revisión', 'suite baseline', 'sujeto acotado', 'mutantes vivos', 'CSV + evidencia'].map((item, index) => <div className="bg-[#fffdfb] p-3" key={item}><span className="grid size-6 place-items-center rounded-full bg-[#9c1f31] font-mono text-xs text-[#fffaf6]">{index + 1}</span><p className="mt-5 text-xs font-semibold leading-snug text-[#42191f]">{item}</p></div>)}</div></div>;

  if (visual === 'llm') return <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]"><div className={card}><Sparkles className="size-5 text-[#6b3d7a]" /><p className="mt-5 text-sm font-semibold">LLM: explica, agrupa y propone</p><p className="mt-2 text-xs text-[#75555a]">primer lector del reporte</p></div><div className="self-center text-2xl text-[#9c1f31]">→</div><div className="border border-[#9c1f31] bg-[#fff5f4] p-4"><MessageSquareText className="size-5 text-[#9c1f31]" /><p className="mt-5 text-sm font-semibold">Humano: valida el contrato</p><p className="mt-2 text-xs text-[#75555a]">decisión de dominio y evidencia</p></div></div>;

  if (visual === 'adoption') return <div className={card}><p className={label}>Filtro de adopción</p><div className="mt-5 grid gap-2 sm:grid-cols-3">{[['Criticidad', '¿fallar cuesta?'], ['Estabilidad', '¿la suite es confiable?'], ['Foco', '¿podemos acotar?']].map(([title, copy]) => <div className="border border-[#6c2330]/15 p-3" key={title}><p className="font-semibold text-[#42191f]">{title}</p><p className="mt-2 text-xs text-[#75555a]">{copy}</p></div>)}</div><div className="mt-4 border-l-2 border-[#9c1f31] pl-3 text-sm font-semibold text-[#42191f]">Las tres en verde → buen primer candidato</div></div>;

  return <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]"><div className={card}><p className={label}>IA</p><p className="mt-4 text-lg font-semibold">produce código y tests</p></div><div className="self-center text-2xl text-[#9c1f31]">↑</div><div className="border border-[#9c1f31] bg-[#fff5f4] p-4"><p className={label}>Metacódigo</p><p className="mt-4 text-lg font-semibold">verifica, restringe y explica</p></div></div>;
}

function SourcesLibrary() {
  return <div className="mx-auto max-w-5xl"><div className="max-w-3xl"><p className="font-mono text-[10px] font-bold uppercase tracking-[.15em] text-[#9c1f31]">Biblioteca de lectura</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.055em] text-[#2a171a] sm:text-6xl">Fuentes para continuar después de la charla</h1><p className="mt-6 text-xl leading-relaxed text-[#75555a]">Acá quedan las referencias sin el límite de una diapositiva: qué documenta la herramienta, qué evidencia estamos usando y qué conviene leer antes de sacar conclusiones generales.</p></div><div className="mt-12 space-y-10">{sources.map((group) => <section key={group.category}><div className="border-b border-[#6c2330]/15 pb-4"><p className="font-mono text-[10px] font-bold uppercase tracking-[.15em] text-[#9c1f31]">{group.category}</p><p className="mt-2 text-sm leading-relaxed text-[#75555a]">{group.description}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{group.links.map(([title, description, href]) => <a className="group border border-[#6c2330]/15 bg-[#fffdfb] p-5 shadow-[0_10px_30px_rgba(91,30,42,.05)] transition hover:border-[#9c1f31] hover:bg-[#fff5f4]" href={href} key={href} rel="noreferrer" target="_blank"><div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-[#42191f]">{title}</h2><ExternalLink className="mt-0.5 size-4 shrink-0 text-[#9c1f31]" /></div><p className="mt-3 text-sm leading-relaxed text-[#75555a]">{description}</p></a>)}</div></section>)}</div><p className="mt-12 border-l-2 border-[#9c1f31] pl-4 text-sm leading-relaxed text-[#75555a]">Esta biblioteca separa documentación primaria, corpus y evidencia empírica. No reemplaza el contexto de cada proyecto: lo hace discutible.</p></div>;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [presenterMode, setPresenterMode] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [coverageMode, setCoverageMode] = useState<'line' | 'semantic'>('line');
  const current = slides[active];
  const minutesBefore = slides.slice(0, active).reduce((total, slide) => total + slide.minutes, 0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!sourcesOpen && event.key === 'ArrowRight') setActive((value) => Math.min(value + 1, slides.length - 1));
      if (!sourcesOpen && event.key === 'ArrowLeft') setActive((value) => Math.max(value - 1, 0));
      if (!sourcesOpen && event.key.toLowerCase() === 'p') setPresenterMode((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sourcesOpen]);

  const go = (direction: -1 | 1) => setActive((value) => Math.max(0, Math.min(slides.length - 1, value + direction)));

  return <main className="min-h-screen bg-[#fffaf6] text-[#2a171a] selection:bg-[#9c1f31] selection:text-[#fffaf6]">
    <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#6c2330]/15 px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3"><span className="grid size-8 place-items-center bg-[#9c1f31] text-xs font-bold text-[#fffaf6]">M</span><div><p className="text-sm font-semibold tracking-tight">Mutation Testing en Ruby</p><p className="text-[10px] uppercase tracking-[.15em] text-[#75555a]">¿vale la pena?</p></div></div>
      <div className="flex items-center gap-2"><Button variant={!sourcesOpen && !presenterMode ? 'secondary' : 'ghost'} size="sm" onClick={() => { setSourcesOpen(false); setPresenterMode(false); }}>Charla</Button><Button variant={!sourcesOpen && presenterMode ? 'secondary' : 'ghost'} size="sm" onClick={() => { setSourcesOpen(false); setPresenterMode(true); }}><MonitorUp /> Presentador</Button><Button variant={sourcesOpen ? 'secondary' : 'ghost'} size="sm" onClick={() => setSourcesOpen(true)}>Fuentes</Button></div>
    </header>

    <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav className="border-b border-[#6c2330]/15 p-4 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#75555a]">Recorrido</p><div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-1">{slides.map((slide, index) => <button key={slide.index} onClick={() => { setSourcesOpen(false); setActive(index); }} className={`flex items-center gap-3 px-2 py-2 text-left transition ${!sourcesOpen && index === active ? 'bg-[#9c1f31] text-[#fffaf6]' : 'text-[#75555a] hover:bg-[#f4e3df] hover:text-[#42191f]'}`}><span className="font-mono text-xs">{slide.index}</span><span className="hidden text-sm font-medium sm:inline lg:inline">{slide.section}</span></button>)}</div><button onClick={() => setSourcesOpen(true)} className={`mt-4 flex w-full items-center gap-3 border-t border-[#6c2330]/15 px-2 pt-4 text-left text-sm font-medium transition ${sourcesOpen ? 'text-[#9c1f31]' : 'text-[#75555a] hover:text-[#42191f]'}`}><ExternalLink className="size-3" /> Fuentes y lecturas</button><p className="mt-5 border-t border-[#6c2330]/15 pt-4 text-xs leading-relaxed text-[#75555a]"><span className="block font-mono text-[#9c1f31]">35 min</span>de contenido + 5 min de preguntas</p></nav>

      <section className="relative overflow-hidden px-5 py-7 sm:px-8 sm:py-12"><div className="absolute right-[-10%] top-[-15%] size-[440px] rounded-full border border-[#9c1f31]/10" aria-hidden="true" /><div className="relative mx-auto max-w-5xl">{sourcesOpen ? <SourcesLibrary /> : <><div className="mb-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.15em] text-[#9c1f31]"><span>{current.section}</span><span>{current.index} / {String(slides.length).padStart(2, '0')}</span></div>
        {!presenterMode ? <div className="grid gap-10 lg:grid-cols-[1.03fr_.97fr] lg:items-center"><div><h1 className="max-w-3xl text-4xl font-semibold tracking-[-.055em] text-[#2a171a] sm:text-6xl lg:text-7xl">{current.title}</h1><p className="mt-7 max-w-2xl text-xl leading-relaxed text-[#75555a] sm:text-2xl">{current.copy}</p><p className="mt-9 max-w-xl border-l-2 border-[#9c1f31] pl-4 text-sm leading-relaxed text-[#75555a]">{current.annotation}</p></div><div className="space-y-4"><Diagram visual={current.visual} step={current.step} coverageMode={coverageMode} setCoverageMode={setCoverageMode} />{current.code && <div className="border border-[#6c2330]/15 bg-[#f8eeea] p-5"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#75555a]"><Code2 className="size-4 text-[#9c1f31]" /> Ejemplo</div><pre className="whitespace-pre-wrap font-mono text-[13px] leading-6"><RubyCode code={current.code} /></pre></div>}</div></div> : <div className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]"><div className="border border-[#9c1f31]/50 bg-[#fffdfb] p-6 sm:p-9"><div className="mb-9 flex items-center justify-between gap-4 text-sm font-semibold text-[#9c1f31]"><span className="flex items-center gap-2"><MonitorUp className="size-4" /> Modo presentador</span><span className="font-mono text-xs">{formatDuration(current.minutes)} · {formatElapsed(minutesBefore)}–{formatElapsed(minutesBefore + current.minutes)}</span></div><h1 className="text-3xl font-semibold tracking-[-.04em] sm:text-5xl">{current.title}</h1><p className="mt-4 text-xs font-mono text-[#75555a]">Plan de charla: 35 min de contenido + 5 min de preguntas</p><div className="mt-9 border-t border-[#6c2330]/15 pt-6"><p className="mb-4 text-[10px] font-bold uppercase tracking-[.15em] text-[#75555a]">Lo que conviene decir</p><ul className="space-y-4">{current.presenter.map((item) => <li key={item} className="flex gap-3 text-lg leading-relaxed text-[#42191f]"><Check className="mt-1 size-4 shrink-0 text-[#9c1f31]" />{item}</li>)}</ul></div></div><aside className="border border-[#6c2330]/15 bg-[#f8eeea] p-6 sm:p-8"><div className="mb-7 flex items-center gap-2 text-sm font-semibold"><MessageSquareText className="size-4 text-[#9c1f31]" /> Afirmaciones para comentar</div><ol className="space-y-4">{current.claims.map((claim, index) => <li key={claim} className="border-l border-[#6c2330]/20 pl-4 text-base leading-relaxed text-[#75555a]"><span className="mr-2 font-mono text-xs text-[#9c1f31]">0{index + 1}</span>{claim}</li>)}</ol><div className="mt-10 border-t border-[#6c2330]/15 pt-6 text-sm leading-relaxed text-[#75555a]">{current.annotation}</div></aside></div>}
        <footer className="mt-12 flex items-center justify-between border-t border-[#6c2330]/15 pt-5"><Button variant="ghost" size="sm" onClick={() => go(-1)} disabled={active === 0}><ArrowLeft /> Anterior</Button><div className="hidden items-center gap-2 text-xs text-[#75555a] sm:flex"><CircleDot className="size-3 text-[#9c1f31]" /> Flechas para navegar · P para presentador</div><Button variant="secondary" size="sm" onClick={() => go(1)} disabled={active === slides.length - 1}>Siguiente <ArrowRight /></Button></footer></>}
      </div></section>
    </div>
  </main>;
}
