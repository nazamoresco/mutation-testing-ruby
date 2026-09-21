# Handoff — piloto de Mutation Testing en Real World Rails

Este documento permite continuar la investigación sin depender del historial del chat.

## Pregunta de investigación

En aplicaciones Rails reales, ¿cuándo aporta valor ejecutar mutation testing y cuál es su coste técnico y de revisión? La meta no es maximizar un mutation score ni afirmar que todo mutante vivo es un bug; es producir datos trazables para una charla: adopción existente, viabilidad, coste, clases de decisiones y bugs confirmados.

## Estado al 2026-09-10

- Repositorio de trabajo: `nazamoresco/mutation-testing-ruby`.
- La charla web y el material editorial están en `main`.
- La línea de investigación vive en `research/real-world-rails-pilot`.
- Se clonó el índice de Real World Rails en un checkout local separado; su `.gitmodules` enumera **214** checkouts. El índice no contiene los apps completos: son submódulos de repositorios externos.
- El inventario estático quedó actualizado en la rama `research/real-world-rails-pilot` (commit `39616d7`): 214 filas, 199 repositorios/rama legibles y 15 accesos no disponibles. El detalle, los límites y los candidatos están en `research/INVENTORY.md`.
- `trailmix` fue seleccionado tras un baseline Docker reproducible: dos corridas de RSpec verdes (94 ejemplos, 0 fallas), sin flakiness observada. El detalle, el SHA y el límite de compatibilidad nativa macOS/OpenSSL están en `research/baselines/trailmix-2026-09-08.md`.
- El piloto acotado de Mutant ya corrió sobre tres sujetos de `trailmix`, en un checkout temporal con configuración local y reversible. Hubo 37 mutaciones, 36 killed, 1 alive y 0 timeouts. El detalle reproducible está en `research/mutant-runs/trailmix-2026-09-08.md`; la única fila viva está registrada y revisada en `research/mutants.csv`.
- No hay bugs confirmados. El mutante vivo `Time.zone.now` a `Time.now` en `Entry#for_today?` fue aceptado como `equivalent`: ambas expresiones terminan proyectando el mismo instante a la zona del usuario; la diferencia teórica de cruce de medianoche entre dos lecturas no se considera un contrato de dominio independiente.
- La corrida completa de Mutant sobre `trailmix` terminó el 2026-09-09: 111 sujetos, 3.098 mutaciones, 1.218 killed, 1.880 alive y 0 timeouts; Mutant tardó 561,28 s. El primer lanzamiento sin matcher devolvió 0 sujetos y fue invalidado; el runner de Mutant validó luego las 94 pruebas con 0 fallas. El informe completo está en `research/mutant-runs/trailmix-full-2026-09-09.md` y las 1.880 filas vivas sin clasificar están en `research/mutants.csv`.
- La primera pasada de triage repartió manifiestos compactos entre tres agentes: los 37 sujetos sin tests seleccionados (1.547 vivos) y 46 sujetos con tests seleccionados pero vivos (333; vista solapada) fueron agrupados por patrón. Los informes y la consolidación están en `research/triage/`. La lectura común es cobertura ausente, selección incompleta y límites externos sin especificar; no hay bugs confirmados ni clasificaciones individuales nuevas.
- La primera decisión aprobada, una tabla de estados para `Subscription#paid?`, se validó local y temporalmente: 5 ejemplos RSpec verdes y 12 de 12 mutaciones killed en 2,62 s, sin timeouts. Los 11 vivos de la sesión completa quedan revisados como `missing_test`; no hay bug confirmado ni cambio publicado en Trailmix. El detalle está en `research/mutant-runs/trailmix-subscription-paid-2026-09-10.md`.
- El alcance se redefinió: no se mejoran las aplicaciones de terceros. Se mide el valor, coste y viabilidad de Mutant en una cohorte comparativa. El protocolo está en `research/MULTI-APP-ANALYSIS-PLAN.md` y los datos distinguen `analysis_level=project` de futuros agregados `analysis_level=global` con `cohort_id`.
- La cohorte inicial aprobada `rwr-historical-8` cubre Rails 4 a 8.1 y RSpec/Minitest. Tras el baseline de ShinyCMS-ruby, el registro contiene nueve entradas: ShinyCMS-ruby queda visible como `baseline_failed` y `klaxon` es su reemplazo Rails 8.1 RSpec. El objetivo sigue siendo ocho corridas comparables válidas, no ocho instalaciones exitosas.
- ShinyCMS-ruby alcanzó 687 ejemplos en 3 min 8 s tras la preparación documentada de gems, JavaScript/MJML y Node/npm, pero falló una aserción de i18n por 84 claves faltantes. No se modifica el proyecto ni se ejecuta Mutant. El detalle está en `research/baselines/shinycms-ruby-2026-09-10.md`.
- Speakerline pasó dos baselines (66 ejemplos, 0 fallas) y la corrida completa de Mutant con el perfil `light`: 39 sujetos, 1.206 mutaciones, 612 killed, 594 alive y 0 timeouts en 365,61 s. Los 594 vivos quedan `unreviewed`, no son bugs. Nueve sujetos sin tests seleccionados explican 237 vivos. El detalle está en `research/mutant-runs/speakerline-full-2026-09-10.md`.
- Chatwoot queda descartado del estudio histórico: el padre `d3e4ff2dc1e2` reprodujo dos veces una única falla de `AgentBuilder` en suite completa (6.769 ejemplos, 1 falla, 67 pendientes), aunque el ejemplo pasa aislado. Su primer intento había sido inválido por falta de `pnpm`/Vite. Estado `baseline_flaky`; no ejecutar Mutant. El detalle está en `research/baselines/chatwoot-d3e4ff2dc1e2-2026-09-14.md`.
- Foodsoft queda descartado del estudio histórico: el padre `a8d5cbc8dbdc` no completó un baseline. La receta aislada corrigió la protección de DatabaseCleaner y añadió Chromium para Capybara, pero la suite se bloqueó después de los specs de sincronización de proveedores sin actividad de CPU ni navegador. Estado `baseline_failed`; no ejecutar Mutant. El detalle está en `research/baselines/foodsoft-a8d5cbc8dbdc-2026-09-15.md`.
- Huginn aprobó el baseline histórico del padre `fe300ef5087f`: dos pasadas completas de RSpec verdes, ambas con 1.670 ejemplos y 0 fallas (semillas 52735 y 22891). El runner aislado usa Ruby 3.2, Rails 6.1.7.3, PostgreSQL 16, Chromium/ChromeDriver 153 y un montaje Git de sólo lectura. Los intentos de infraestructura anteriores se excluyeron. La primera sonda válida de Mutant sobre `JobsHelper#agent_from_job` generó 88 mutaciones (1 killed, 87 alive, 0 timeouts); está aislada como `project` en `historical-bug-fix-pilot`, sin agregado global ni claim de bug. El detalle está en `research/mutant-runs/huginn-jobs-helper-agent-from-job-2026-09-21.md`.

