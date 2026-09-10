# Mutant completo — Speakerline

Estado: completada el 2026-09-10

## Alcance y entorno

- Repositorio y SHA: `https://github.com/nodunayo/speakerline.git` en
  `b71559f0fbe7c7a0e4a0bada91d6c900258e118e`.
- Alcance: 39 sujetos descubiertos por `source:app/**/*.rb`.
- Checkout: sandbox temporal sin `.git`; el checkout original quedó limpio y
  detached. No hubo commit, push, issue ni PR al repositorio de origen.
- Runner: Ruby 3.3.5, Rails 8.0.5.1, RSpec 8.0.4 y PostgreSQL 16 aislado.
- Mutant/Mutant-RSpec 0.16.3, perfil `light`, licencia `opensource`, un worker
  y timeout de 5 s por mutación. El límite global del contenedor fue 3.600 s.

## Validación previa

- Baseline: dos corridas verdes de 66 ejemplos; ver
  `research/baselines/speakerline-2026-09-10.md`.
- `mutant environment subject list`: 39 sujetos.
- `mutant test -j 1`: 66 éxitos, 0 fallas, 4,60 s de runtime.
- Sonda `EventInstance#name_and_year`: 1 sujeto, 9 mutaciones, 9 killed, 0
  alive y 0 timeouts en 1,48 s.

## Resultado final

| Medida | Resultado |
| --- | ---: |
| Sujetos | 39 |
| Mutaciones | 1.206 |
| Killed | 612 |
| Alive | 594 |
| Timeouts | 0 |
| Runtime de Mutant | 365,61 s |
| Killtime | 291,94 s |
| Duración de contenedor | 375,23 s |

- Sesión: `01a08bcb-9aef-7213-aaa5-6419bafaaf01`.
- El código 1 corresponde a mutaciones vivas, no a un error del runner.
- La cobertura de mutación de esta configuración fue 50,74 %.
- El perfil emitió 1.167 resultados `evil` (573 killed, 594 alive) y 39
  `neutral` (39 killed). `neutral` se informa por separado y no se interpreta
  como una diferencia semántica cubierta por la suite.

## Lectura inicial, sin clasificar bugs

Nueve sujetos no tuvieron tests seleccionados; reúnen 237 de los 594 vivos.
Los tres mayores fueron `UsersController#create` (66),
`ApplicationHelper#markdown` (53) y `NavigationHelper#header_link_class` (26).
Esto describe una superficie de cobertura ausente o selección incompleta, no
bugs confirmados. Los 594 vivos se agregaron a `research/mutants.csv` como
`project`, `rwr-historical-8` y `unreviewed` para muestreo humano posterior.

## Trazabilidad del reporte crudo

El JSON de la sesión se conserva fuera del repositorio en el sandbox temporal:
5.398.233 bytes y SHA-256
`0c189126420da5e379f3815be39321f2b58bb570352d30c1b5ca5244954cd589`.
El repositorio versiona los CSV derivados y este informe, no el reporte crudo.
