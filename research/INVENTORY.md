# Corte de inventario estático — Real World Rails

Fecha de corte: 2026-09-08
Rama: `research/real-world-rails-pilot`
Datos: `research/apps.csv` en el commit `39616d7`

## Alcance y método

Se leyó el índice de submódulos de Real World Rails sin inicializar, instalar ni ejecutar ninguna aplicación. Para cada checkout se consultaron de forma cacheada la metadata del repositorio, la rama configurada y los archivos o directorios relevantes: `Gemfile`, `Gemfile.lock`, `.mutant.yml`, `mutant.yml`, `Rakefile`, `.rspec`, `.ruby-version`, `.tool-versions`, `test/`, `spec/` y `.github/workflows/`.

`apps.csv` conserva el SHA de la rama configurada cuando fue accesible, los valores declarados de Ruby, Rails y licencia, y un estado de lectura por archivo en `notes`. Un valor `not_found` significa que se comprobó su ausencia; `unavailable` significa que no fue posible leer el repositorio o la rama y no permite inferir ausencia de mutation testing.

## Resultado

- 214 checkouts inventariados: una fila por entrada de `.gitmodules`.
- 199 repositorios y ramas configuradas legibles (93,0 %).
- 15 no disponibles (7,0 %): 11 ramas configuradas eliminadas o renombradas y 4 repositorios que respondieron 404.
- Una sola declaración de herramienta de mutation testing en los archivos revisados: `shinycms-ruby` declara `mutant` y `mutant-rspec`. No se encontró una configuración raíz de Mutant.

Este último dato es un resultado de detección estática, no una tasa de adopción general: no incluye los 15 accesos no disponibles y no prueba cómo se ejecuta una herramienta en la CI o en rutas no inspeccionadas.

### Accesos no disponibles

Ramas configuradas no accesibles: `askthem`, `bridge_troll`, `claim-for-crown-court-defence`, `git-scm`, `morph`, `octobox`, `planningalerts`, `publicwhip`, `rails-contributors`, `speakerinnen_liste` y `storytime`.

Repositorios no accesibles (404): `cartodb`, `heaven`, `hound` y `prison-visits`.

## Candidatos a piloto

| Prioridad | Aplicación | Evidencia estática | Riesgo que debe verificarse en baseline |
| --- | --- | --- | --- |
| Principal | `trailmix` | MIT; Ruby 3.4.2; Rails ~> 8.0.5; RSpec; dominio acotado de diario; `bin/setup` documentado. | PostgreSQL y Solid Queue. |
| Secundaria | `shinycms-ruby` | GPL-2.0; Ruby 3.4.5; Rails ~> 8.1.2; RSpec; única adopción detectada de Mutant. | PostgreSQL y Redis. |
| Alternativa | `speakerline` | MIT; Ruby 3.3.5; Rails 8.0.5.1; RSpec; setup de tests con PostgreSQL documentado. | Confirmar que reCAPTCHA no sea requisito de la suite. |

La recomendación era intentar primero `trailmix`. Quedó seleccionada como piloto ejecutable después del baseline reproducible descrito abajo.

### Resultado del primer baseline

El 2026-09-08, Ruby 3.4.2 no compiló contra OpenSSL 3.6.0 del host macOS. Para mantener el proyecto intacto, el baseline se ejecutó en un entorno Docker aislado. `trailmix` pasó dos corridas de RSpec (94 ejemplos, 0 fallas; 3,66 s y 3,35 s de RSpec), por lo que queda seleccionado. El detalle reproducible y los límites del entorno están en `research/baselines/trailmix-2026-09-08.md`.

## Siguiente paso

Preparar una configuración reversible de Mutant para `trailmix` en el mismo entorno Docker y elegir uno a tres métodos de dominio pequeños. Ejecutar únicamente esos sujetos, guardar el comando, versión, duración y reporte crudo, y no mutar toda la aplicación.
