# Cribado estático de pares históricos — 2026-09-22

## Decisión registrada

No se ejecutarán los 207 proyectos pendientes como una cohorte indiferenciada.
Para el experimento `bug_fix` versus `nonfix_control`, sólo avanzan proyectos
que superen primero un embudo estático y luego, por separado, la puerta de
compatibilidad exacta y baselines verdes. Esta pasada no instaló gems, no
ejecutó Rails, RSpec ni Mutant, y no modificó repositorios de terceros.

## Universo y cobertura

`apps.csv` fue normalizado para registrar a Camaleon CMS como `failed`: el
baseline nativo requiere Chrome 125, que Selenium Manager no puede ejecutar en
Linux arm64. Quedan 207 entradas `not_run` en el inventario.

El cribado histórico cubrió las 192 entradas que son a la vez `found` y
`not_run`. Las otras 15 permanecen fuera de alcance porque el inventario no
pudo leer sus repositorios; no se las interpreta como negativas.

Para cada entrada cubierta se aplicó, en orden, esta puerta estática:

1. licencia abierta clara, RSpec declarado, Ruby declarado >= 3.2 y Rails
   declarado >= 6.1;
2. hasta 100 commits del branch inventariado, buscando `fix:` o `fix(scope):`;
3. al menos un fix que cambie Ruby de producción y al menos un commit de control
   no parecido a un bug;
4. resolución local y de sólo lectura de métodos Ruby en hasta cinco fixes y
   cinco controles del historial reciente.

| Resultado | Proyectos |
| --- | ---: |
| Excluidos por metadata estática | 149 |
| Sin `fix:` convencional en 100 commits | 33 |
| Fixes sin cambio Ruby de producción | 2 |
| Excluido por cribado previo (Test Track) | 1 |
| Candidatos por historial antes de resolver métodos | 7 |
| Con sujeto automático tanto de fix como de control | 5 |

No quedaron errores de lectura de GitHub después de corregir el parser de URLs
con puntos en el nombre del repositorio. Los 15 accesos no disponibles son el
límite heredado del inventario, no fallas de esta corrida.

El primer motivo que excluyó a los 149 por metadata fue Ruby menor o no
declarado como compatible (63), licencia no clara (43), ausencia de RSpec (40)
o Rails menor/no declarado como compatible (3). Estas categorías son
excluyentes por el orden de la puerta; no describen defectos de los proyectos.

## Cinco candidatos para la puerta de compatibilidad

| Proyecto | Sujetos automáticos fix/control | Primer sujeto fix | Primer control | Lectura |
| --- | ---: | --- | --- | --- |
| coursemology2 | 5 / 8 | `ApplicationController#handle_csrf_error` | `Course::Mailer#user_enrol_requested_email` | Candidato; métodos aún no equiparados. |
| dev.to | 6 / 8 | `DetailsTag#render` | `EmailDigest#send_periodic_digest_email` | Candidato; superficie grande, evaluar setup antes de elegirlo. |
| osem | 2 / 7 | `Ability#common_abilities_for_admins` | `TicketPurchasesController#index` | Candidato; pocos fixes automáticos, revisión manual acotada. |
| postal | 7 / 10 | `Postal#logger` | `Postal#logger` | Mejor señal estática inicial: el primer fix y control resuelven al mismo sujeto. |
| timeoverflow | 2 / 4 | `CategoriesHelper#all_categories` | `PetitionsController#update` | Candidato; métodos aún no equiparados. |

`diaspora` y `libraries.io` superaron la puerta de historial. Se revisaron
después como reemplazos: Diaspora tiene un control de inicializador compatible
en runtime, pero el fix es una llamada de nivel superior y no un método Ruby
direccionable por Mutant. Libraries.io sí ofrece `PackageManager::Maven.mapping`
en ambos lados y especificaciones focales, pero el control corre Ruby 3.1.5 /
Rails 7.0.8.1 frente a Ruby 3.2.5 / Rails 7.1.5 del fix. Ambos quedan excluidos
del contraste causal, no catalogados como fallos de baseline. `test_track`
también la superó mecánicamente, pero una revisión previa ya documentó que no
tiene un control de método comparable; sigue excluido.

Los manifiestos derivados por proyecto están en
`research/bug-fix-manifests/*-static-screen.csv`. El registro fila a fila de
todo el universo cubierto está en `research/historical-pair-candidates.csv`.

## Inicio de los cinco candidatos

