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

## Cinco candidatos para la puerta de compatibilidad

| Proyecto | Sujetos automáticos fix/control | Primer sujeto fix | Primer control | Lectura |
| --- | ---: | --- | --- | --- |
| coursemology2 | 5 / 8 | `ApplicationController#handle_csrf_error` | `Course::Mailer#user_enrol_requested_email` | Candidato; métodos aún no equiparados. |
| dev.to | 6 / 8 | `DetailsTag#render` | `EmailDigest#send_periodic_digest_email` | Candidato; superficie grande, evaluar setup antes de elegirlo. |
| osem | 2 / 7 | `Ability#common_abilities_for_admins` | `TicketPurchasesController#index` | Candidato; pocos fixes automáticos, revisión manual acotada. |
| postal | 7 / 10 | `Postal#logger` | `Postal#logger` | Mejor señal estática inicial: el primer fix y control resuelven al mismo sujeto. |
| timeoverflow | 2 / 4 | `CategoriesHelper#all_categories` | `PetitionsController#update` | Candidato; métodos aún no equiparados. |

`diaspora` y `libraries.io` superaron la puerta de historial pero no resolvieron
un sujeto automático de fix y por eso no entran en estos cinco. `test_track`
también la superó mecánicamente, pero una revisión previa ya documentó que no
tiene un control de método comparable; sigue excluido.

Los manifiestos derivados por proyecto están en
`research/bug-fix-manifests/*-static-screen.csv`. El registro fila a fila de
todo el universo cubierto está en `research/historical-pair-candidates.csv`.

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

## Qué falta antes de cualquier ejecución

El número utilizable hoy es **cinco candidatos estáticos**, no cinco pares
válidos ni cinco aplicaciones ejecutables. Para uno de ellos, el siguiente
paso manual y todavía estático es seleccionar un fix y un control comparables
en tamaño y superficie. Recién después se fijará una celda idéntica de Ruby,
Bundler, Rails, Mutant, integración, perfil de operadores, worker y timeout;
ambos padres deberán pasar dos baselines verdes antes de ejecutar Mutant.