## Material existente

- `docs/talk-brief.md`: tesis y estructura de la charla.
- `research/README.md`: objetivo, fases, métricas y fuentes.
- `research/apps.csv`: inventario por aplicación.
- `research/INVENTORY.md`: corte del inventario, accesos no disponibles, candidatos y próximo paso.
- `research/claims.csv`: afirmaciones y evidencia requerida.
- `research/mutants.csv`: una fila por mutante vivo o resultado no concluyente.
- `research/TRIAGE-PLAN.md`: lotes, contrato de salida y orquestación para revisar la corrida completa sin cargar el reporte entero en un solo contexto.
- `research/triage/consolidation-2026-09-10.md`: cobertura de la primera pasada, decisiones propuestas y orden de validación.
- `research/mutant-runs/trailmix-subscription-paid-2026-09-10.md`: validación temporal de la primera decisión de triage.
- `research/MULTI-APP-ANALYSIS-PLAN.md`: protocolo de la cohorte comparativa y reglas de agregación.
- `research/cohort-apps.csv`: composición, SHA y estado de cada entrada de la cohorte.
- `research/baselines/shinycms-ruby-2026-09-10.md`: primer resultado de viabilidad fallida de la cohorte.
- `research/baselines/speakerline-2026-09-10.md`: baseline verde de Speakerline.
- `research/mutant-runs/speakerline-full-2026-09-10.md`: primera corrida completa válida después de Trailmix.
- `plans/2026-08-31-research-and-talk.md`: ramas y próximos cortes útiles.

## Fuentes a conservar

