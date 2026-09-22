# Postal — sondas históricas de Mutant — 2026-09-22

## Resultado y límite

Las dos sondas se ejecutaron con éxito técnico sobre `Postal.logger`: RSpec,
un worker, perfil `light`, timeout de 60 s, Mutant/Mutant-RSpec 0.17.0, Ruby
3.4.6, Rails 7.1.6 y el mismo lockfile overlay de Mutant (SHA-256
`c272a6d15ca21e58144eb75b7525363f8d20859dda7e312f5c02049a523541e8`).

| Rol histórico | Snapshot | Sujeto | Tests seleccionados | Mutaciones | Killed | Alive | Timeouts | Runtime | Killtime |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Fix parent | `d038eaa8` | `Postal.logger` | 130 | 58 | 1 | 57 | 0 | 150,26 s | 145,23 s |
| Control parent | `3be663dc` | `Postal.logger` | 130 | 58 | 1 | 57 | 0 | 136,74 s | 131,96 s |

El exit code `1` de ambas corridas significa que hubo mutantes vivos; no es un
error del runner. Los dos preflights de Mutant fueron verdes con 810 de 810
tests: 312,27 s para el fix parent y 278,87 s para el control parent.

## Exclusión de la estimación histórica

La revisión posterior del diff detectó que el fix `3be663dc` agrega
`Postal.process_identity` y cambia `Postal.process_name`; no cambia
`Postal.logger`. El control `ced77a386` sí cambia `Postal.logger`. La selección
estática previa confundió métodos singleton definidos dentro de `class << self`
con métodos de instancia y propuso incorrectamente `Postal#logger`.

Por eso, las dos corridas de `Postal.logger` son evidencia válida de viabilidad
focal a nivel `project`, pero están excluidas de `bug_fix` versus
`nonfix_control`: no mutan el método afectado por el bug-fix. Sus 57 vivos no
son bugs ni se clasificaron individualmente.

La corrida inicial con el selector inválido `Postal#logger` produjo cero
sujetos y también queda excluida.