La revisión de los cinco métodos queda fijada en
`research/historical-pair-shortlist.csv`. `postal` es el primer candidato para
revisión de la celda de runtime: el fix y el control resuelven
`Postal#logger`; sus padres son adyacentes y el diff entre ellos cambia sólo
`lib/postal/config.rb`, por lo que mantiene sin drift estático la declaración
Ruby 3.4.6/Rails 7.1.6. Esto no reemplaza la puerta de runtime ni autoriza una
ejecución.

Los otros cuatro permanecen como candidatos, pero requieren seleccionar un
control de método comparable: Coursemology2 mezcla controlador y concern,
dev.to renderizado y mailer, OSEM dos capas de autorización y TimeOverflow
modelo y controlador. Ninguno avanza a baseline hasta resolver esa diferencia.

## Revisión de la cola de la cohorte vigente

La cola de viabilidad `rwr-historical-8` no debe confundirse con esta cohorte
de pares históricos. Para este último objetivo, sus cuatro entradas pendientes
no pasan la primera puerta:

| Proyecto en cola | Resultado estático para pares históricos |
| --- | --- |
| showterm.io | Minitest, no RSpec declarado. |
| pester | Ruby 2.5.3, fuera de la celda moderna >= 3.2. |
| reservations | Ruby 2.6.5, fuera de la celda moderna >= 3.2. |
| upcase | No `fix:` convencional en los últimos 100 commits. |

Esto no cambia su estado en la cohorte de viabilidad general: sólo indica que
no son el siguiente paso eficiente para el contraste histórico homogéneo.

## Cohortes separadas

La cohorte general `rwr-historical-8` responde otra pregunta: viabilidad y
coste de usar Mutant en ocho aplicaciones Rails de épocas, frameworks y
complejidad diversa. Incluye corridas completas válidas, bloqueos de baseline y
validaciones focalizadas; no exige commits convencionales ni compara fixes con
controles. La cohorte de pares históricos parte de los cinco candidatos de
esta nota y sólo medirá contraste `bug_fix`/`nonfix_control` cuando ambas
partes compartan una celda exacta y pasen baselines.

## Qué falta antes de cualquier ejecución

El número utilizable hoy es **cinco candidatos estáticos**, no cinco pares
válidos ni cinco aplicaciones ejecutables. Para uno de ellos, el siguiente
paso manual y todavía estático es seleccionar un fix y un control comparables
en tamaño y superficie. Recién después se fijará una celda idéntica de Ruby,
Bundler, Rails, Mutant, integración, perfil de operadores, worker y timeout;
ambos padres deberán pasar dos baselines verdes antes de ejecutar Mutant.

## Resolución posterior de candidatos — 2026-09-22

La revisión de métodos corrigió un límite del resolvedor automático: los
métodos definidos con `class << self` son singleton (`.`), no instancia (`#`).
Esta corrección redujo la cola de manera honesta:

| Proyecto | Decisión | Motivo |
| --- | --- | --- |
| CourseMology2 | Excluido | Sus controles del mismo método usan Rails 6.0.6.1 frente a Rails 8.1.3.1 del fix. |
| OSEM | Excluido | El control de autorización más próximo usa Ruby/Rails/RSpec-Rails distintos. |
| TimeOverflow | Excluido | Los controles de categoría comparables son de Ruby 2.6/Rails 6.1; el control moderno es de otra superficie. |
| Postal | Excluido del efecto | Las cuatro suites y dos sondas fueron válidas, pero el fix cambia `Postal.process_name` y el control `Postal.logger`. |
| dev.to | Excluido | La imagen común normalizó Pry y construyó correctamente, pero el baseline serial del padre del fix emitió múltiples fallos RSpec; no se ejecutaron control ni Mutant. |

Por tanto, no queda un candidato histórico utilizable en la cola revisada. Los
resultados focalizados de Postal siguen registrados como viabilidad de Mutant a
nivel proyecto, pero no se agregan como evidencia de prevención de bugs.

## Cierre del screen histórico — 2026-09-23

Los nueve proyectos que alcanzaron revisión manual están resueltos: ocho por
incompatibilidad de runtime, ausencia de sujeto Mutant, superficie distinta o
subject mismatch; dev.to por baseline fallido. El resultado terminal de esta
cohorte es **cero pares fix/control válidos para una estimación causal**.

El informe de dev.to conserva la evidencia observada y el límite de captura
del conteo final en `research/baselines/devto-3cd0a548-2026-09-23.md`. No se
interpreta la ausencia de ese conteo como un cero ni se ejecuta Mutant después
de un baseline fallido.