- Real World Rails: <https://github.com/eliotsykes/real-world-rails>
- Mutant: <https://github.com/mbj/mutant>
- Just et al., *Are Mutants a Valid Substitute for Real Faults in Software Testing?*: <https://homes.cs.washington.edu/~rjust/publ/mutants_real_faults_tr_2014.pdf>
- Google Research, *Long Term Effects of Mutation Testing*: <https://research.google/pubs/long-term-effects-of-mutation-testing/>

Usar documentación primaria para versiones, licencia, compatibilidad y flags de Mutant. La documentación actual de Mutant indica soporte para Rails, RSpec y Minitest; su versión actual requiere Ruby moderno. Cada app debe verificarse contra una versión fijada: el corpus contiene proyectos de distintas épocas.

## Plan ejecutable

### 1. Inventario estático del corpus

Objetivo: saber qué proyectos ya declaran una herramienta de mutation testing, sin instalar ni ejecutar las 214 aplicaciones.

1. Parsear `.gitmodules` del índice y extraer `app_id`, URL, path y branch configurada.
2. Para cada URL, consultar de forma cacheada los archivos de raíz: `Gemfile`, `Gemfile.lock`, `.mutant.yml`, `mutant.yml`, `Rakefile`, `.rspec`, `test/`, `spec/` y workflows de CI cuando existan.
3. Detectar, al menos: `mutant`, `mutant-rspec`, `mutant-minitest`, `evilution`, `mutineer` y cualquier script de mutation testing.
4. Registrar también framework de tests, versión Ruby/Rails declarada, SHA o fecha de revisión, licencia si está clara y resultado de lectura (`found`, `not_found`, `unavailable`).
5. No inferir “no usa mutation testing” si no se pudo leer el repositorio.

**Criterio de salida:** `apps.csv` tiene una fila por checkout y cada campo ausente se distingue de un `not_found` confirmado.

### 2. Seleccionar un piloto

Objetivo: elegir una app representativa que pueda ejecutarse y mutarse sin convertir el setup en el experimento.

Puntuar candidatos con estas reglas:

- licencia de código abierto clara;
- Ruby y Rails compatibles con una versión soportada por la herramienta elegida;
- suite RSpec o Minitest presente;
- setup documentado y dependencias de infraestructura acotadas;
- al menos un método de dominio pequeño y significativo;
- sin credenciales reales ni acciones externas necesarias para la suite.

Registrar por qué se eligió el candidato y por qué se descartaron los demás. Si el primer candidato falla por compatibilidad o baseline, es un resultado de viabilidad: no arreglar ni modernizar la aplicación como parte del estudio.

### 3. Baseline reproducible

En un checkout aislado de la app piloto:

1. Fijar URL, SHA, Ruby, Bundler, Rails, SO y hora.
2. Instalar dependencias siguiendo el README, sin editar el proyecto de origen.
3. Preparar DB/servicios de test según su documentación y ejecutar la suite normal al menos dos veces.
4. Guardar duración, código de salida y flakiness observada.

**Criterio de salida:** una suite verde y razonablemente estable, o una incompatibilidad documentada que descarte el piloto.

### 4. Ejecutar Mutant de forma acotada

1. Usar una rama local de experimento dentro del checkout aislado; jamás enviar cambios al repositorio de terceros.
2. Añadir la configuración mínima y reversible para la integración detectada (RSpec/Minitest), incluyendo carga de Rails y aislamiento de DB si corresponde.
3. Usar la licencia/configuración adecuada para un repositorio abierto y fijar la versión de la herramienta.
4. Mutar **1–3 sujetos** pequeños, con selectores explícitos. No mutar toda la app como primera corrida.
5. Guardar comando, configuración, duración, número de mutantes, killed/alive/error/timeout y el reporte/sesión cruda. Exportar o parsear datos solo si la versión y edición usadas ofrecen un formato apto; no asumir JSON machine-readable en el flujo OSS.

**Criterio de salida:** al menos una corrida reproducible o una causa concreta de bloqueo (Ruby incompatible, runner, DB, flakiness, etc.).

### 5. Clasificar resultados vivos y no concluyentes

Para cada resultado, completar `research/mutants.csv` con una de estas categorías:

- `missing_test`: la semántica original importa y falta una especificación.
- `simplification`: el código original tiene semántica innecesaria; el mutante puede ser mejor.
- `equivalent`: no hay diferencia observable bajo el contrato actual.
- `environment_error`: no se pudo concluir por setup, crash o dependencia externa.
- `flaky`: el resultado no es estable.
- `possible_real_bug`: hay una discrepancia plausible con el comportamiento requerido; requiere confirmación.
- `out_of_scope`: el sujeto no era relevante para el piloto.

Un LLM puede recibir el diff del mutante, el método, tests relacionados y documentación relevante para **proponer** categoría, test candidato y preguntas. Guardar prompt, modelo, respuesta y coste estimado. Una persona debe registrar el veredicto final y la evidencia.

**Regla:** contar un `confirmed_real_bug` únicamente con una confirmación revisable: test que reproduce el problema, corrección validada o especificación explícita del proyecto. Nunca contar una conjetura del LLM como bug.

### 6. Analizar y comunicar

Separar siempre:

- apps del inventario vs. apps ejecutables;
- mutantes generados vs. resultados concluyentes;
- mutantes vivos vs. tests agregados;
- posibles bugs vs. bugs confirmados;
- tiempo de cómputo vs. tiempo humano/LLM.

Para la charla, mostrar el flujo, la muestra, sus límites y 1–2 decisiones concretas. Evitar porcentajes grandilocuentes si la muestra es pequeña.

## Guardrails

- No publicar PRs, issues ni comentarios en proyectos de terceros sin autorización explícita.
- No subir secretos, bases de datos, `vendor/`, reportes masivos ni credenciales al repositorio de la charla.
- Mantener los checkouts de terceros fuera de este repositorio.
- Registrar versiones exactas y comandos; no presentar resultados de una ejecución no reproducible.
- Si un LLM ve código de terceros, limitar el contexto a lo necesario y conservar solo datos derivados o permitidos.

## Corte actual y próximo paso

- Las corridas completas válidas son Trailmix y Speakerline; ambas están
  registradas como `analysis_level=project` y `cohort_id=rwr-historical-8`.
- ShinyCMS y Shipit Engine están `baseline_failed`; no ejecutar Mutant sobre
  ellas ni contar su setup o sus tests fallidos en estadísticas de mutantes.
- Klaxon aprobó dos baselines aislados en PostgreSQL con Ruby 3.4.8, Rails
  8.1.3.1 y RSpec; la evidencia está en `research/baselines/klaxon-2026-09-12.md`.
- Klaxon tiene una validación Mutant válida de `PageSnapshot#display_hash`:
  1 sujeto, 4 tests seleccionados, 15 mutaciones (1 killed, 14 vivos, 0
  timeouts) en 3,17 s. La corrida de aplicación completa posterior fue inválida
  por instrumentar 0 sujetos y está excluida de cualquier agregado.
- Shipit Engine requiere dependencias nativas (PostgreSQL, YAML y MySQL), Node y
  Git; su baseline limpio terminó con 1.245 tests, 4 fallas de caché Git de
  fixture y 0 errores en 364,28 s. La evidencia está en
  `research/baselines/shipit-engine-2026-09-11.md`.

- Huginn aprobó la puerta histórica de reproducibilidad: el padre
  `fe300ef5087f` pasó dos suites RSpec completas (1.670 ejemplos, 0 fallas en
  cada una). La sonda de `JobsHelper#agent_from_job` ya validó el bootstrap de
  Mutant con 1 sujeto y 5 tests seleccionados; sus 87 vivos están sin
  clasificación y no son bugs. Falta preparar un control con su propio baseline
  pre-fix antes de comparar grupos.

- El control automático `Agent#with_execution_lock` en `52cda2bc` aprobó dos
  baselines (1.866 ejemplos, 0 fallas) y su sonda obtuvo 26 mutaciones (16
  killed, 10 alive, 0 timeouts). La diferencia Ruby/Mutant con el fix impide
  estimar un efecto fix-versus-control; las filas siguen sólo a nivel project.

Próximo paso histórico: elegir el control automático más comparable, validar
dos baselines de su padre pre-fix y repetir una sonda con la receta temporal de
Huginn. Sólo entonces comparar `bug_fix` contra `nonfix_control`, manteniendo
las filas `project` separadas de cualquier agregado `global`. No publicar ni
modificar proyectos de terceros.
